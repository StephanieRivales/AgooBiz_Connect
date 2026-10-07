import { render, screen } from "@testing-library/react";
import App from "./App";

test("shows AgooBiz Connect branding while the app initializes", () => {
  render(<App />);

  expect(screen.getByAltText("AgooBiz Connect")).toBeInTheDocument();
  expect(screen.getByText("Occasion food from Agoo's home kitchens")).toBeInTheDocument();
});
