import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './theme';

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
