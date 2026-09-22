import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../App.css";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-placeholder">🍲</div>
        )}
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-seller">
          {product.sellerName || product.seller?.name || "Local Seller"}
        </p>
        <p className="product-card-price">
          ₱{Number(product.price || 0).toFixed(2)}
        </p>

        <button className="product-card-btn" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </Link>
  );
}