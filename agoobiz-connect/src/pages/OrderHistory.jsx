import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../api/ordersApi";
import { reportsApi } from "../api/reportsApi";
import Icon from "../components/Icon";
import { Link } from "react-router-dom";
import "../App.css";

const statusColors = {
  Delivered: "status-delivered",
  Preparing: "status-preparing",
  "Out for Delivery": "status-preparing",
  Cancelled: "status-cancelled",
};

const filterTabs = ["All", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
const nextOrderStatuses = {
  Preparing: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [reportingOrderId, setReportingOrderId] = useState(null);
  const [reportReason, setReportReason] = useState("Harassment or abusive behavior");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccessOrderId, setReportSuccessOrderId] = useState(null);
  const [reportError, setReportError] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await ordersApi.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.response?.data?.message || "We couldn't load your orders right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    setActionError("");
    try {
      const updated = await ordersApi.updateStatus(orderId, status);
      setOrders((current) => current.map((order) =>
        order.id === orderId ? { ...order, status: updated.status } : order
      ));
    } catch (err) {
      setActionError(err.response?.data?.message || "We couldn't update this order.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const submitBuyerReport = async (event, order) => {
    event.preventDefault();
    setSubmittingReport(true);
    setReportError("");
    try {
      await reportsApi.submitUserReport({
        reportedUserId: order.buyer.id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSuccessOrderId(order.id);
      setReportDetails("");
      setReportingOrderId(null);
    } catch (err) {
      setReportError(err.response?.data?.message || "We couldn't submit your report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <section className="orders-page">
      <h2 className="shop-title">Order History</h2>
      {actionError && <p className="auth-error" role="alert">{actionError}</p>}

      <div className="order-filter-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            className={`order-filter-tab ${activeFilter === tab ? "active" : ""}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty-state">Loading your orders...</p>
      ) : loadError ? (
        <div className="orders-load-error">
          <p className="auth-error">{loadError}</p>
          <button type="button" className="orders-retry-button" onClick={fetchOrders} disabled={loading}>
            {loading ? "Loading..." : "Try again"}
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-state">
          <p className="empty-state">
            {orders.length === 0
              ? user?.role === "seller" ? "Orders containing your products will appear here." : "You haven't placed any orders yet."
              : "No orders match this filter."}
          </p>
          {orders.length === 0 && user?.role === "buyer" && (
            <Link to="/shop" className="orders-browse-link">Browse products</Link>
          )}
          {orders.length === 0 && user?.role === "seller" && (
            <Link to="/my-products" className="orders-browse-link">Manage products</Link>
          )}
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <button
                className="order-card-header order-card-toggle"
                onClick={() => toggleExpand(order.id)}
              >
                <div>
                  <h4>Order #{order.id}</h4>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="order-header-right">
                  <span className={`order-status ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                  <span className="order-expand-icon">
                    {expandedId === order.id ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedId === order.id && (
                <div className="order-card-details">
                  <ul className="order-items-list">
                    {order.OrderItems?.map((item) => (
                      <li key={item.id}>
                        <span>
                          {item.quantity}x {item.Product?.name || "Product"}
                          {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                            <small className="order-item-options">
                              {item.selectedOptions.map((option) => `${option.name}: ${option.choice}`).join(" · ")}
                            </small>
                          )}
                        </span>
                        <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  {(order.address || order.requestedDeliveryAt || order.fullName || order.phone) && (
                    <div className="order-meta">
                      {order.fullName && <p><strong>Buyer:</strong> {order.fullName}</p>}
                      {order.phone && <p><strong>Phone:</strong> {order.phone}</p>}
                      {order.address && <p><strong>Delivery Address:</strong> {order.address}</p>}
                      {order.requestedDeliveryAt && (
                        <p><strong>Requested arrival:</strong> {new Date(order.requestedDeliveryAt).toLocaleString("en-PH", {
                          timeZone: "Asia/Manila",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })} (Agoo time)</p>
                      )}
                      {user?.role === "seller" && (
                        <label className="seller-order-status-control">
                          Update order status
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order.id || !(nextOrderStatuses[order.status] || []).length}
                            onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                          >
                            <option key={order.status} value={order.status}>{order.status}</option>
                            {(nextOrderStatuses[order.status] || []).map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          {updatingOrderId === order.id && <span>Saving...</span>}
                        </label>
                      )}
                      {order.paymentMethod && (
                        <p><strong>Payment Method:</strong> {order.paymentMethod === "pending" ? "To be decided" : order.paymentMethod}</p>
                      )}
                    </div>
                  )}
                  {user?.role === "seller" && order.buyer?.id && (
                    <div className="order-buyer-report">
                      {reportSuccessOrderId === order.id ? (
                        <p className="report-success">Report sent to admins.</p>
                      ) : (
                        <button
                          type="button"
                          className="product-report-trigger"
                          onClick={() => {
                            setReportError("");
                            setReportingOrderId(reportingOrderId === order.id ? null : order.id);
                          }}
                        >
                          <Icon name="alert" size={16} />
                          {reportingOrderId === order.id ? "Cancel report" : "Report buyer"}
                        </button>
                      )}
                      {reportingOrderId === order.id && (
                        <form className="product-report-form order-report-form" onSubmit={(event) => submitBuyerReport(event, order)}>
                          <h2>Report this buyer</h2>
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
                              rows={3}
                            />
                          </label>
                          {reportError && <p className="auth-error">{reportError}</p>}
                          <button type="submit" className="btn-primary" disabled={submittingReport}>
                            {submittingReport ? "Submitting..." : "Submit report"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="order-card-footer">
                <span>Total</span>
                <span className="cart-total-amount">₱{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
