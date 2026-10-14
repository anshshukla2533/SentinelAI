import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth';
import { DashboardLayout } from '../components/layout';
import { LandingPage } from '../pages/Landing';
import { LoginPage } from '../pages/Login';
import { SignupPage } from '../pages/Signup';
import { DashboardPage } from '../pages/Dashboard';
import { DevicesPage } from '../pages/Devices';
import { MonitoringPage } from '../pages/Monitoring';
import { LogsPage } from '../pages/Logs';
import { AlertsPage } from '../pages/Alerts';
import { SettingsPage } from '../pages/Settings';
import { NotFoundPage } from '../pages/NotFound';
import { DocsPage } from '../pages/Docs';
import { AddSystemPage } from '../pages/AddSystem';
import { PrivateRoute } from './PrivateRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/signup"
            element={<SignupPage />}
          />
           <Route path="/docs" element={<DocsPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="add-system" element={<AddSystemPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

