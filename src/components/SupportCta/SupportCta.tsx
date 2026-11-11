import Icon from "@/components/Icon/Icon";
import { SITE_KOFI } from "@/lib/seo";
import styles from "./SupportCta.module.scss";

/**
 * The single Ko-fi call to action. Opens Ko-fi in a new tab rather than
 * embedding it: the site sends `Cross-Origin-Embedder-Policy: require-corp`,
 * which blocks Ko-fi's iframe widget in production.
 */
export default function SupportCta({
  variant = "primary",
  label = "Buy me a coffee",
  className,
}: {
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={SITE_KOFI}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.cta} ${styles[variant]} ${className ?? ""}`}
    >
      <Icon name="coffee" size={16} />
      <span>{label}</span>
      <span className="visually-hidden"> (opens Ko-fi in a new tab)</span>
    </a>
  );
}
