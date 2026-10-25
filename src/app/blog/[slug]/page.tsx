import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/page-content";
import styles from "./page.module.scss";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <nav className={styles.crumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link>
          <span aria-hidden="true">/</span>
          <span>{post.title}</span>
        </nav>
        <div className={styles.meta}>
          <span>{post.date}</span>
          <span>{post.readTime} read</span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <article className={styles.body}>
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
        <p className={styles.back}>
          <Link href="/blog">Back to blog</Link>
        </p>
      </div>
    </div>
  );
}