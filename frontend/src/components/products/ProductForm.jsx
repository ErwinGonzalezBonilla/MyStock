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

        {/* IMAGEN */}

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

        {/* NOMBRE */}

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
            placeholder="Ej. Royal Canin Adult"
            required
          />

        </div>

        {/* SKU + BARCODE */}

        <div className="row">

          <div className="col-md-6 mb-3">

            <label className="form-label">
              SKU
            </label>

            <input
              type="text"
              className="form-control"
              name="sku"
              value={product.sku}
              onChange={handleChange}
              placeholder="PET-000001"
              maxLength="100"
              required
            />

            <div className="form-text">
              Identificador interno del producto.
            </div>

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Código de barras
            </label>

            <input
              type="text"
              className="form-control"
              name="barcode"
              value={product.barcode}
              onChange={handleChange}
              placeholder="Ej. 8431234567890"
              maxLength="100"
              inputMode="numeric"
              autoComplete="off"
            />

            <div className="form-text">
              Puedes introducirlo manualmente o con un lector.
            </div>

          </div>

        </div>

        {/* CATEGORÍA */}

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

            <option value="">
              Seleccione...
            </option>

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

        {/* DESCRIPCIÓN */}

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
            placeholder="Descripción del producto..."
          />

        </div>

        {/* PRECIOS + STOCK */}

        <div className="row">

          <div className="col-md-4 mb-3">

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
              step="0.01"
              required
            />

          </div>

          <div className="col-md-4 mb-3">

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
              step="0.01"
              required
            />

          </div>

          <div className="col-md-4 mb-3">

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
              step="1"
              required
            />

          </div>

        </div>

        {/* STOCK MÍNIMO */}

        <div className="mb-3">

          <label className="form-label">
            Stock mínimo
          </label>

          <input
            type="number"
            className="form-control"
            name="minStock"
            value={product.minStock}
            onChange={handleChange}
            min="0"
            step="1"
          />

          <div className="form-text">
            MyStock podrá utilizar este valor para avisarte cuando el stock sea bajo.
          </div>

        </div>

        {/* BOTÓN */}

        <button
          className={`btn mt-3 ${
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