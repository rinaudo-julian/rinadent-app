import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";

let mockPathname = "/dashboard";
const mockNavigationIntent = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: ReactNode;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  } & Record<string, unknown>) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        mockNavigationIntent(href);
      }}
      {...props}
    >
      {children}
    </a>
  )
}));

vi.mock("@/components/logout-button", () => ({
  LogoutButton: () => <button type="button">Logout</button>
}));

vi.mock("@/components/ui/sidebar", async () => {
  const React = await import("react");

  const passthrough = ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <div {...props}>{children}</div>
  );

  const SidebarMenuButton = ({
    asChild,
    isActive,
    children,
    ...props
  }: {
    asChild?: boolean;
    isActive?: boolean;
    children: ReactNode;
  } & HTMLAttributes<HTMLElement>) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ "data-active"?: string }>;

      return React.cloneElement(child, {
        "data-active": String(Boolean(isActive))
      });
    }

    return (
      <button data-active={String(Boolean(isActive))} {...props}>
        {children}
      </button>
    );
  };

  return {
    Sidebar: passthrough,
    SidebarHeader: passthrough,
    SidebarContent: passthrough,
    SidebarGroup: passthrough,
    SidebarGroupContent: passthrough,
    SidebarGroupLabel: passthrough,
    SidebarMenu: passthrough,
    SidebarMenuItem: passthrough,
    SidebarMenuButton,
    SidebarFooter: passthrough,
    SidebarRail: () => <div />
  };
});

describe("AppSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/dashboard";
    mockNavigationIntent.mockClear();
  });

  it("renders Tratamientos link pointing to /treatments", () => {
    render(<AppSidebar />);

    const treatmentsLink = screen.getAllByRole("link", { name: /Tratamientos/i })[0];
    expect(treatmentsLink.getAttribute("href")).toBe("/treatments");
  });

  it("marks Tratamientos as active on /treatments routes", () => {
    mockPathname = "/treatments";
    const { rerender } = render(<AppSidebar />);

    const linksAtRootRoute = screen.getAllByRole("link", { name: /Tratamientos/i });
    expect(linksAtRootRoute.some((link) => link.getAttribute("data-active") === "true")).toBe(true);

    mockPathname = "/treatments/history";
    rerender(<AppSidebar />);
    const linksAtNestedRoute = screen.getAllByRole("link", { name: /Tratamientos/i });
    expect(linksAtNestedRoute.some((link) => link.getAttribute("data-active") === "true")).toBe(true);
  });

  it("emits navigation intent when Tratamientos is clicked", async () => {
    const user = userEvent.setup();
    render(<AppSidebar />);

    const treatmentsLink = screen.getAllByRole("link", { name: /Tratamientos/i })[0];
    await user.click(treatmentsLink);

    expect(mockNavigationIntent).toHaveBeenCalledWith("/treatments");
  });
});
