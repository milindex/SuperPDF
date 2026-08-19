"use client";

import Image from "next/image";
import Icon from "@/components/Icon/Icon";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./Testimonials.module.scss";

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.head}>
          <h2 className={styles.heading}>Trusted by Professionals</h2>
          <p className={styles.subheading}>
            See what our users say about SuperPDF
          </p>
        </div>

        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.viewport}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.slide}>
                <div className={styles.card}>
                  <div className={styles.stars}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className={styles.star}>
                        <Icon name="star" size={20} />
                      </span>
                    ))}
                  </div>
                  <p className={styles.quote}>"{testimonial.content}"</p>
                  <div className={styles.author}>
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className={styles.name}>{testimonial.name}</div>
                      <div className={styles.meta}>
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
