import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../App.css";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    // TODO: replace with real order submission (API call)
    cart.forEach((item) => removeFromCart(item.product));
    navigate("/my-orders");
  };

  if (cart.length === 0) {
    return (
      <section className="cart-page">
        <h2 className="shop-title">Your Cart</h2>
        <p className="empty-state">Your cart is empty.</p>
        <Link to="/shop" className="auth-submit-btn cart-browse-link">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h2 className="shop-title">Your Cart</h2>

      <div className="cart-list">
        {cart.map(({ product, quantity }) => (
          <div className="cart-item" key={product.id}>
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => (e.target.style.display = "none")}
            />
            <div className="cart-item-info">
              <h4>{product.name}</h4>
              <p className="product-seller">by {product.seller}</p>
              <span className="product-price">₱{product.price}</span>
            </div>

            <div className="cart-qty-controls">
              <button onClick={() => updateQuantity(product, quantity - 1)}>−</button>
              <span>{quantity}</span>
              <button onClick={() => updateQuantity(product, quantity + 1)}>+</button>
            </div>

            <div className="cart-item-subtotal">
              ₱{(product.price * quantity).toFixed(2)}
            </div>

            <button className="remove-item-btn" onClick={() => removeFromCart(product)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <span>Total</span>
        <span className="cart-total-amount">₱{cartTotal.toFixed(2)}</span>
      </div>

      <button className="auth-submit-btn" onClick={handleCheckout}>
        Checkout
      </button>
    </section>
  );
}