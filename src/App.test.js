import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ResumeProvider } from "./context/ResumeContext";
import App from "./App";

test("renders the auth landing page with sign in option", () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <ResumeProvider>
          <App />
        </ResumeProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  // The AuthPage shows the brand title and Sign In / Sign Up tabs
  const brandTitle = screen.getByText(/Career Compass Hub/i);
  expect(brandTitle).toBeInTheDocument();

  const signInTab = screen.getByRole("button", { name: /sign in/i });
  expect(signInTab).toBeInTheDocument();
});