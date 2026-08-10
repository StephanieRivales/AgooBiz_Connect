import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import "../App.css";

// TODO: replace with real data from your backend/API
const sampleProducts = [
  { id: 1, name: "Pancit Canton", seller: "Nanay Cora's Kitchen", price: 120, category: "Pancit", image: "/products/pancit.jpg" },
  { id: 2, name: "Bibingka", seller: "Aling Rosa's Kakanin", price: 90, category: "Rice & Kakanin", image: "/products/bibingka.jpg" },
  { id: 3, name: "Lechon Kawali", seller: "Kuya Jun's Grill", price: 250, category: "Meat Dishes", image: "/products/lechon.jpg" },
  { id: 4, name: "Leche Flan", seller: "Sweet Treats by Marie", price: 150, category: "Desserts", image: "/products/flan.jpg" },
  { id: 5, name: "Fiesta Platter", seller: "Home Kitchen Bulacan", price: 850, category: "Party Platters", image: "/products/platter.jpg" },
];

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
  const [addedId, setAddedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const handleAdd = (product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const filteredProducts = useMemo(() => {
    return sampleProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, category]);

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

      {filteredProducts.length === 0 ? (
        <p className="empty-state">No products match your search.</p>
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
                <p className="product-seller">by {product.seller}</p>
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