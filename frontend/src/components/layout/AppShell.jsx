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

      {/* minWidth 0: sin esto, la columna crece hasta el ancho de su
          contenido más ancho (tablas, tarjetas) y aparece scroll
          horizontal en toda la página en vez de ajustarse. */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ minWidth: 0 }}
      >
        <Navbar />

        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}