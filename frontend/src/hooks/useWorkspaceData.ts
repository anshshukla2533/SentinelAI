import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import type { IncidentRecord, LogRecord, ReportRecord, ServiceSummary } from '../types';

export function useWorkspaceData() {
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [serviceResult, logResult, incidentResult, reportResult] = await Promise.all([
          apiRequest<ServiceSummary[]>('/services'),
          apiRequest<LogRecord[]>('/logs?limit=100'),
          apiRequest<IncidentRecord[]>('/incidents?limit=100'),
          apiRequest<ReportRecord[]>('/reports?limit=40'),
        ]);

        if (!active) return;

        setServices(serviceResult);
        setLogs(logResult);
        setIncidents(incidentResult);
        setReports(reportResult);
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
  }, []);

  return { services, logs, incidents, reports, error };
}

