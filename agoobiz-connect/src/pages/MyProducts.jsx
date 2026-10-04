import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { productsApi } from "../api/productsApi";
import "../App.css";

const categories = [
  "Birthday", "Fiesta", "Wedding",
  "Christmas / Noche Buena", "Baptismal", "Graduation", "Wake / Lamay",
];

const emptyForm = { name: "", description: "", category: categories[0], price: "", stock: "", image: "" };

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    if (!user) return;
    setLoading(true);
    productsApi.getAll({ sellerId: user.id })
      .then((data) => setProducts(data || []))
      .catch(() => setError("We couldn't load your products right now."))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, [user]);

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return;

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        image: form.image,
      };

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

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this product? This can't be undone.")) return;
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("We couldn't delete this product. Please try again.");
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
        <button type="button" className="btn-primary" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

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
          <div className="product-form-grid">
            <input
              type="text"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <input
              type="text"
              placeholder="Short description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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
        <div className="dash-panel" style={{ padding: 0, overflow: "hidden" }}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category}</td>
                  <td>₱{Number(p.price).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={`status-badge ${p.stock > 0 ? "status-ready" : "status-pending"}`}>
                      {p.stock > 0 ? "Active" : "Out of stock"}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn-text-danger" style={{ color: "#1565c0" }} onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    {" "}
                    <button type="button" className="btn-text-danger" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}