import { SITE_GITHUB, SITE_KOFI } from "@/lib/seo";

/** Ko-fi hosts both one-off tips and monthly memberships on the same page. */
export const KOFI_URL = SITE_KOFI;

/**
 * Set this to the GitHub Sponsors profile URL to show a second option on the
 * support page. Left null until a profile exists.
 */
export const GITHUB_SPONSORS_URL: string | null = null;

export interface FundingItem {
  icon: string;
  title: string;
  description: string;
}

/** What donations actually pay for. Keep the claims modest and true. */
export const fundingItems: FundingItem[] = [
  {
    icon: "world-www",
    title: "Hosting and the domain",
    description:
      "The static site, the CDN and the yearly domain renewal. Small costs, but they arrive whether or not the tools are used.",
  },
  {
    icon: "language",
    title: "Libraries and language packs",
    description:
      "The open-source PDF, OCR and conversion libraries that do the real work, plus the OCR language data downloaded on first use.",
  },
  {
    icon: "checklist",
    title: "Build and test tooling",
    description:
      "Browser testing and CI so the tools keep working when a browser changes how it handles files, fonts or memory.",
  },
  {
    icon: "rocket",
    title: "The next tool",
    description:
      "Anything left over becomes development time: new tools, bug fixes, and keeping each page honest about what it cannot do yet.",
  },
];

export interface SupportWay {
  icon: string;
  title: string;
  description: string;
  href: string;
  action: string;
  external?: boolean;
}

/** Concrete ways to help, in rough order of usefulness to the project. */
export const supportWays: SupportWay[] = [
  {
    icon: "coffee",
    title: "One-off tip",
    description:
      "Any amount, no account required. Ko-fi handles the checkout and the receipt.",
    href: KOFI_URL,
    action: "Tip on Ko-fi",
    external: true,
  },
  {
    icon: "star",
    title: "Monthly membership",
    description:
      "A small recurring amount that covers the yearly bills without a fundraising sprint.",
    href: KOFI_URL,
    action: "Become a member",
    external: true,
  },
  {
    icon: "repair",
    title: "Report or contribute",
    description:
      "A clear bug report, a fix or a new tool helps as much as money does.",
    href: SITE_GITHUB,
    action: "Open GitHub",
    external: true,
  },
];

export interface Supporter {
  name: string;
  message?: string;
  href?: string;
}

/**
 * People who have agreed to be named. Only add entries with explicit
 * permission. An empty list hides the supporters section entirely.
 */
export const supporters: Supporter[] = [];

export const supportFaqs = [
  {
    question: "Do I need to donate to use SuperPDF?",
    answer:
      "No. Every tool stays free, with no account, no watermark and no daily limit. Donations are optional and change nothing about what you can do.",
  },
  {
    question: "Is a donation payment for a service?",
    answer:
      "No. It is a tip for work that already exists. Donations do not unlock features, remove limits, change the licence or buy support priority.",
  },
  {
    question: "How does Ko-fi handle my payment?",
    answer:
      "Ko-fi runs the checkout and processes the payment through its own providers. SuperPDF never sees your card details. You choose whether your name and message are public.",
  },
  {
    question: "Can I give monthly instead?",
    answer:
      "Yes. Ko-fi supports both one-off tips and monthly memberships. A monthly amount is the most useful kind, because hosting and domains renew on a schedule.",
  },
  {
    question: "Is my donation tax-deductible?",
    answer:
      "No. SuperPDF is a personal open-source project, not a registered charity, so donations are not tax-deductible.",
  },
  {
    question: "Can I help without paying?",
    answer:
      "Absolutely. Report a bug, suggest a tool, improve the docs or open a pull request. Sharing it with someone who needs it also counts.",
  },
];
