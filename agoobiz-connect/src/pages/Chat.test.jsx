import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { messagesApi } from "../api/messagesApi";
import Chat from "./Chat";

jest.mock("../api/messagesApi", () => ({
  messagesApi: {
    getInbox: jest.fn(),
    getConversation: jest.fn(),
    send: jest.fn(),
  },
}));

const buyer = { id: 1, name: "Current Buyer", role: "buyer" };
const seller = { id: 2, name: "Local Seller", role: "seller" };

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("user", JSON.stringify(buyer));
  messagesApi.getInbox.mockResolvedValue([{
    id: 10,
    senderId: seller.id,
    receiverId: buyer.id,
    sender: seller,
    receiver: buyer,
    content: "Previous message",
    createdAt: new Date().toISOString(),
  }]);
  messagesApi.getConversation.mockResolvedValue({
    partner: seller,
    messages: [{
      id: 10,
      senderId: seller.id,
      receiverId: buyer.id,
      content: "Previous message",
      createdAt: new Date().toISOString(),
    }],
  });
});

test("opening a conversation and sending a message scroll only the chat panel", async () => {
  const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return this.classList?.contains("chat-messages") ? 850 : 0;
    },
  });

  try {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <Chat />
        </AuthProvider>
      </MemoryRouter>
    );

    await screen.findByPlaceholderText("Write a message...");
    const chatMessages = container.querySelector(".chat-messages");
    expect(chatMessages.scrollTop).toBe(850);
    expect(window.scrollY).toBe(0);

    chatMessages.scrollTop = 0;
    messagesApi.send.mockResolvedValue({
      id: 11,
      senderId: buyer.id,
      receiverId: seller.id,
      content: "Hello there",
      createdAt: new Date().toISOString(),
    });
    fireEvent.change(screen.getByPlaceholderText("Write a message..."), {
      target: { value: "Hello there" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(screen.getByText("Hello there")).toBeInTheDocument());
    expect(chatMessages.scrollTop).toBe(850);
    expect(window.scrollY).toBe(0);
  } finally {
    if (originalScrollHeight) {
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", originalScrollHeight);
    } else {
      delete HTMLElement.prototype.scrollHeight;
    }
  }
});
