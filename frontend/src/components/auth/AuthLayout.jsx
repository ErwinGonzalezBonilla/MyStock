import logo from "../../assets/images/mystock-logo.png";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center px-3 py-5"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background-color)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div className="text-center mb-4">
          <img
            src={logo}
            alt="MyStock"
            style={{ width: "170px", height: "auto" }}
          />
        </div>

        <div
          className="bg-white p-4 p-md-5"
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h1 className="h4 fw-bold mb-1">{title}</h1>

          {subtitle && (
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {footer && (
          <div className="text-center mt-4" style={{ color: "var(--text-secondary)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
