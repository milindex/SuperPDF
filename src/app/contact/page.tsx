"use client";

import { useState } from "react";
import StaticPage from "@/components/StaticPage/StaticPage";
import styles from "./page.module.scss";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${name || "a visitor"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:support@superpdf.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <StaticPage
      title="Contact Us"
      intro="Questions, feedback, or support — we'd love to hear from you."
    >
      <div className={styles.grid}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Jane Doe"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="jane@example.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
              placeholder="How can we help?"
              rows={6}
              required
            />
          </div>
          <button type="submit" className={styles.submit}>
            Send message
          </button>
          {sent && (
            <p className={styles.note}>
              Your email app should have opened with the message ready to send.
            </p>
          )}
        </form>

        <div className={styles.info}>
          <h2 className={styles.infoTitle}>Other ways to reach us</h2>
          <p className={styles.infoText}>
            <strong>Support:</strong>{" "}
            <a href="mailto:support@superpdf.com">support@superpdf.com</a>
          </p>
          <p className={styles.infoText}>
            <strong>Press:</strong>{" "}
            <a href="mailto:press@superpdf.com">press@superpdf.com</a>
          </p>
          <p className={styles.infoText}>
            <strong>Response time:</strong> we aim to reply within 2 business
            days.
          </p>
          <p className={styles.infoNote}>
            Tip: include the tool name and your browser version when reporting a
            bug — it helps us fix it faster.
          </p>
        </div>
      </div>
    </StaticPage>
  );
}