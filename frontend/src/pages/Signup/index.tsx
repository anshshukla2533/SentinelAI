import { Navigate, useNavigate } from 'react-router-dom';
import { AuthForm, AuthShell } from '../../components/common';
import { useAuth } from '../../auth';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthShell
      title="Create your Sentinel AI workspace"
      subtitle="Register once, then create your project, generate an API key, and install the agent on a device."
      rightTitle="Create Account"
      rightSubtitle="Your account gets a workspace dashboard and a scoped registration token for the agent."
    >
      <AuthForm
        buttonLabel="Create Account"
        onSubmit={async (email, password) => {
          await signup(email, password);
          navigate('/dashboard');
        }}
      />
    </AuthShell>
  );
}

