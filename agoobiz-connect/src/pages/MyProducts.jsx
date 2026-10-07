import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { productsApi } from "../api/productsApi";
import { usersApi } from "../api/usersApi";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import Icon from "../components/Icon";
import "../App.css";

const categories = [
  "Birthday", "Fiesta", "Wedding",
  "Christmas / Noche Buena", "Baptismal", "Graduation", "Wake / Lamay",
];

const emptyForm = { name: "", description: "", category: categories[0], occasions: [], options: [], price: "", stock: "", image: "" };

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [orderHours, setOrderHours] = useState({ start: "05:00", end: "20:00" });
  const [savingHours, setSavingHours] = useState(false);
  const [hoursMessage, setHoursMessage] = useState("");
  const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState(null);

  const previewSrc = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (form.image) return resolveImageUrl(form.image);
    return null;
  }, [imageFile, form.image]);

  const loadProducts = useCallback(() => {
    if (!user) return;
    setLoading(true);
    productsApi.getMine(user.id)
      .then((data) => setProducts(
        Array.isArray(data)
          ? data.map((product) => ({ ...product, isAvailable: product.isAvailable !== false }))
          : []
      ))
      .catch(() => setError("We couldn't load your products right now."))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadProducts();
    usersApi.getMe()
      .then((profile) => setOrderHours({
        start: profile.orderCutoffStart || "05:00",
        end: profile.orderCutoffEnd || "20:00",
      }))
      .catch(() => setError("We couldn't load your order hours. Please refresh and try again."));
  }, [loadProducts]);

  const saveOrderHours = async (event) => {
    event.preventDefault();
    setSavingHours(true);
    setHoursMessage("");
    setError("");
    try {
      const profile = await usersApi.updateMe({
        orderCutoffStart: orderHours.start,
        orderCutoffEnd: orderHours.end,
      });
      setOrderHours({
        start: profile.orderCutoffStart,
        end: profile.orderCutoffEnd,
      });
      setHoursMessage("Your order hours have been saved.");
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't save your order hours.");
    } finally {
      setSavingHours(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      occasions: Array.isArray(product.occasions) && product.occasions.length
        ? product.occasions
        : [product.category],
      options: Array.isArray(product.options) ? product.options : [],
      price: product.price,
      stock: product.stock,
      image: product.image || "",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const updateOccasion = (occasion, checked) => {
    const occasions = checked
      ? [...form.occasions, occasion]
      : form.occasions.filter((selected) => selected !== occasion);
    setForm({ ...form, occasions, category: occasions[0] || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return;
    if (!form.occasions.length) {
      setError("Choose at least one celebration for this product.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("category", form.occasions[0] || form.category);
      payload.append("price", form.price);
      payload.append("stock", form.stock || 0);
      payload.append("occasions", JSON.stringify(form.occasions));
      payload.append("options", JSON.stringify(form.options));
      if (imageFile) payload.append("image", imageFile);

      if (editingId) {
        await productsApi.update(editingId, payload);
      } else {
        await productsApi.create(payload);
      }

      resetForm();
      loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message || "We couldn't save this product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (product) => {
    const isAvailable = !product.isAvailable;
    setUpdatingAvailabilityId(product.id);
    setError("");
    try {
      const response = await productsApi.update(product.id, { isAvailable });
      const updated = response.data?.data || response.data;
      if (!Object.prototype.hasOwnProperty.call(updated, "isAvailable")) {
        throw new Error("Restart the backend to enable saving product availability.");
      }
      setProducts((prev) => prev.map((item) =>
        item.id === product.id ? { ...item, ...updated } : item
      ));
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't update product availability.");
    } finally {
      setUpdatingAvailabilityId(null);
    }
  };

  const isPending = error.toLowerCase().includes("pending verification");

  return (
    <section className="seller-dashboard">
      <div className="seller-dash-header">
        <div>
          <h1>My Products</h1>
          <p className="seller-dash-sub">
            {user?.name || "Seller"} · {products.length} listing{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          disabled={!showForm && user?.verificationStatus !== "approved"}
          title={user?.verificationStatus !== "approved" ? "Your seller account must be approved to add products." : undefined}
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      <form className="dash-panel seller-order-hours" onSubmit={saveOrderHours}>
        <div>
          <h2>Daily order hours</h2>
          <p>Buyers can place orders for your products during these hours (Agoo, La Union time).</p>
        </div>
        <label>
          Opens
          <input
            type="time"
            value={orderHours.start}
            onChange={(event) => setOrderHours({ ...orderHours, start: event.target.value })}
            required
          />
        </label>
        <label>
          Closes
          <input
            type="time"
            value={orderHours.end}
            onChange={(event) => setOrderHours({ ...orderHours, end: event.target.value })}
            required
          />
        </label>
        <button className="btn-primary" type="submit" disabled={savingHours}>
          {savingHours ? "Saving..." : "Save order hours"}
        </button>
        {hoursMessage && <p className="seller-hours-success">{hoursMessage}</p>}
      </form>

      {error && <p className="auth-error">{error}</p>}
      {isPending && (
        <p className="pending-note">
          Your seller account is still being reviewed — you'll be able to list products as soon as it's approved.
        </p>
      )}

      {showForm && (
        <form className="dash-panel product-form" onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>
            {editingId ? "Edit product" : "New product"}
          </h2>

          <div className="product-image-upload">
            <div className="product-image-preview">
              {previewSrc ? (
                <img src={previewSrc} alt="Product preview" />
              ) : (
                <span className="product-placeholder">🍲</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
              />
              <p className="field-hint">JPG, PNG, or WEBP, up to 5MB.</p>
            </div>
          </div>

          <div className="product-form-grid">
            <input
              type="text"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <fieldset className="product-occasions-field">
              <legend>Celebrations this product is for</legend>
              <div className="product-occasion-options">
                {categories.map((occasion) => (
                  <label key={occasion}>
                    <input
                      type="checkbox"
                      checked={form.occasions.includes(occasion)}
                      onChange={(event) => updateOccasion(occasion, event.target.checked)}
                    />
                    {occasion}
                  </label>
                ))}
              </div>
            </fieldset>
            <input
              type="number"
              placeholder="Price (₱)"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Stock"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <input
              type="text"
              placeholder="Short description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="product-options-editor">
            <div className="product-options-heading">
              <div>
                <h3>Buyer choices</h3>
                <p>Add sizes, flavors, or other choices. Extra prices are added to the base price.</p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setForm({
                  ...form,
                  options: [...form.options, { name: "", choices: [{ name: "", extraPrice: "0" }] }],
                })}
              >
                + Add choice group
              </button>
            </div>
            {form.options.map((option, optionIndex) => (
              <div className="product-option-group" key={`option-${optionIndex}`}>
                <div className="product-option-group-heading">
                  <input
                    type="text"
                    placeholder="Choice group (e.g. Size)"
                    value={option.name}
                    onChange={(event) => setForm({
                      ...form,
                      options: form.options.map((item, index) =>
                        index === optionIndex ? { ...item, name: event.target.value } : item
                      ),
                    })}
                    required
                  />
                  <button
                    type="button"
                    className="btn-text-danger"
                    onClick={() => setForm({
                      ...form,
                      options: form.options.filter((_, index) => index !== optionIndex),
                    })}
                  >
                    Remove group
                  </button>
                </div>
                {option.choices.map((choice, choiceIndex) => (
                  <div className="product-choice-row" key={`choice-${optionIndex}-${choiceIndex}`}>
                    <input
                      type="text"
                      placeholder="Choice (e.g. Large)"
                      value={choice.name}
                      onChange={(event) => setForm({
                        ...form,
                        options: form.options.map((item, index) => index === optionIndex
                          ? {
                            ...item,
                            choices: item.choices.map((entry, entryIndex) =>
                              entryIndex === choiceIndex ? { ...entry, name: event.target.value } : entry
                            ),
                          }
                          : item
                        ),
                      })}
                      required
                    />
                    <label>
                      Extra price (₱)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={choice.extraPrice}
                        onChange={(event) => setForm({
                          ...form,
                          options: form.options.map((item, index) => index === optionIndex
                            ? {
                              ...item,
                              choices: item.choices.map((entry, entryIndex) =>
                                entryIndex === choiceIndex ? { ...entry, extraPrice: event.target.value } : entry
                              ),
                            }
                            : item
                          ),
                        })}
                        required
                      />
                    </label>
                    {option.choices.length > 1 && (
                      <button
                        type="button"
                        className="btn-text-danger"
                        onClick={() => setForm({
                          ...form,
                          options: form.options.map((item, index) => index === optionIndex
                            ? { ...item, choices: item.choices.filter((_, entryIndex) => entryIndex !== choiceIndex) }
                            : item
                          ),
                        })}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="product-add-choice"
                  onClick={() => setForm({
                    ...form,
                    options: form.options.map((item, index) => index === optionIndex
                      ? { ...item, choices: [...item.choices, { name: "", extraPrice: "0" }] }
                      : item
                    ),
                  })}
                >
                  + Add option
                </button>
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 12 }} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update product" : "Save product"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="shop-count">Loading your products...</p>
      ) : products.length === 0 ? (
        <div className="shop-empty">
          <span className="shop-empty-icon">🍲</span>
          <p>No products yet. Add your first listing.</p>
        </div>
      ) : (
        <div className="seller-products-panel">
          <div className="seller-products-grid">
            {products.map((p) => (
              <article className={`seller-product-card ${p.isAvailable ? "" : "unavailable"}`} key={p.id}>
                <div className="seller-product-image">
                  {p.image ? (
                    <img src={resolveImageUrl(p.image)} alt={p.name} />
                  ) : (
                    <span className="product-placeholder">🍲</span>
                  )}
                  <span className={`seller-product-status ${p.isAvailable ? "available" : "unavailable"}`}>
                    {p.isAvailable ? Number(p.stock) > 0 ? "Available" : "Out of stock" : "Not available"}
                  </span>
                </div>
                <div className="seller-product-card-body">
                  <div className="seller-product-card-heading">
                    <div>
                      <h2>{p.name}</h2>
                      <p>{Array.isArray(p.occasions) && p.occasions.length ? p.occasions.join(" · ") : p.category}</p>
                    </div>
                    <strong>₱{Number(p.price).toFixed(2)}</strong>
                  </div>
                  <div className="seller-product-stock">
                    <span>Stock</span>
                    <strong>{p.stock}</strong>
                    {p.stock <= 3 && p.isAvailable && <span className="seller-low-stock">Low stock</span>}
                  </div>
                  <div className="seller-product-actions">
                    <button type="button" className="admin-secondary-button" onClick={() => startEdit(p)}>
                      <Icon name="settings" size={16} /> Edit listing
                    </button>
                    <button
                      type="button"
                      className={`seller-availability-button ${p.isAvailable ? "make-unavailable" : "make-available"}`}
                      onClick={() => handleToggleAvailability(p)}
                      disabled={updatingAvailabilityId === p.id}
                    >
                      <Icon name={p.isAvailable ? "close" : "check"} size={16} />
                      {updatingAvailabilityId === p.id
                        ? "Saving..."
                        : p.isAvailable ? "Mark not available" : "Mark available"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}