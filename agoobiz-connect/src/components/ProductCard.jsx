import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  if (!product) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const img = product.image || product.imageUrl;
  const seller = product.sellerName || product.seller?.name || "Local Seller";

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image">
          {img ? (
            <img src={img} alt={product.name} />
          ) : (
            <div className="product-placeholder">🍲</div>
          )}
          {product.category && (
            <span className="product-card-badge">{product.category}</span>
          )}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-title">{product.name}</h3>
          <p className="product-card-seller">{seller}</p>
          <p className="product-card-price">
            ₱{Number(product.price || 0).toFixed(2)}
          </p>
        </div>
      </Link>
      <button type="button" className="product-card-btn" onClick={handleAdd}>
        Add to Cart
      </button>
    </article>
  );
}