import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ToolsFilter from "../ToolsFilter";
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

describe("ToolsFilter", () => {
  it("renders a short popular list by default", () => {
    render(<ToolsFilter />);
    expect(screen.getByText("Merge PDF")).toBeInTheDocument();
    expect(screen.getByText("Split PDF")).toBeInTheDocument();
    expect(screen.getByText("Compress PDF")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(`${TOOL_COUNT} tools`);
  });

  it("filters tools by category", () => {
    render(<ToolsFilter />);
    fireEvent.click(screen.getByRole("button", { name: "Security" }));
    expect(screen.getByText("Protect PDF")).toBeInTheDocument();
    expect(screen.getByText("Unlock PDF")).toBeInTheDocument();
    expect(screen.queryByText("Merge PDF")).not.toBeInTheDocument();
  });

  it("keeps the workflow card under every category filter", () => {
    render(<ToolsFilter />);
    const workflow = () => screen.getByRole("link", { name: /Workflow/ });
    expect(workflow()).toHaveAttribute("href", "/workflow");

    for (const category of [
      "Organize",
      "Convert",
      "Edit",
      "Security",
      "Optimize",
      "Create & forms",
    ]) {
      fireEvent.click(screen.getByRole("button", { name: category }));
      expect(workflow()).toBeInTheDocument();
    }
  });

  it("shows conversion direction filters for Convert", () => {
    render(<ToolsFilter />);
    expect(screen.queryByText("To PDF")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Convert" }));
    expect(screen.getByText("To PDF")).toBeInTheDocument();
    expect(screen.getByText("From PDF")).toBeInTheDocument();
  });

  it("searches names and descriptions", () => {
    render(<ToolsFilter />);
    fireEvent.change(screen.getByLabelText("Search tools"), {
      target: { value: "markdown" },
    });
    expect(screen.getByText("PDF to Markdown")).toBeInTheDocument();
    expect(screen.queryByText("Merge PDF")).not.toBeInTheDocument();
  });

  it("shows a message when no tools match", () => {
    render(<ToolsFilter />);
    fireEvent.change(screen.getByLabelText("Search tools"), {
      target: { value: "zzzz-no-match" },
    });
    expect(screen.getByText(/No tool matches/)).toBeInTheDocument();
  });
});
