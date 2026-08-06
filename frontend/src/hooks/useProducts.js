import { useState } from "react";

export default function useProducts() {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    description: "",
    buyPrice: "",
    sellPrice: "",
    stock: "",
  });

  const [products, setProducts] = useState([]);

  return {
    product,
    setProduct,
    products,
    setProducts,
  };
}