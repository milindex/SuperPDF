import { describe, expect, it } from "vitest";
import { editDistance, searchFaqs, suggestFaqs } from "../faq-search";

const faqs = [
  {
    question: "Do my files leave my device?",
    answer:
      "No. The tool runs in your browser. The file is read and processed on your device.",
    category: "Privacy",
  },
  {
    question: "Does password protection work in the browser?",
    answer:
      "Yes. qpdf is compiled to WebAssembly and applies AES-256 locally. The password never leaves the tab.",
    category: "Security",
  },
  {
    question: "Can I merge PDFs?",
    answer: "Use the Merge PDF tool to combine files in the order you choose.",
    category: "Editing",
  },
  {
    question: "Is SuperPDF free?",
    answer: "Yes. There is no account, no watermark, and no file-count limit.",
    category: "Pricing",
  },
];

function questions(query: string) {
  return searchFaqs(query, faqs).map((result) => result.faq.question);
}

describe("faq search", () => {
  it("returns everything for an empty query", () => {
    expect(questions("")).toHaveLength(faqs.length);
    expect(questions("   ")).toHaveLength(faqs.length);
  });

  it("matches exact words in the question, answer, and category", () => {
    expect(questions("privacy")).toEqual(["Do my files leave my device?"]);
    expect(questions("AES-256")).toEqual([
      "Does password protection work in the browser?",
    ]);
    expect(questions("editing")).toEqual(["Can I merge PDFs?"]);
  });

  it("supports * and ? wildcards", () => {
    expect(questions("priv*")).toEqual(["Do my files leave my device?"]);
    expect(questions("passw?rd")).toEqual([
      "Does password protection work in the browser?",
    ]);
    expect(questions("*merge*")).toEqual(["Can I merge PDFs?"]);
  });

  it("is tolerant of typos", () => {
    expect(questions("privcy")).toEqual(["Do my files leave my device?"]);
    expect(questions("mrege")).toEqual(["Can I merge PDFs?"]);
    expect(questions("passwrod")).toEqual([
      "Does password protection work in the browser?",
    ]);
  });

  it("returns nothing for a distant query and offers nearest matches", () => {
    expect(questions("quantum chromodynamics")).toEqual([]);
    expect(
      suggestFaqs("quantum chromodynamics", faqs, 2),
    ).toHaveLength(2);
    expect(suggestFaqs("privcyy", faqs, 1)[0].question).toBe(
      "Do my files leave my device?",
    );
  });

  it("computes edit distance", () => {
    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("merge", "mrege")).toBe(1);
    expect(editDistance("merge", "merce")).toBe(1);
  });
});
