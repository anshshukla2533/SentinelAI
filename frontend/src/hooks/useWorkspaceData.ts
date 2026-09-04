import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../auth';
import type { IncidentRecord, LogRecord, MachineRecord, MetricRecord, ReportRecord, ServiceSummary } from '../types';

export function useWorkspaceData(selectedMachineId?: string) {
  const { getToken, status } = useAuth();
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const token = await getToken();
        const machineQuery = selectedMachineId ? `&machine_id=${encodeURIComponent(selectedMachineId)}` : '';
        const [machineResult, serviceResult, logResult, incidentResult, reportResult, metricResult] = await Promise.all([
          apiRequest<MachineRecord[]>('/machines', { authToken: token }),
          apiRequest<ServiceSummary[]>(`/services?${machineQuery.slice(1)}`, { authToken: token }),
          apiRequest<LogRecord[]>(`/logs?limit=100${machineQuery}`, { authToken: token }),
          apiRequest<IncidentRecord[]>('/incidents?limit=100', { authToken: token }),
          apiRequest<ReportRecord[]>('/reports?limit=40', { authToken: token }),
          apiRequest<MetricRecord[]>(`/metrics?limit=200${machineQuery}`, { authToken: token }),
        ]);

        if (!active) return;

        setMachines(machineResult);
        setServices(serviceResult);
        setLogs(logResult);
        setIncidents(incidentResult);
        setReports(reportResult);
        setMetrics(metricResult);
        setError('');
      } catch (requestError) {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Failed to load workspace data');
      }
    };

    void load();
    const intervalId = window.setInterval(load, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [getToken, status, selectedMachineId]);

  return { machines, services, logs, incidents, reports, metrics, error };
}
