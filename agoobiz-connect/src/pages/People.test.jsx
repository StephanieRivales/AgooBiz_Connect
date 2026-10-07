import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { usersApi } from "../api/usersApi";
import People from "./People";

jest.mock("../api/usersApi", () => ({
  usersApi: {
    discover: jest.fn(),
    getFollowing: jest.fn(),
    follow: jest.fn(),
    unfollow: jest.fn(),
  },
}));

function renderPeople() {
  return render(
    <MemoryRouter>
      <People />
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("explains when the connected backend does not expose discovery routes", async () => {
  const notFound = { response: { status: 404 } };
  usersApi.discover.mockRejectedValue(notFound);
  usersApi.getFollowing.mockRejectedValue(notFound);

  renderPeople();

  expect(await screen.findByText(/Account discovery isn't available on the connected server/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: /Following/ }));
  expect(screen.getByText(/Following isn't available on the connected server/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
});

test("keeps discovered accounts visible if the following list fails", async () => {
  usersApi.discover.mockResolvedValue([
    { id: 3, name: "Local Baker", role: "seller", isFollowing: false },
  ]);
  usersApi.getFollowing.mockRejectedValue({ response: { status: 500 } });

  renderPeople();

  expect(await screen.findByRole("heading", { name: "Local Baker" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: /Following/ }));
  expect(screen.getByText(/We couldn't load following/)).toBeInTheDocument();
});

test("retry reloads account discovery and followed accounts", async () => {
  usersApi.discover
    .mockRejectedValueOnce({ response: { status: 404 } })
    .mockResolvedValueOnce([{ id: 4, name: "Agoo Kitchen", role: "seller" }]);
  usersApi.getFollowing.mockRejectedValueOnce({ response: { status: 404 } })
    .mockResolvedValueOnce([]);

  renderPeople();
  fireEvent.click(await screen.findByRole("button", { name: "Try again" }));

  await waitFor(() => expect(screen.getByRole("heading", { name: "Agoo Kitchen" })).toBeInTheDocument());
  expect(usersApi.discover).toHaveBeenCalledTimes(2);
  expect(usersApi.getFollowing).toHaveBeenCalledTimes(2);
});
