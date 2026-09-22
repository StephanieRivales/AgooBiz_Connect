import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../App.css";

// Placeholder until you fetch from the API
const mockProduct = {
  id: 1,
  name: "Home-cooked Adobo",
  price: 120,
  description:
    "Classic Filipino adobo made with local ingredients. Perfect for a family meal.",
  category: "Main Course",
  sellerName: "Nanay's Kitchen",
  imageUrl: null,
  stock: 15,
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  // TODO: replace with real API call using `id`
  const product = { ...mockProduct, id: Number(id) || mockProduct.id };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <section className="product-detail-page">
      <Link to="/shop" className="back-link">
        ← Back to Shop
      </Link>

      <div className="product-detail-card">
        <div className="product-detail-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="product-placeholder">🍲</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-seller">by {product.sellerName}</p>
          <p className="product-detail-category">{product.category}</p>
          <p className="product-detail-price">₱{product.price.toFixed(2)}</p>
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