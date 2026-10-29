import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { fullFaqs } from "@/data/page-content";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import FaqBrowser from "./FaqBrowser";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "Answers on privacy, supported formats, limits, and how SuperPDF does the work in your browser.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <StaticPage
      path="/faq"
      title="Frequently Asked Questions"
      intro="Answers on privacy, formats, limits, and how the browser does the work."
      centered
    >
      <JsonLd data={faqJsonLd(fullFaqs)} />
      <FaqBrowser faqs={fullFaqs} />
      <p className={styles.footerNote}>
        Still have a question?{" "}
        <Link href="/contact" className={styles.link}>
          Contact us
        </Link>{" "}
        and we will help.
      </p>
    </StaticPage>
  );
}
