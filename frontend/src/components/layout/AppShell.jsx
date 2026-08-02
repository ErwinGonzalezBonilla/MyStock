import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppShell({ children }) {
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F6F6F7",
      }}
    >
      <Sidebar />

      <div className="flex-grow-1 d-flex flex-column">
        <Navbar />

        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}