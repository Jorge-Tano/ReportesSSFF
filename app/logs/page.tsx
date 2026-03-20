import SyncLogsTable from './components/SyncPlLogsTable';

export default function SyncLogsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Logs de Sincronización</h1>
      <SyncLogsTable />
    </div>
  );
}