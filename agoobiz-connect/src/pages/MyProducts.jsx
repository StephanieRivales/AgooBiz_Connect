import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const DEMO = [
  {
    id: 1,
    name: "Special Puto Bumbong",
    category: "Kakanin",
    price: 120,
    stock: 25,
    status: "Active",
  },
  {
    id: 2,
    name: "Lechon Manok (Half)",
    category: "Ulam",
    price: 280,
    stock: 8,
    status: "Active",
  },
  {
    id: 3,
    name: "Ensaymada Box of 6",
    category: "Pastries",
    price: 150,
    stock: 0,
    status: "Out of stock",
  },
];

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState(DEMO);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Kakanin",
    price: "",
    stock: "",
  });

  const categories = ["Kakanin", "Ulam", "Pastries", "Beverages", "Snacks", "Frozen"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const newProduct = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      status: Number(form.stock) > 0 ? "Active" : "Out of stock",
    };

    setProducts((prev) => [newProduct, ...prev]);
    setForm({ name: "", category: "Kakanin", price: "", stock: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <section className="seller-dashboard">
      <div className="seller-dash-header">
        <div>
          <h1>My Products</h1>
          <p className="seller-dash-sub">
            {user?.name || "Seller"} · {products.length} listing
            {products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form className="dash-panel product-form" onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>New product</h2>
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
                <option key={c} value={c}>
                  {c}
                </option>
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
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
            Save product
          </button>
        </form>
      )}

      {products.length === 0 ? (
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
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>{p.category}</td>
                  <td>₱{Number(p.price).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.status === "Active" ? "status-ready" : "status-pending"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-text-danger"
                      onClick={() => handleDelete(p.id)}
                    >
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