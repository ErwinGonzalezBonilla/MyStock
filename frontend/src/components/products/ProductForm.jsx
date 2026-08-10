import { PRODUCT_CATEGORIES } from "../../constants/productCategories";

export default function ProductForm({
  product,
  handleChange,
  handleSubmit,
  handleImage,
  editingIndex,
}) {
  return (
    <div className="stat-card mb-4">

      <h4 className="mb-4">
        {editingIndex ? "Editar Producto" : "Nuevo Producto"}
      </h4>

      <form onSubmit={handleSubmit}>

        <div className="mb-4">

          <label className="form-label fw-bold">
            Imagen del producto
          </label>

          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImage}
          />

        </div>

        {product.image && (

          <div className="text-center mb-4">

            <img
              src={product.image}
              alt="Producto"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "12px",
                border: "1px solid #ddd",
              }}
            />

          </div>

        )}

        <div className="mb-3">

          <label className="form-label">
            Nombre
          </label>

          <input
            type="text"
            className="form-control"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />

        </div>

        <div className="mb-3">

          <label className="form-label">
            Categoría
          </label>

          <select
            className="form-select"
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>

            {PRODUCT_CATEGORIES.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}

          </select>

        </div>

        <div className="mb-3">

          <label className="form-label">
            Descripción
          </label>

          <textarea
            rows="3"
            className="form-control"
            name="description"
            value={product.description}
            onChange={handleChange}
          />

        </div>

        <div className="row">

          <div className="col-md-4">

            <label className="form-label">
              Precio compra
            </label>

            <input
              type="number"
              className="form-control"
              name="buyPrice"
              value={product.buyPrice}
              onChange={handleChange}
              min="0"
              required
            />

          </div>

          <div className="col-md-4">

            <label className="form-label">
              Precio venta
            </label>

            <input
              type="number"
              className="form-control"
              name="sellPrice"
              value={product.sellPrice}
              onChange={handleChange}
              min="0"
              required
            />

          </div>

          <div className="col-md-4">

            <label className="form-label">
              Stock inicial
            </label>

            <input
              type="number"
              className="form-control"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              min="0"
              required
            />

          </div>

        </div>

        <button
          className={`btn mt-4 ${
            editingIndex
              ? "btn-warning"
              : "btn-primary"
          }`}
          type="submit"
        >
          {editingIndex
            ? "Actualizar producto"
            : "Guardar producto"}
        </button>

      </form>

    </div>
  );
}