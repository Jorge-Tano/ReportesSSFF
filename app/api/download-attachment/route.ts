/**
 * /api/download-attachment/route.ts
 *
 * Recibe ?entryId=<messageId>&filename=<nombre.csv>
 * Usa Graph API para obtener el adjunto y lo retorna como blob
 * para que el navegador lo descargue directamente.
 *
 * Nota: utiliza el mismo token client_credentials que graphService.ts.
 * La capa API gratuita no requiere permisos delegados — sólo
 * Mail.Read con tipo Application en el tenant de Azure.
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Auth (idéntico a graphService.ts) ─────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSec = process.env.CLIENT_SEC;

  if (!tenantId || !clientId || !clientSec) {
    throw new Error('Faltan variables de entorno: TENANT_ID, CLIENT_ID o CLIENT_SEC');
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSec,
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  );

  const json = (await res.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!json.access_token) {
    throw new Error(
      `Error obteniendo token: ${json.error_description ?? JSON.stringify(json)}`
    );
  }
  return json.access_token;
}

// ── Helper: encontrar la carpeta Convenios ────────────────────────────────────

async function findConveniosFolderId(token: string, upn: string): Promise<string> {
  const subfolder = process.env.SUBFOLDER ?? 'Convenios';

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${upn}/mailFolders/Inbox/childFolders?$top=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error(`Error listando carpetas: ${res.status}`);
  }

  const data = (await res.json()) as {
    value: Array<{ id: string; displayName: string }>;
  };

  const folder = data.value.find(
    (f) => f.displayName.toLowerCase() === subfolder.toLowerCase()
  );

  if (!folder) {
    throw new Error(`Subcarpeta "${subfolder}" no encontrada en Inbox de ${upn}`);
  }

  return folder.id;
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const messageId = searchParams.get('entryId');
  const filename = searchParams.get('filename');

  if (!messageId || !filename) {
    return NextResponse.json(
      { error: 'Se requieren los parámetros entryId y filename' },
      { status: 400 }
    );
  }

  const upn = process.env.USER_UPN;
  if (!upn) {
    return NextResponse.json(
      { error: 'Falta variable de entorno USER_UPN' },
      { status: 500 }
    );
  }

  try {
    const token = await getAccessToken();
    const folderId = await findConveniosFolderId(token, upn);

    // 1. Listar adjuntos del mensaje para encontrar el id del adjunto por nombre
    const attListRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${upn}/mailFolders/${folderId}/messages/${messageId}/attachments?$select=id,name,contentType`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!attListRes.ok) {
      const err = await attListRes.text();
      throw new Error(`Error listando adjuntos: ${attListRes.status} — ${err}`);
    }

    const attList = (await attListRes.json()) as {
      value: Array<{ id: string; name: string; contentType: string }>;
    };

    const attachment = attList.value.find(
      (a) => a.name.toLowerCase() === filename.toLowerCase()
    );

    if (!attachment) {
      return NextResponse.json(
        { error: `No se encontró el adjunto "${filename}" en el mensaje` },
        { status: 404 }
      );
    }

    // 2. Descargar el contenido binario del adjunto
    const contentRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${upn}/mailFolders/${folderId}/messages/${messageId}/attachments/${attachment.id}/$value`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!contentRes.ok) {
      const err = await contentRes.text();
      throw new Error(`Error descargando adjunto: ${contentRes.status} — ${err}`);
    }

    const buffer = await contentRes.arrayBuffer();

    // 3. Devolver el blob con los headers de descarga correctos
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': attachment.contentType || 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.byteLength.toString(),
        // Evitar que el navegador cachee la descarga
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[download-attachment] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al descargar el archivo',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}