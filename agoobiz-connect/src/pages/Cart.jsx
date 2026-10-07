import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuthPrompt } from "../context/AuthPromptContext";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import Icon from "../components/Icon";
import "../App.css";

const currency = (value) => `₱${Number(value || 0).toFixed(2)}`;
const DELIVERY_FEE = 50;

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { requireAuth } = useAuthPrompt();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.unitPrice ?? Number(item.product.price)) * item.quantity,
    0
  );
  const total = subtotal + DELIVERY_FEE;

  const handleCheckout = () => {
    requireAuth(() => navigate("/checkout"));
  };

  if (cart.length === 0) {
    return (
      <main className="cart-page shop-cart-page">
        <div className="shop-cart-heading">
          <div>
            <span className="shop-cart-eyebrow">Your shopping bag</span>
            <h1>Your cart</h1>
          </div>
        </div>
        <div className="shop-cart-empty">
          <span className="shop-cart-empty-icon"><Icon name="shopping" size={32} /></span>
          <h2>Your cart is waiting for something delicious</h2>
          <p>Browse local sellers and add products for your next meal or celebration.</p>
          <Link to="/shop" className="shop-cart-checkout">Explore the shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page shop-cart-page">
      <div className="shop-cart-heading">
        <div>
          <span className="shop-cart-eyebrow">Your shopping bag</span>
          <h1>Your cart <span>({cart.reduce((count, item) => count + item.quantity, 0)} items)</span></h1>
        </div>
        <Link to="/shop" className="shop-cart-continue"><Icon name="arrowLeft" size={17} /> Continue shopping</Link>
      </div>

      <div className="shop-cart-layout">
        <section className="shop-cart-items" aria-label="Products in your cart">
          <div className="shop-cart-list-heading">
            <h2>Items in your cart</h2>
            <span>{cart.length} {cart.length === 1 ? "product" : "products"}</span>
          </div>
          {cart.map((cartItem) => {
            const { product, quantity } = cartItem;
            const unitPrice = cartItem.unitPrice ?? Number(product.price);
            const imageUrl = resolveImageUrl(product.image || product.imageUrl);
            const stockLimit = Number(product.stock);
            const atStockLimit = Number.isFinite(stockLimit) && quantity >= stockLimit;

            return (
              <article className="shop-cart-item" key={cartItem.id || product.id}>
                <div className="shop-cart-product-image">
                  <span className="shop-cart-image-placeholder"><Icon name="package" size={25} /></span>
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                  ) : null}
                </div>

                <div className="shop-cart-product-details">
                  <span className="shop-cart-seller">
                    <Icon name="store" size={14} />
                    {product.sellerName || product.seller?.name || "Local Seller"}
                  </span>
                  <h3>{product.name}</h3>
                  {(cartItem.selectedOptions || []).length > 0 && (
                    <div className="shop-cart-options">
                      {cartItem.selectedOptions.map((option) => (
                        <span key={option.name}>{option.name}: {option.choice}</span>
                      ))}
                    </div>
                  )}
                  <div className="shop-cart-price-mobile">{currency(unitPrice)} <span>each</span></div>
                  <div className="shop-cart-item-actions">
                    <div className="shop-cart-quantity" aria-label={`Quantity of ${product.name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => updateQuantity(cartItem, quantity - 1)}
                      >−</button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.name}`}
                        onClick={() => updateQuantity(cartItem, quantity + 1)}
                        disabled={atStockLimit}
                      >+</button>
                    </div>
                    <button
                      type="button"
                      className="shop-cart-remove"
                      onClick={() => removeFromCart(cartItem)}
                    >
                      <Icon name="trash" size={15} /> Remove
                    </button>
                  </div>
                </div>

                <div className="shop-cart-unit-price">
                  <span>Price</span>
                  <strong>{currency(unitPrice)}</strong>
                </div>
                <div className="shop-cart-line-total">
                  <span>Subtotal</span>
                  <strong>{currency(unitPrice * quantity)}</strong>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="shop-cart-summary">
          <h2>Order summary</h2>
          <div className="shop-cart-summary-row"><span>Subtotal</span><strong>{currency(subtotal)}</strong></div>
          <div className="shop-cart-summary-row"><span>Delivery fee</span><strong>{currency(DELIVERY_FEE)}</strong></div>
          <div className="shop-cart-summary-total"><span>Total</span><strong>{currency(total)}</strong></div>
          <p className="shop-cart-summary-note">Your requested delivery date and time can be set at checkout.</p>
          <button type="button" className="shop-cart-checkout" onClick={handleCheckout}>Continue to checkout</button>
          <Link to="/shop" className="shop-cart-keep-browsing">Keep browsing the shop</Link>
        </aside>
      </div>
    </main>
  );
}
