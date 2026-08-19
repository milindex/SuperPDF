import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Header from "../Header";

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

  it("renders primary navigation links", () => {
    render(<Header />);
    const primary = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(primary.getByRole("link", { name: "Split PDF" })).toHaveAttribute(
      "href",
      "/tools/split-pdf",
    );
    expect(primary.getByRole("link", { name: "Compress PDF" })).toHaveAttribute(
      "href",
      "/tools/compress",
    );
    expect(primary.getByRole("link", { name: "Merge PDF" })).toHaveAttribute(
      "href",
      "/tools/merge-pdf",
    );
  });

  it("renders the mega menu trigger", () => {
    render(<Header />);
    expect(
      screen.getByRole("button", { name: /All PDF Tools/ }),
    ).toBeInTheDocument();
  });
});
