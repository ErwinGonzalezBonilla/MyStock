import AppShell from "./components/layout/AppShell";
import AppRouter from "./routes";
import { CompanyProvider } from "./context/CompanyContext";

function App() {
  return (
    <CompanyProvider>
      <AppShell>
        <AppRouter />
      </AppShell>
    </CompanyProvider>
  );
}

export default App;