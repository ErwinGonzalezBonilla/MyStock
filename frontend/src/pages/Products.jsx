import { useState } from "react";

import ProductForm from "../components/products/ProductForm";
import ProductTable from "../components/products/ProductTable";

const EMPTY_PRODUCT = {
  id: "",
  name: "",
  category: "",
  description: "",
  buyPrice: "",
  sellPrice: "",
  stock: "",
  image: "",
};

export default function Products() {
  const [product, setProduct] = useState(EMPTY_PRODUCT);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setProduct((prev) => ({
      ...prev,
      image: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...product, id: editingId } : item
        )
      );

      setEditingId(null);
    } else {
      const newProduct = {
        ...product,
        id: crypto.randomUUID(),
      };

      setProducts((prev) => [...prev, newProduct]);
    }

    setProduct(EMPTY_PRODUCT);
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setProduct(EMPTY_PRODUCT);
    }
  };

  const handleEdit = (id) => {
    const selected = products.find((item) => item.id === id);

    if (!selected) return;

    setProduct({ ...selected });
    setEditingId(id);
  };

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid p-4">
      <h2 className="fw-bold mb-4">
        Productos
      </h2>

      <ProductForm
        product={product}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleImage={handleImage}
        editingIndex={editingId}
      />

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ProductTable
        products={filteredProducts}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />
    </div>
  );
}