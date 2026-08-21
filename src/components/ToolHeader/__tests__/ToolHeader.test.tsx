import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolHeader } from "../ToolHeader";

describe("ToolHeader", () => {
  it("renders title and description", () => {
    render(<ToolHeader title="Merge PDF" description="Combine PDFs" />);
    expect(
      screen.getByRole("heading", { name: "Merge PDF" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Combine PDFs")).toBeInTheDocument();
  });

  it("renders the notice when provided", () => {
    render(
      <ToolHeader
        title="Compress PDF"
        description="Reduce size"
        notice="This rasterizes pages."
      />,
    );
    expect(screen.getByText("This rasterizes pages.")).toBeInTheDocument();
  });

  it("does not render notice when omitted", () => {
    render(<ToolHeader title="Split PDF" description="Split" />);
    expect(screen.queryByText("This rasterizes pages.")).not.toBeInTheDocument();
  });
});
