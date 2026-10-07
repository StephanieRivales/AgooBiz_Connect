import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { CartProvider, useCart } from "./CartContext";

const product = {
  id: 41,
  name: "Celebration Cake",
  price: "450.00",
  stock: 3,
};

function CartHarness() {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const item = cart[0];
  return (
    <div>
      <button type="button" onClick={() => addToCart(product)}>Add product</button>
      <button type="button" onClick={() => item && updateQuantity(item, item.quantity + 1)}>Increase</button>
      <button type="button" onClick={() => item && updateQuantity(item, item.quantity + 1)}>Increase past stock</button>
      <button type="button" onClick={() => item && removeFromCart(item)}>Remove</button>
      <button type="button" onClick={clearCart}>Clear cart</button>
      <output aria-label="Cart contents">
        {cart.map((entry) => `${entry.product.name}: ${entry.quantity}`).join(", ") || "Empty"}
      </output>
    </div>
  );
}

function renderCart() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <CartHarness />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("user", JSON.stringify({ id: 9, role: "buyer" }));
});

test("adding a product confirms the action and persists cart content per buyer", () => {
  const view = renderCart();

  fireEvent.click(screen.getByRole("button", { name: "Add product" }));

  expect(screen.getByText("Added to cart")).toBeInTheDocument();
  expect(screen.getByLabelText("Cart contents")).toHaveTextContent("Celebration Cake: 1");
  expect(JSON.parse(localStorage.getItem("agoobiz-cart:9"))).toHaveLength(1);

  view.unmount();
  renderCart();
  expect(screen.getByLabelText("Cart contents")).toHaveTextContent("Celebration Cake: 1");
});

test("quantity updates respect available stock and cart actions persist", () => {
  renderCart();
  fireEvent.click(screen.getByRole("button", { name: "Add product" }));
  fireEvent.click(screen.getByRole("button", { name: "Increase" }));
  expect(screen.getByLabelText("Cart contents")).toHaveTextContent("Celebration Cake: 2");

  fireEvent.click(screen.getByRole("button", { name: "Increase past stock" }));
  expect(screen.getByLabelText("Cart contents")).toHaveTextContent("Celebration Cake: 3");
  fireEvent.click(screen.getByRole("button", { name: "Increase past stock" }));
  expect(screen.getByLabelText("Cart contents")).toHaveTextContent("Celebration Cake: 3");

  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(screen.getByLabelText("Cart contents")).toHaveTextContent("Empty");
  expect(JSON.parse(localStorage.getItem("agoobiz-cart:9"))).toEqual([]);
});

test("clears saved cart data after order completion", () => {
  renderCart();
  fireEvent.click(screen.getByRole("button", { name: "Add product" }));
  fireEvent.click(screen.getByRole("button", { name: "Clear cart" }));

  expect(screen.getByLabelText("Cart contents")).toHaveTextContent("Empty");
  expect(JSON.parse(localStorage.getItem("agoobiz-cart:9"))).toEqual([]);
});
