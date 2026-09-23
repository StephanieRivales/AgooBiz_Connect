import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "../App.css";
import "../styles/shop.css";

const categories = [
  "All", "Birthday", "Fiesta", "Wedding",
  "Christmas / Noche Buena", "Baptismal", "Graduation", "Wake / Lamay",
];

// Demo products for design (replace with API later)
const DEMO_PRODUCTS = [
  { id: 1, name: "Lechon (Whole, Small)", price: 3500, category: "Fiesta", image: "", seller: { name: "Aling Nena's Kitchen" } },
  { id: 2, name: "Pancit Malabon Tray", price: 850, category: "Birthday", image: "", seller: { name: "Don Yeahh Foods" } },
  { id: 3, name: "Biko Tray", price: 450, category: "Fiesta", image: "", seller: { name: "Macalva Bakes" } },
  { id: 4, name: "Embutido (Log, 6pcs)", price: 600, category: "Christmas / Noche Buena", image: "", seller: { name: "Agoo Coffee Co." } },
  { id: 5, name: "Leche Flan Tray", price: 350, category: "Wedding", image: "", seller: { name: "Sweet Agoo" } },
  { id: 6, name: "Buko Salad (Big)", price: 500, category: "Baptismal", image: "", seller: { name: "Tita Rosa" } },
];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products] = useState(DEMO_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const seller = p.seller?.name || "";
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        seller.toLowerCase().includes(q);
      const matchCat = category === "All" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, category]);

  return (
    <section className="shop-page">
      <div className="shop-header">
        <div>
          <h1 className="shop-title">Browse occasion food</h1>
          <p className="shop-subtitle">Home-based kitchens across Agoo, La Union</p>
        </div>
      </div>

      <div className="shop-toolbar">
        <input
          className="shop-search-input"
          type="text"
          placeholder="Search lechon, pancit malabon, biko..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="shop-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`shop-pill ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="shop-count">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="shop-empty">
          <span className="shop-empty-icon">🍽️</span>
          <p>No products match your search.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}