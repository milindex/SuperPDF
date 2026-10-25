import Link from "next/link";
import StaticPage from "@/components/StaticPage/StaticPage";
import { blogPosts } from "@/data/page-content";
import styles from "./page.module.scss";

export default function BlogPage() {
  return (
    <StaticPage title="Blog" intro="Notes on privacy, browsers, and the PDF work we do.">
      <div className={styles.list}>
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.post}>
            <div className={styles.postMeta}>
              <span>{post.date}</span>
              <span>{post.readTime} read</span>
            </div>
            <h2 className={styles.postTitle}>{post.title}</h2>
            <p className={styles.postExcerpt}>{post.excerpt}</p>
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </StaticPage>
  );
}