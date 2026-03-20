import { useState, useEffect, useCallback } from 'react';

export interface SyncLog {
  id: number;
  entry_id: string;
  archivo: string | null;
  total_registros: number | null;
  estado: string | null;
  version_dia: number;
  email_received_at: string | null;
  email_subject: string | null;
  fecha_proceso: string | null;
  /** Timestamp real de cuándo se creó el log (cuándo ocurrió la sincronización) */
  created_at: string | null;
}

interface Filters {
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  search: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseSyncLogsProps {
  initialPage?: number;
  initialLimit?: number;
  initialEstado?: string;
  initialFechaInicio?: string;
  initialFechaFin?: string;
  initialSearch?: string;
}

interface UseSyncLogsReturn {
  logs: SyncLog[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: Filters;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<Filters>) => void;
  refresh: () => Promise<void>;
}

export function useSyncLogs({
  initialPage = 1,
  initialLimit = 10,
  initialEstado = '',
  initialFechaInicio = '',
  initialFechaFin = '',
  initialSearch = '',
}: UseSyncLogsProps = {}): UseSyncLogsReturn {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState<Filters>({
    estado: initialEstado,
    fechaInicio: initialFechaInicio,
    fechaFin: initialFechaFin,
    search: initialSearch,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.estado) params.append('estado', filters.estado);
      if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/sync-pl-logs?${params.toString()}`);

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Error al cargar los datos');
      }

      const data = await response.json();
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const setPage = (page: number) =>
    setPagination((prev) => ({ ...prev, page }));

  const setLimit = (limit: number) =>
    setPagination((prev) => ({ ...prev, page: 1, limit }));

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return {
    logs,
    loading,
    error,
    pagination,
    filters,
    setPage,
    setLimit,
    setFilters,
    refresh: fetchLogs,
  };
}