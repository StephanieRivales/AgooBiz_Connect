import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider, useCart } from "../context/CartContext";
import Checkout from "./Checkout";
import { ordersApi } from "../api/ordersApi";

jest.mock("../api/ordersApi", () => ({
  ordersApi: {
    create: jest.fn(),
  },
}));

const product = { id: 21, name: "Test Tray", price: "300", stock: 5 };

function CheckoutHarness() {
  const { addToCart, cart } = useCart();
  const location = useLocation();
  return (
    <>
      <button type="button" onClick={() => addToCart(product)}>Add test item</button>
      <output aria-label="Cart item count">{cart.length}</output>
      <output aria-label="Current route">{location.pathname}</output>
      <Checkout />
    </>
  );
}

function renderCheckout() {
  localStorage.setItem("user", JSON.stringify({ id: 5, role: "buyer", name: "Buyer" }));
  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <AuthProvider>
        <CartProvider>
          <CheckoutHarness />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("successful test checkout omits payment method and clears the persisted cart", async () => {
  ordersApi.create.mockResolvedValue({ id: 12 });
  renderCheckout();
  fireEvent.click(screen.getByRole("button", { name: "Add test item" }));

  fireEvent.change(screen.getByPlaceholderText("Full Name"), { target: { value: "Test Buyer" } });
  fireEvent.change(screen.getByPlaceholderText("Phone Number"), { target: { value: "09123456789" } });
  fireEvent.change(screen.getByPlaceholderText("Delivery Address"), { target: { value: "Agoo, La Union" } });
  fireEvent.change(screen.getByLabelText(/Requested delivery date and time/), {
    target: { value: "2099-12-20T12:00" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Place Order/ }));

  await waitFor(() => expect(ordersApi.create).toHaveBeenCalledTimes(1));
  expect(ordersApi.create.mock.calls[0][0]).not.toHaveProperty("paymentMethod");
  await waitFor(() => expect(screen.getByLabelText("Cart item count")).toHaveTextContent("0"));
  expect(JSON.parse(localStorage.getItem("agoobiz-cart:5"))).toEqual([]);
  expect(screen.getByLabelText("Current route")).toHaveTextContent("/my-orders");
});

test("failed checkout keeps cart contents for correction and retry", async () => {
  ordersApi.create.mockRejectedValue({
    response: { data: { message: "Stock has changed." } },
  });
  renderCheckout();
  fireEvent.click(screen.getByRole("button", { name: "Add test item" }));

  fireEvent.change(screen.getByPlaceholderText("Full Name"), { target: { value: "Test Buyer" } });
  fireEvent.change(screen.getByPlaceholderText("Phone Number"), { target: { value: "09123456789" } });
  fireEvent.change(screen.getByPlaceholderText("Delivery Address"), { target: { value: "Agoo, La Union" } });
  fireEvent.change(screen.getByLabelText(/Requested delivery date and time/), {
    target: { value: "2099-12-20T12:00" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Place Order/ }));

  expect(await screen.findByText("Stock has changed.")).toBeInTheDocument();
  expect(screen.getByLabelText("Cart item count")).toHaveTextContent("1");
  expect(JSON.parse(localStorage.getItem("agoobiz-cart:5"))).toHaveLength(1);
});
