import { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { productsApi } from "../api/productsApi";
import "../App.css";

const categories = [
  "All",
  "Pancit",
  "Rice & Kakanin",
  "Meat Dishes",
  "Desserts",
  "Party Platters",
];

export default function Shop() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        setError("We couldn't load the products right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAdd = (product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const sellerName = product.seller?.name || "";
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sellerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, category]);

  return (
    <section className="shop-page">
      <h2 className="shop-title">Browse Products</h2>

      <div className="search-filter-container shop-search">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for pancit, kakanin, lechon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading products...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="empty-state">
          {products.length === 0
            ? "No sellers have posted any products yet. Check back soon!"
            : "No products match your search."}
        </p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-wrap">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="product-seller">by {product.seller?.name || "Unknown Seller"}</p>
                <div className="product-footer">
                  <span className="product-price">₱{product.price}</span>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAdd(product)}
                  >
                    {addedId === product.id ? "Added ✓" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}