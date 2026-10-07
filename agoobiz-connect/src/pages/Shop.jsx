import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { productsApi } from "../api/productsApi";
import "../App.css";
import "../styles/shop.css";

const categories = [
  "All", "Birthday", "Fiesta", "Wedding",
  "Christmas / Noche Buena", "Baptismal", "Graduation", "Wake / Lamay",
];

const getProductOccasions = (product) => {
  if (Array.isArray(product.occasions) && product.occasions.length) return product.occasions;
  if (typeof product.occasions === "string") {
    try {
      const parsed = JSON.parse(product.occasions);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      return [product.category].filter(Boolean);
    }
  }
  return [product.category].filter(Boolean);
};

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");

  useEffect(() => {
    productsApi.getAll()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setLoadError("We couldn't load the products right now. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const seller = p.seller?.name || "";
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        seller.toLowerCase().includes(q);
      const matchCat = category === "All" ||
        getProductOccasions(p).some((occasion) =>
          occasion.trim().toLowerCase() === category.toLowerCase()
        );
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

      <p className="shop-count">
        {loading ? "Loading products..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {loadError ? (
        <div className="shop-empty">
          <p>{loadError}</p>
        </div>
      ) : !loading && filtered.length === 0 ? (
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