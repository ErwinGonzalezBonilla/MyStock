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
  });

  const [products, setProducts] = useState([]);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setProducts([
      ...products,
      product,
    ]);

    setProduct({
      name: "",
      category: "",
      description: "",
      buyPrice: "",
      sellPrice: "",
      stock: "",
    });
  };

  return (
    <div className="container-fluid p-4">

      <h2 className="fw-bold mb-4">
        Productos
      </h2>

      <ProductForm
        product={product}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <ProductTable
        products={products}
      />

    </div>
  );
}