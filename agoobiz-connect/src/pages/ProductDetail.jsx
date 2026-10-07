import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuthPrompt } from "../context/AuthPromptContext";
import { useAuth } from "../context/AuthContext";
import { reportsApi } from "../api/reportsApi";
import Icon from "../components/Icon";
import { productsApi } from "../api/productsApi";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import "../App.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { requireAuth } = useAuthPrompt();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("Harassment or abusive behavior");
  const [reportDetails, setReportDetails] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSelectedOptions({});

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

  const options = Array.isArray(product?.options) ? product.options : [];
  const allOptionsSelected = options.every((option) => selectedOptions[option.name]);
  const selectedChoices = options.map((option) => {
    const choice = option.choices.find((entry) => entry.name === selectedOptions[option.name]);
    return choice ? {
      name: option.name,
      choice: choice.name,
      extraPrice: Number(choice.extraPrice),
    } : null;
  }).filter(Boolean);
  const displayPrice = Number(product?.price || 0) + selectedChoices.reduce(
    (sum, choice) => sum + choice.extraPrice,
    0
  );

  const handleAddToCart = () => {
    requireAuth(() => addToCart(product, 1, selectedChoices));
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();
    setSendingReport(true);
    setReportError("");
    setReportMessage("");
    try {
      await reportsApi.submitUserReport({
        reportedUserId: product.sellerId || product.seller?.id,
        productId: product.id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportMessage("Your report has been submitted for admin review.");
      setReportDetails("");
      setShowReportForm(false);
    } catch (err) {
      setReportError(err.response?.data?.message || "We couldn't submit your report.");
    } finally {
      setSendingReport(false);
    }
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
            <div className="product-placeholder"><Icon name="package" size={36} /></div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-seller">by {sellerName}</p>
          {user && user.id !== Number(product.sellerId || product.seller?.id) && (
            <Link className="product-report-trigger" to={`/chat?user=${product.sellerId || product.seller?.id}`}>
              <Icon name="message-circle" size={16} />
              Message seller
            </Link>
          )}
          <p className="product-detail-category">{product.category}</p>
          {Array.isArray(product.occasions) && product.occasions.length > 0 && (
            <div className="product-occasion-tags">
              {product.occasions.map((occasion) => <span key={occasion}>{occasion}</span>)}
            </div>
          )}
          <p className="product-detail-price">₱{displayPrice.toFixed(2)}</p>
          <p className="product-detail-desc">{product.description}</p>
          {options.map((option) => (
            <label className="product-choice-select" key={option.name}>
              <span>{option.name}</span>
              <select
                value={selectedOptions[option.name] || ""}
                onChange={(event) => setSelectedOptions({
                  ...selectedOptions,
                  [option.name]: event.target.value,
                })}
                required
              >
                <option value="" disabled>Choose {option.name.toLowerCase()}</option>
                {option.choices.map((choice) => (
                  <option key={choice.name} value={choice.name}>
                    {choice.name}{Number(choice.extraPrice) > 0
                      ? ` (+₱${Number(choice.extraPrice).toFixed(2)})`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <p className="product-detail-stock">
            {product.isAvailable === false
              ? "Not currently available"
              : product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <button
            className="auth-submit-btn"
            onClick={handleAddToCart}
            disabled={product.isAvailable === false || product.stock <= 0 || !allOptionsSelected}
          >
            Add to Cart
          </button>
          {user && user.id !== Number(product.sellerId || product.seller?.id) && (
            <button
              type="button"
              className="product-report-trigger"
              onClick={() => setShowReportForm((visible) => !visible)}
            >
              <Icon name="alert" size={16} />
              {showReportForm ? "Cancel report" : "Report seller"}
            </button>
          )}
          {reportMessage && <p className="report-success">{reportMessage}</p>}
          {showReportForm && (
            <form className="product-report-form" onSubmit={handleReportSubmit}>
              <h2>Report this seller</h2>
              <label>
                Reason
                <select value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
                  <option>Harassment or abusive behavior</option>
                  <option>Fraud or suspicious activity</option>
                  <option>Unsafe or prohibited products</option>
                  <option>Repeated order abuse</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                What happened?
                <textarea
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  minLength={10}
                  maxLength={2000}
                  required
                  rows={4}
                />
              </label>
              {reportError && <p className="auth-error">{reportError}</p>}
              <button type="submit" className="btn-primary" disabled={sendingReport}>
                {sendingReport ? "Submitting..." : "Submit report"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}