import { useState } from "react";

import ProductForm from "../components/products/ProductForm";
import ProductTable from "../components/products/ProductTable";

export default function Products() {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    description: "",
    buyPrice: "",
    sellPrice: "",
    stock: "",
    image: "",
  });

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setProduct({
      ...product,
      image: URL.createObjectURL(file),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedProducts = [...products, product];

    console.log(updatedProducts);

    setProducts(updatedProducts);

    setProduct({
      name: "",
      category: "",
      description: "",
      buyPrice: "",
      sellPrice: "",
      stock: "",
      image: "",
    });
  };

  const handleDelete = (index) => {
    const updatedProducts = products.filter(
      (_, i) => i !== index
    );

    setProducts(updatedProducts);
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
        editingIndex={null}
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
        handleEdit={() => {}}
      />

    </div>
  );
}