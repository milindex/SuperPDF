import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { imagesToPdf } from "../images-to-pdf";

const PNG_1X1 = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
  ),
  (char) => char.charCodeAt(0),
);

const JPG_1X1 = Uint8Array.from(
  atob(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oACAEBAAA/AKpJJ5NFFAH/2Q==",
  ),
  (char) => char.charCodeAt(0),
);

describe("imagesToPdf", () => {
  it("rejects an empty image list", async () => {
    await expect(imagesToPdf([])).rejects.toThrow("No images to convert.");
  });

  it("creates one page per image with the image dimensions", async () => {
    const out = await imagesToPdf([
      { bytes: PNG_1X1, kind: "png" },
      { bytes: PNG_1X1, kind: "png" },
    ]);
    const pdf = await PDFDocument.load(out);

    expect(pdf.getPageCount()).toBe(2);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 1, height: 1 });
  });

  it("embeds JPEG bytes with embedJpg", async () => {
    const out = await imagesToPdf([{ bytes: JPG_1X1, kind: "jpg" }]);
    const pdf = await PDFDocument.load(out);

    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 1, height: 1 });
  });

  it("rejects bytes that are not a valid image", async () => {
    await expect(
      imagesToPdf([{ bytes: new Uint8Array([1, 2, 3]), kind: "png" }]),
    ).rejects.toThrow();
  });
});
