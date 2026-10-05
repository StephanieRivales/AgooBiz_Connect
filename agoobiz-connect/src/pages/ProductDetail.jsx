import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuthPrompt } from "../context/AuthPromptContext";
import { productsApi } from "../api/productsApi";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import "../App.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { requireAuth } = useAuthPrompt();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    productsApi.getById(id)
      .then((data) => { if (!cancelled) setProduct(data); })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "We couldn't find that product.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = () => {
    requireAuth(() => addToCart(product, 1));
  };

  if (loading) {
    return (
      <section className="product-detail-page">
        <p className="shop-count">Loading product...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-detail-page">
        <Link to="/shop" className="back-link">← Back to Shop</Link>
        <p className="auth-error">{error || "Product not found."}</p>
      </section>
    );
  }

  const sellerName = product.sellerName || product.seller?.name || "Local Seller";

  return (
    <section className="product-detail-page">
      <Link to="/shop" className="back-link">← Back to Shop</Link>

      <div className="product-detail-card">
        <div className="product-detail-image">
          {product.image ? (
            <img src={resolveImageUrl(product.image)} alt={product.name} />
          ) : (
            <div className="product-placeholder">🍲</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-seller">by {sellerName}</p>
          <p className="product-detail-category">{product.category}</p>
          <p className="product-detail-price">₱{Number(product.price).toFixed(2)}</p>
          <p className="product-detail-desc">{product.description}</p>
          <p className="product-detail-stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <button
            className="auth-submit-btn"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}