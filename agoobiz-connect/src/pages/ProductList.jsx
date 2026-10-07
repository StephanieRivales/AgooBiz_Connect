import { useState, useEffect } from "react";
import { productsApi } from "../api/productsApi";
import ProductCard from "../components/ProductCard";
import "../App.css";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("We couldn't load the products right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="shop-page">
        <h2 className="shop-title">All Products</h2>
        <p className="empty-state">Loading products...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shop-page">
        <h2 className="shop-title">All Products</h2>
        <p className="empty-state">{error}</p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="shop-page">
        <h2 className="shop-title">All Products</h2>
        <p className="empty-state">No sellers have posted any products yet. Check back soon!</p>
      </section>
    );
  }

  return (
    <section className="shop-page">
      <div className="shop-header">
        <div>
          <h1 className="shop-title">All Products</h1>
          <p className="shop-subtitle">Explore food and treats from local Agoo businesses.</p>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </section>
  );
}