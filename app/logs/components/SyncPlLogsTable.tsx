"use client";

import React, { useState } from 'react';
import { useSyncLogs } from '../hooks/useSyncPlLogs'; // ← Mantengo tu importación original
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const HEADERS = ['Archivo', 'Registros', 'Versión Día', 'Sincronizado en'];

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'completado', label: 'Completado' },
  { value: 'procesando', label: 'Procesando' },
  { value: 'error', label: 'Error' },
  { value: 'pendiente', label: 'Pendiente' },
];

const SyncLogsTable: React.FC = () => {
  const {
    logs,
    loading,
    error,
    pagination,
    filters,
    setPage,
    setLimit,
    setFilters,
    refresh,
  } = useSyncLogs(); // ← Usando tu hook original

  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch {
      return date;
    }
  };

  const timeAgo = (date: string | null) => {
    if (!date) return null;
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return null;
    }
  };

  const isRecent = (date: string | null) => {
    if (!date) return false;
    return new Date(date) > new Date(Date.now() - 2 * 60 * 60 * 1000);
  };

  // ── Descarga via Graph API ─────────────────────────────────────────────────

  const handleDownload = async (entryId: string, filename: string | null) => {
    if (!filename) return;
    setDownloadingFile(filename);
    setDownloadError(null);

    try {
      const params = new URLSearchParams({ entryId, filename });
      const response = await fetch(`/api/download-attachment?${params.toString()}`);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Error al descargar el archivo');
    } finally {
      setDownloadingFile(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner de error de descarga */}
      {downloadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-600">{downloadError}</p>
          <button
            onClick={() => setDownloadError(null)}
            className="ml-4 text-red-400 hover:text-red-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Filtros - Estilo más limpio */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
            Filtros
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder="Archivo, asunto, entry_id..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Sincronizado desde
              </label>
              <input
                type="datetime-local"
                value={filters.fechaInicio}
                onChange={(e) => setFilters({ fechaInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Sincronizado hasta
              </label>
              <input
                type="datetime-local"
                value={filters.fechaFin}
                onChange={(e) => setFilters({ fechaFin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({ estado: '', fechaInicio: '', fechaFin: '', search: '' })}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 0.7, 0.5, 0.35].map((op, i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-50 animate-pulse" style={{ opacity: op }} />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  {HEADERS.map((h, idx) => (
                    <th 
                      key={h} 
                      className={`px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-400 ${
                        idx === 0 ? 'text-left' : 'text-right'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                      No se encontraron registros
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => {
                    const isDownloading = downloadingFile === log.archivo;
                    const isLast = index === logs.length - 1;

                    return (
                      <tr 
                        key={log.id} 
                        className={`
                          ${!isLast ? 'border-b border-gray-100' : ''} 
                          hover:bg-emerald-50/30 transition-colors
                        `}
                      >
                        {/* Archivo */}
                        <td className="px-5 py-4 text-left">
                          {log.archivo ? (
                            <button
                              onClick={() => handleDownload(log.entry_id, log.archivo)}
                              disabled={isDownloading}
                              title="Descargar CSV desde Graph API"
                              className={`
                                flex items-center gap-2 text-sm font-medium transition-all
                                ${isDownloading 
                                  ? 'text-emerald-400 cursor-wait' 
                                  : 'text-emerald-600 hover:text-emerald-700 hover:underline'
                                }
                              `}
                            >
                              {isDownloading ? (
                                <>
                                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                  <span>Descargando…</span>
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    />
                                  </svg>
                                  <span>{log.archivo}</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* Registros */}
                        <td className="px-5 py-4 text-right font-mono text-sm text-gray-600">
                          {log.total_registros?.toLocaleString('es-CL') ?? '-'}
                        </td>

                        {/* Versión Día */}
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            v{log.version_dia}
                          </span>
                        </td>

                        {/* Sincronizado en */}
                        <td className="px-5 py-4 text-right">
                          {log.created_at ? (
                            <div className="flex items-center justify-end gap-2">
                              {isRecent(log.created_at) && (
                                <span
                                  className="inline-block h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"
                                  title="Sincronización reciente"
                                />
                              )}
                              <div>
                                <p className="text-gray-700 text-sm">{formatDate(log.created_at)}</p>
                                <p className="text-gray-400 text-xs">{timeAgo(log.created_at)}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Paginación */}
            {pagination.total > 0 && (
              <div className="border-t border-gray-200 bg-gray-50/50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Mostrando{' '}
                    <span className="font-medium text-emerald-600">
                      {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium text-emerald-600">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de <span className="font-medium text-emerald-600">{pagination.total}</span> resultados
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <select
                      value={pagination.limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                      <option value={100}>100 por página</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage(1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-colors"
                      >
                        ⟪
                      </button>
                      <button
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-colors"
                      >
                        ⟨
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50/50 rounded-lg">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-colors"
                      >
                        ⟩
                      </button>
                      <button
                        onClick={() => setPage(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-colors"
                      >
                        ⟫
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SyncLogsTable;