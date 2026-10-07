import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuthPrompt } from "../context/AuthPromptContext";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import Icon from "./Icon";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { requireAuth } = useAuthPrompt();
  const navigate = useNavigate();
  if (!product) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      if (Array.isArray(product.options) && product.options.length > 0) {
        navigate(`/products/${product.id}`);
        return;
      }
      addToCart(product, 1);
    });
  };

  const img = resolveImageUrl(product.image || product.imageUrl);
  const seller = product.sellerName || product.seller?.name || "Local Seller";
  let occasions = product.occasions;
  if (typeof occasions === "string") {
    try {
      occasions = JSON.parse(occasions);
    } catch {
      occasions = [product.category];
    }
  }
  if (!Array.isArray(occasions) || occasions.length === 0) {
    occasions = [product.category].filter(Boolean);
  }
  const visibleOccasions = occasions.slice(0, 2);
  const additionalOccasions = occasions.length - visibleOccasions.length;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image">
          {img ? (
            <img
              src={img}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="product-placeholder"><Icon name="package" size={28} /></div>
          )}
          {visibleOccasions.length > 0 && (
            <span className="product-card-badges">
              {visibleOccasions.map((occasion) => (
                <span className="product-card-badge" key={occasion}>{occasion}</span>
              ))}
              {additionalOccasions > 0 && (
                <span className="product-card-badge product-card-badge-more">+{additionalOccasions}</span>
              )}
            </span>
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
      <button
        type="button"
        className="product-card-btn"
        onClick={handleAdd}
        disabled={product.isAvailable === false || product.stock <= 0}
      >
        {Array.isArray(product.options) && product.options.length > 0 ? "Choose options" : "Add to Cart"}
      </button>
    </article>
  );
}