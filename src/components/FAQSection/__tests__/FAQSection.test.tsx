import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FAQSection from "../FAQSection";

const faqs = [
  { question: "Is it private?", answer: "Yes, files stay on your device." },
  { question: "Is it free?", answer: "Yes, every tool is free." },
];

describe("FAQSection", () => {
  it("keeps every answer in the DOM while collapsed", () => {
    render(<FAQSection faqs={faqs} />);

    expect(screen.getByText(faqs[0].answer)).toBeInTheDocument();
    expect(screen.getByText(faqs[1].answer)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Is it private/ }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("links each trigger to its panel and toggles it", () => {
    render(<FAQSection faqs={faqs} />);

    const trigger = screen.getByRole("button", { name: /Is it private/ });
    const panel = document.getElementById(
      trigger.getAttribute("aria-controls") ?? "",
    );

    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("hidden");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");
  });
});
