export type MetricRecord = {
  id: number;
  service_name: string;
  cpu: number;
  memory: number;
  disk?: number | null;
  network_sent?: number | null;
  network_recv?: number | null;
  load_average?: number | null;
  uptime?: number | null;
  hostname?: string | null;
  operating_system?: string | null;
  created_at?: string | null;
};

export type ServiceSummary = {
  id: number;
  name: string;
  hostname?: string | null;
  process_name?: string | null;
  status: string;
  created_at?: string | null;
  last_seen_at?: string | null;
  latest_metric?: MetricRecord | null;
  open_incidents_count: number;
};

export type LogRecord = {
  id: number;
  service_name: string;
  hostname?: string | null;
  level: string;
  message: string;
  source?: string | null;
  created_at?: string | null;
};

export type IncidentRecord = {
  id: number;
  service_id?: number | null;
  service_name: string;
  title: string;
  severity: string;
  status: string;
  created_at?: string | null;
  resolved_at?: string | null;
};

export type ReportRecord = {
  id: number;
  service_name: string;
  hostname?: string | null;
  risk_level: string;
  risk_score: number;
  summary: string;
  recommendation: string;
  predicted_failure?: string | null;
  likely_failure_at?: string | null;
  time_to_failure?: string | null;
  prevention_steps?: string | null;
  notification_target?: string | null;
  notification_sent: number;
  notification_error?: string | null;
  created_at?: string | null;
};
