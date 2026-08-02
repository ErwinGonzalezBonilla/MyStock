export default function Navbar() {
  return (
    <nav
      className="navbar bg-white border-bottom px-4"
      style={{ height: "70px" }}
    >
      <div className="container-fluid">

        <input
          className="form-control"
          type="text"
          placeholder="Buscar productos, clientes o ventas..."
          style={{ maxWidth: "400px" }}
        />

        <div className="d-flex align-items-center gap-3">

          <button className="btn btn-light">
            🔔
          </button>

          <div className="fw-semibold">
            Erwin
          </div>

        </div>

      </div>
    </nav>
  );
}
