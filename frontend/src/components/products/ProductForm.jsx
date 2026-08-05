export default function ProductForm({
  product,
  handleChange,
  handleSubmit,
  editingIndex,
}) {
  return (
    <div className="stat-card mb-4">

      <h4 className="mb-4">
        Nuevo Producto
      </h4>

      <form onSubmit={handleSubmit}>

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
          >
            <option value="">Seleccione...</option>
            <option>Alimentos</option>
            <option>Higiene</option>
            <option>Accesorios</option>
            <option>Juguetes</option>
            <option>Medicamentos</option>
            <option>Otros</option>
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
            />

          </div>

        </div>

        <button
  className="btn btn-primary mt-4"
  type="submit"
>
  {editingIndex !== null
    ? "Actualizar producto"
    : "Guardar producto"}
</button>

      </form>

    </div>
  );
}
