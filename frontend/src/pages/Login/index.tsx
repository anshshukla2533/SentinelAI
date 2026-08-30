import { Navigate, useNavigate } from 'react-router-dom';
import { AuthForm, AuthShell } from '../../components/common';
import { useAuth } from '../../auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthShell
      title="AI-Powered Threat Detection for a Safer Digital World"
      subtitle="Sign in to access your dashboard and keep your devices secure."
      rightTitle="Welcome Back!"
      rightSubtitle="Use your Sentinel AI account to manage devices, download the agent, and review telemetry."
    >
      <AuthForm
        buttonLabel="Sign In"
        onSubmit={async (email, password) => {
          await login(email, password);
          navigate('/dashboard');
        }}
      />
    </AuthShell>
  );
}

