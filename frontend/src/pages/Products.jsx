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
  const [editingIndex, setEditingIndex] = useState(null);

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
    image: "",
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
        editingIndex={editingIndex}
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