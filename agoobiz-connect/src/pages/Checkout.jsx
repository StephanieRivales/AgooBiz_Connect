import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../api/ordersApi";
import "../App.css";

const paymentMethods = [
  {
    key: "cod",
    label: "Cash on Delivery",
    icon: "💵",
  },
  {
    key: "ewallet",
    label: "E-Wallet",
    icon: "📱",
  },
];

const eWalletOptions = [
  {
    key: "gcash",
    label: "GCash",
    icon: "💙",
  },
  {
    key: "maya",
    label: "Maya",
    icon: "💚",
  },
];

export default function Checkout() {
  const { cart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [eWallet, setEWallet] = useState("gcash");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryFee = cart.length > 0 ? 50 : 0;
  const grandTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !phone || !address) {
      setError(
        "Please fill in your name, phone number, and delivery address."
      );
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

    // Make sure an e-wallet provider is selected
    if (paymentMethod === "ewallet" && !eWallet) {
      setError("Please choose an e-wallet.");
      return;
    }

    setSubmitting(true);

    try {
      // Save the actual payment method.
      // Examples:
      // cod
      // gcash
      // maya
      const selectedPaymentMethod =
        paymentMethod === "ewallet" ? eWallet : "cod";

      await ordersApi.create({
        items: cart.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
        fullName,
        phone,
        address,
        notes,
        paymentMethod: selectedPaymentMethod,
      });

      cart.forEach((item) => removeFromCart(item.product));

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

        <p className="empty-state">
          Your cart is empty — add something before checking out.
        </p>

        <Link to="/shop" className="auth-submit-btn cart-browse-link">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <h2 className="shop-title">Checkout</h2>

      <div className="checkout-layout">

        {/* Delivery + Payment Form */}
        <form
          className="auth-form checkout-form"
          onSubmit={handlePlaceOrder}
        >
          <h3 className="checkout-section-title">
            Delivery Details
          </h3>

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
          />

          <textarea
            placeholder="Delivery notes (optional) — landmarks, gate code, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="checkout-notes"
          />

          {/* PAYMENT METHOD */}
          <h3 className="checkout-section-title">
            Payment Method
          </h3>

          <div className="payment-methods">

            {paymentMethods.map((method) => (
              <button
                type="button"
                key={method.key}
                className={`payment-option ${
                  paymentMethod === method.key ? "active" : ""
                }`}
                onClick={() => setPaymentMethod(method.key)}
              >
                <span className="payment-icon">
                  {method.icon}
                </span>

                {method.label}
              </button>
            ))}

          </div>

          {/* E-WALLET OPTIONS */}
          {paymentMethod === "ewallet" && (
            <div className="ewallet-options">

              <p className="ewallet-title">
                Choose E-Wallet
              </p>

              {eWalletOptions.map((wallet) => (
                <button
                  type="button"
                  key={wallet.key}
                  className={`payment-option ewallet-option ${
                    eWallet === wallet.key ? "active" : ""
                  }`}
                  onClick={() => setEWallet(wallet.key)}
                >
                  <span className="payment-icon">
                    {wallet.icon}
                  </span>

                  {wallet.label}
                </button>
              ))}

            </div>
          )}

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? "Placing Order..."
              : `Place Order — ₱${grandTotal.toFixed(2)}`}
          </button>

        </form>

        {/* ORDER SUMMARY */}
        <div className="checkout-summary">

          <h3 className="checkout-section-title">
            Order Summary
          </h3>

          <div className="checkout-summary-list">

            {cart.map(({ product, quantity }) => (
              <div
                className="checkout-summary-item"
                key={product.id}
              >
                <span>
                  {quantity}x {product.name}
                </span>

                <span>
                  ₱{(product.price * quantity).toFixed(2)}
                </span>
              </div>
            ))}

          </div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>

            <span>
              ₱{cartTotal.toFixed(2)}
            </span>
          </div>

          <div className="checkout-summary-row">
            <span>Delivery Fee</span>

            <span>
              ₱{deliveryFee.toFixed(2)}
            </span>
          </div>

          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>

            <span>
              ₱{grandTotal.toFixed(2)}
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}