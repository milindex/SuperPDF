import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import Header from "../Header";
import { TOOL_COUNT } from "@/registry/tools";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [k: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  it("renders the brand logo link", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "SuperPDF home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the primary navigation", () => {
    render(<Header />);
    const primary = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(primary.getByRole("link", { name: "Tools" })).toHaveAttribute(
      "href",
      "/tools",
    );
    expect(primary.getByRole("link", { name: "Workflow" })).toHaveAttribute(
      "href",
      "/workflow",
    );
    expect(primary.getByRole("link", { name: "How it works" })).toHaveAttribute(
      "href",
      "/#how-it-works",
    );
    expect(primary.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "/faq",
    );
  });

  it("opens search and lists tools", () => {
    render(<Header />);
    const trigger = screen.getByRole("button", { name: "Search tools" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Search tools" })).toBeVisible();
    expect(screen.getByLabelText(`Search ${TOOL_COUNT} PDF tools`)).toBeInTheDocument();
    expect(screen.getByText("Merge PDF")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(`Search ${TOOL_COUNT} PDF tools`), {
      target: { value: "markdown" },
    });
    expect(screen.getByText("PDF to Markdown")).toBeInTheDocument();
    expect(screen.queryByText("Merge PDF")).not.toBeInTheDocument();
  });
});
