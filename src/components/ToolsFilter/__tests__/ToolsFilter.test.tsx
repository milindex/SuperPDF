import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ToolsFilter from "../ToolsFilter";
import { tools } from "@/data/homepage-tools";

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

describe("ToolsFilter", () => {
  it("renders the default 'All' view with tool cards", () => {
    render(<ToolsFilter tools={tools} />);
    expect(screen.getByText("Merge PDF")).toBeInTheDocument();
    expect(screen.getByText("Split PDF")).toBeInTheDocument();
    expect(screen.getByText("Compress PDF")).toBeInTheDocument();
  });

  it("filters tools by category", () => {
    render(<ToolsFilter tools={tools} />);
    fireEvent.click(screen.getByRole("button", { name: "Security" }));
    expect(screen.getByText("Protect PDF")).toBeInTheDocument();
    expect(screen.getByText("Unlock PDF")).toBeInTheDocument();
    expect(screen.queryByText("Merge PDF")).not.toBeInTheDocument();
  });

  it("shows subcategory pills for the Convert category", () => {
    render(<ToolsFilter tools={tools} />);
    expect(screen.queryByText("To PDF")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Convert" }));
    expect(screen.getByText("To PDF")).toBeInTheDocument();
    expect(screen.getByText("From PDF")).toBeInTheDocument();
  });

  it("shows a message when no tools match", () => {
    render(<ToolsFilter tools={[]} />);
    expect(screen.getByText("No tools found in this category.")).toBeInTheDocument();
  });
});
