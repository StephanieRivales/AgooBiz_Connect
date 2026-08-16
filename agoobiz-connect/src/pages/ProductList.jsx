import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import "../App.css";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
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
      <h2 className="shop-title">All Products</h2>

      <div className="product-grid">
        {products.map((product) => (
          <Link
            to={`/products/${product.id}`}
            className="product-card product-card-link"
            key={product.id}
          >
            <div className="product-image-wrap">
              <img
                src={product.image}
                alt={product.name}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <div className="product-info">
              <span className="product-category">{product.category}</span>
              <h3>{product.name}</h3>
              <p className="product-seller">by {product.seller?.name || "Unknown Seller"}</p>
              <div className="product-footer">
                <span className="product-price">₱{product.price}</span>
                <span className="view-details-link">View Details →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}