import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuccessBanner } from "../SuccessBanner";

describe("SuccessBanner", () => {
  it("renders success text and a download link", () => {
    render(
      <SuccessBanner url="/blob:123" fileName="result.pdf" />,
    );
    expect(screen.getByText("Success!")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Download PDF" });
    expect(link).toHaveAttribute("href", "/blob:123");
    expect(link).toHaveAttribute("download", "result.pdf");
  });

  it("renders custom text", () => {
    render(
      <SuccessBanner
        url="/blob:123"
        fileName="out.pdf"
        downloadText="Save File"
        successText="Done!"
      />,
    );
    expect(screen.getByText("Done!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Save File" })).toBeInTheDocument();
  });
});
