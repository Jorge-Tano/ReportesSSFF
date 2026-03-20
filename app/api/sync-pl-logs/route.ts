import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page  = parseInt(searchParams.get('page')  || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const estado      = searchParams.get('estado');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin    = searchParams.get('fechaFin');
    const search      = searchParams.get('search');

    const offset = (page - 1) * limit;

    // WHERE dinámico — un solo contador de parámetros
    const conditions: string[] = ['1=1'];
    const values: unknown[] = [];
    let p = 1;

    if (estado) {
      conditions.push(`estado = $${p++}`);
      values.push(estado);
    }
    if (fechaInicio) {
      // Filtramos por created_at para que los filtros de fecha
      // correspondan al momento real de la sincronización
      conditions.push(`created_at >= $${p++}`);
      values.push(fechaInicio);
    }
    if (fechaFin) {
      conditions.push(`created_at <= $${p++}`);
      values.push(fechaFin);
    }
    if (search) {
      conditions.push(
        `(archivo ILIKE $${p} OR email_subject ILIKE $${p} OR entry_id ILIKE $${p})`
      );
      values.push(`%${search}%`);
      p++;
    }

    const where = conditions.join(' AND ');

    // Total
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM control_reportes WHERE ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Datos paginados — ordenados por created_at DESC
    const dataResult = await pool.query(
      `SELECT
         id,
         entry_id,
         archivo,
         total_registros,
         estado,
         version_dia,
         email_received_at,
         email_subject,
         fecha_proceso,
         created_at
       FROM control_reportes
       WHERE ${where}
       ORDER BY created_at DESC NULLS LAST, id DESC
       LIMIT $${p} OFFSET $${p + 1}`,
      [...values, limit, offset]
    );

    return NextResponse.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sync logs:', error);

    let errorMessage = 'Error al cargar los logs de sincronización';
    if (error instanceof Error) {
      if ('code' in error && (error as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
        errorMessage = 'No se pudo conectar a la base de datos.';
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}