import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { productsApi } from "../api/productsApi";
import "../App.css";
import "../styles/shop.css";

const categories = [
  "All", "Birthday", "Fiesta", "Wedding",
  "Christmas / Noche Buena", "Baptismal", "Graduation", "Wake / Lamay",
];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const data = await productsApi.getAll({
          search: searchTerm || undefined,
          category: category !== "All" ? category : undefined,
          buyerLat: location?.lat,
          buyerLng: location?.lng,
        });
        if (!cancelled) setProducts(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "We couldn't load products right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchTerm, category, location]);

  return (
    <section className="shop-page">
      <div className="shop-header">
        <div>
          <h1 className="shop-title">Browse occasion food</h1>
          <p className="shop-subtitle">Home-based kitchens across Agoo, La Union</p>
        </div>
        <button type="button" className="shop-location-btn" onClick={handleUseLocation} disabled={locating}>
          {locating ? "Locating..." : location ? "📍 Sorted near you" : "📍 Sort by nearest"}
        </button>
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

      {loading ? (
        <p className="shop-count">Loading products...</p>
      ) : error ? (
        <p className="auth-error">{error}</p>
      ) : (
        <>
          <p className="shop-count">{products.length} product{products.length !== 1 ? "s" : ""}</p>

          {products.length === 0 ? (
            <div className="shop-empty">
              <span className="shop-empty-icon">🍽️</span>
              <p>No products match your search.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}