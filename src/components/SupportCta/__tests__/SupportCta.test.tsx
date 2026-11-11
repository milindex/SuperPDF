import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SupportCta from "../SupportCta";
import { SITE_KOFI } from "@/lib/seo";

describe("SupportCta", () => {
  it("opens Ko-fi in a new tab with a safe rel", () => {
    render(<SupportCta />);

    const link = screen.getByRole("link", { name: /Buy me a coffee/ });
    expect(link).toHaveAttribute("href", SITE_KOFI);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("accepts a custom label", () => {
    render(<SupportCta label="Support SuperPDF" />);

    expect(
      screen.getByRole("link", { name: /Support SuperPDF/ }),
    ).toBeInTheDocument();
  });
});
