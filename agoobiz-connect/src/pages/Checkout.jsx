import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../api/ordersApi";
import Icon from "../components/Icon";
import "../App.css";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [requestedDeliveryAt, setRequestedDeliveryAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.unitPrice ?? Number(item.product.price)) * item.quantity,
    0
  );
  const deliveryFee = cart.length > 0 ? 50 : 0;
  const grandTotal = cartTotal + deliveryFee;

const handlePlaceOrder = async (e) => {
  e.preventDefault();
  setError("");

  if (!fullName || !phone || !address) {
    setError("Please fill in your name, phone number, and delivery address.");
    return;
  }
  if (!/^\d{7,15}$/.test(phone.replace(/[\s-]/g, ""))) {
    setError("Please enter a valid phone number.");
    return;
  }
  if (cart.length === 0) {
    setError("Your cart is empty.");
    return;
  }

  setSubmitting(true);
  try {
    await ordersApi.create({
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || [],
      })),
      fullName,
      phone,
      address,
      notes,
      requestedDeliveryAt,
    });

    clearCart();
    navigate("/my-orders");
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.message ||
      "We couldn't place your order. Please try again.";
    setError(msg);
  } finally {
    setSubmitting(false);
  }
};

  if (cart.length === 0) {
    return (
      <section className="cart-page">
        <h2 className="shop-title">Checkout</h2>
        <p className="empty-state">Your cart is empty — add something before checking out.</p>
        <Link to="/shop" className="auth-submit-btn cart-browse-link">
          Browse Products
        </Link>
      </section>
    );
  }

  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() - currentTime.getTimezoneOffset());
  const minimumDeliveryTime = currentTime.toISOString().slice(0, 16);

  return (
    <section className="checkout-page">
      <h2 className="shop-title">Checkout</h2>

      <div className="checkout-layout">
        {/* Delivery + payment form */}
        <form className="auth-form checkout-form" onSubmit={handlePlaceOrder}>
          <h3 className="checkout-section-title">Delivery Details</h3>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <label className="checkout-delivery-time">
            Requested delivery date and time
            <input
              type="datetime-local"
              value={requestedDeliveryAt}
              min={minimumDeliveryTime}
              onChange={(event) => setRequestedDeliveryAt(event.target.value)}
              required
            />
            <span>All times are in Agoo, La Union time. Sellers will see your requested arrival time.</span>
          </label>
          <textarea
            placeholder="Delivery notes (optional) — landmarks, gate code, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="checkout-notes"
          />

          <div className="checkout-payment-notice">
            <Icon name="receipt" size={19} />
            <div>
              <strong>Payment can be decided later</strong>
              <p>This test order will be saved without a payment method. No payment is collected at checkout.</p>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? "Placing Order..." : `Place Order \u2014 \u20b1${grandTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Order summary */}
        <div className="checkout-summary">
          <h3 className="checkout-section-title">Order Summary</h3>

          <div className="checkout-summary-list">
            {cart.map((item) => (
              <div className="checkout-summary-item" key={item.id || item.product.id}>
                <span>
                  {item.quantity}x {item.product.name}
                  {(item.selectedOptions || []).map((option) => (
                    <small className="checkout-summary-option" key={option.name}>
                      {option.name}: {option.choice}
                    </small>
                  ))}
                </span>
                <span>₱{((item.unitPrice ?? Number(item.product.price)) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>₱{cartTotal.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Delivery Fee</span>
            <span>₱{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span>₱{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}