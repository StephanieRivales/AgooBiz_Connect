import { createContext, useContext, useState} from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    const addToCart = (product, quantity =1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { product, quantity }];
            }
        });
    };

    const removeFromCart = (product) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== product.id));
    };

    const updateQuantity = (product, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(product);
        } else {
            setCart((prevCart) =>
                prevCart.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);

export default CartContext;