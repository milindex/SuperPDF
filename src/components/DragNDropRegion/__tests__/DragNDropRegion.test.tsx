import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DragNDropRegion } from "../DragNDropRegion";
import { FilePreviewProvider } from "@/components/FilePreview/FilePreviewContext";

describe("DragNDropRegion", () => {
  it("renders default text and button", () => {
    render(<DragNDropRegion />);
    expect(screen.getByText("Drag & drop a PDF file here")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose PDF file" }),
    ).toBeInTheDocument();
  });

  it("renders custom text and button", () => {
    render(
      <DragNDropRegion
        text="Drop your PDFs"
        buttonText="Browse files"
        subText="or select"
      />,
    );
    expect(screen.getByText("Drop your PDFs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Browse files" })).toBeInTheDocument();
    expect(screen.getByText("or select")).toBeInTheDocument();
  });

  it("collapses once a file is selected", () => {
    const file = new File(["pdf"], "report.pdf", {
      type: "application/pdf",
    });
    render(
      <FilePreviewProvider>
        <DragNDropRegion file={file} />
      </FilePreviewProvider>,
    );
    expect(
      screen.queryByRole("region", { name: "File drop area" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Drag & drop a PDF file here")).not.toBeInTheDocument();
  });
});
