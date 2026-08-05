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

  const [products, setProducts] = useState([
  {
    id: crypto.randomUUID(),
    name: "",

  }
]);

  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = (index) => {
  const updatedProducts = products.filter(
    (_, i) => i !== index
  );

  setProducts(updatedProducts);
};

const handleEdit = (index) => {
  setProduct(products[index]);
  setEditingIndex(index);
};

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      const updatedProducts = [...products];

      updatedProducts[editingIndex] = product;

      setProducts(updatedProducts);

      setEditingIndex(null);
    } else {
      setProducts([
        ...products,
        product,
      ]);
    }

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
        editingIndex={editingIndex}
      />

      <ProductTable
  products={products}
  handleDelete={handleDelete}
  handleEdit={handleEdit}
/>

    </div>
  );
}