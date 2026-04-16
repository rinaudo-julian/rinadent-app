import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./login-form";

// Mock de Supabase
const mockSignInWithPassword = vi.fn();
const mockPush = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword
    }
  })
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Render", () => {
    it("renders the login form with email and password inputs", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Email")).toBeDefined();
      expect(screen.getByLabelText("Contraseña")).toBeDefined();
    });

    it("renders the submit button with correct text", () => {
      render(<LoginForm />);

      // React Strict Mode renders twice, so we use queryAll and take first
      const buttons = screen.queryAllByTestId("login-submit-button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("renders the card title and description", () => {
      render(<LoginForm />);

      // React Strict Mode renders twice, so we use queryAll and take first
      const descriptions = screen.queryAllByText(
        /Sistema de Gestión Odontológica/
      );
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe("Interaction", () => {
    it("updates email state when typing", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText<HTMLInputElement>("Email");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput.value).toBe("test@example.com");
    });

    it("updates password state when typing", () => {
      render(<LoginForm />);

      const passwordInput =
        screen.getByLabelText<HTMLInputElement>("Contraseña");
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(passwordInput.value).toBe("password123");
    });

    it("disables button when loading", async () => {
      mockSignInWithPassword.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      );

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Contraseña"
      ) as HTMLInputElement;
      const button = screen.queryAllByTestId("login-submit-button")[0];

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button.hasAttribute("disabled")).toBe(true);
      });
    });
  });

  describe("Error handling", () => {
    it('shows "Email o contraseña incorrectos" on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: "Invalid login credentials" }
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Contraseña"
      ) as HTMLInputElement;
      const form = emailInput.closest("form")!;

      fireEvent.change(emailInput, { target: { value: "wrong@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText("Email o contraseña incorrectos")
        ).toBeDefined();
      });
    });

    it("shows original error message for other errors", async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: "Network error" }
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Contraseña"
      ) as HTMLInputElement;
      const form = emailInput.closest("form")!;

      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeDefined();
      });
    });
  });

  describe("Success", () => {
    it("redirects to /dashboard on successful login", async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Contraseña"
      ) as HTMLInputElement;
      const form = emailInput.closest("form")!;

      fireEvent.change(emailInput, { target: { value: "valid@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "validpass" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });
  });
});
