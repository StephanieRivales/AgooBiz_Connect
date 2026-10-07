import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const STORAGE_PREFIX = "agoobiz-cart";

function storageKey(ownerId) {
    return ownerId == null ? null : `${STORAGE_PREFIX}:${ownerId}`;
}

function readCart(ownerId) {
    const key = storageKey(ownerId);
    if (!key) return { ownerId: null, items: [], error: "" };
    try {
        const saved = localStorage.getItem(key);
        if (!saved) return { ownerId, items: [], error: "" };
        const items = JSON.parse(saved);
        if (!Array.isArray(items)) throw new Error("The saved cart data has an invalid format.");
        const validItems = items.filter((item) =>
            item &&
            item.product &&
            item.product.id != null &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0
        );
        return {
            ownerId,
            items: validItems,
            error: validItems.length === items.length
                ? ""
                : "Some invalid saved cart items were removed.",
        };
    } catch (error) {
        return {
            ownerId,
            items: [],
            error: `Your saved cart couldn't be restored: ${error.message}`,
        };
    }
}

export function CartProvider({ children }) {
    const { user } = useAuth();
    const ownerId = user?.id ?? null;
    const [initialCart] = useState(() => readCart(ownerId));
    const [cartState, setCartState] = useState(initialCart);
    const [storageWarning, setStorageWarning] = useState(initialCart.error);
    const [notice, setNotice] = useState(null);
    const cart = cartState.ownerId === ownerId ? cartState.items : [];

    useEffect(() => {
        if (cartState.ownerId === ownerId) return;
        const restored = readCart(ownerId);
        setCartState(restored);
        setStorageWarning(restored.error);
    }, [cartState.ownerId, ownerId]);

    useEffect(() => {
        if (cartState.ownerId !== ownerId || cartState.error) return;
        const key = storageKey(ownerId);
        if (!key) return;
        try {
            localStorage.setItem(key, JSON.stringify(cartState.items));
            setStorageWarning("");
        } catch (error) {
            setStorageWarning(`Your cart is only saved for this session: ${error.message}`);
        }
    }, [cartState, ownerId]);

    useEffect(() => {
        if (!notice) return undefined;
        const timeout = window.setTimeout(() => setNotice(null), 3200);
        return () => window.clearTimeout(timeout);
    }, [notice]);

    const addToCart = (product, quantity = 1, selectedOptions = []) => {
        const optionKey = selectedOptions
            .map((option) => `${option.name}:${option.choice}`)
            .sort()
            .join("|");
        const cartItemId = `${product.id}:${optionKey}`;
        const unitPrice = Number(product.price) + selectedOptions.reduce(
            (total, option) => total + Number(option.extraPrice || 0),
            0
        );

        setCartState((previous) => {
            const items = previous.ownerId === ownerId ? previous.items : [];
            const existingItem = items.find((item) => item.id === cartItemId);
            const updatedItems = existingItem
                ? items.map((item) =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
                : [...items, {
                    id: cartItemId,
                    product,
                    quantity,
                    selectedOptions,
                    unitPrice,
                }];
            return { ownerId, items: updatedItems };
        });
        setNotice({
            id: Date.now(),
            productName: product.name,
            quantity,
        });
    };

    const removeFromCart = (cartItem) => {
        setCartState((previous) => ({
            ownerId,
            items: (previous.ownerId === ownerId ? previous.items : []).filter((item) =>
                cartItem.product ? item.id !== cartItem.id : item.product.id !== cartItem.id
            ),
        }));
    };

    const updateQuantity = (cartItem, newQuantity) => {
        const stock = Number(cartItem.product.stock);
        if (newQuantity > 0 && Number.isFinite(stock) && newQuantity > stock) return;
        if (newQuantity <= 0) {
            removeFromCart(cartItem);
            return;
        }
        setCartState((previous) => ({
            ownerId,
            items: (previous.ownerId === ownerId ? previous.items : []).map((item) =>
                item.id === cartItem.id ? { ...item, quantity: newQuantity } : item
            ),
        }));
    };

    const clearCart = () => {
        setCartState({ ownerId, items: [] });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
            {storageWarning && (
                <div className="cart-storage-warning" role="alert">
                    <Icon name="alert" size={17} />
                    <span>{storageWarning}</span>
                </div>
            )}
            {notice && (
                <div className="cart-add-notice" role="status" aria-live="polite" key={notice.id}>
                    <span className="cart-add-notice-icon"><Icon name="check" size={18} /></span>
                    <span><strong>Added to cart</strong><small>{notice.productName} · Qty {notice.quantity}</small></span>
                    <Link to="/cart" className="cart-add-notice-link">View cart</Link>
                    <button type="button" className="cart-add-notice-close" aria-label="Dismiss notification" onClick={() => setNotice(null)}>
                        <Icon name="close" size={17} />
                    </button>
                </div>
            )}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);

export default CartContext;
