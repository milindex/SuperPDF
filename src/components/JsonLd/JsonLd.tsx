/**
 * Renders schema.org structured data as a JSON-LD script. The `<` escape keeps
 * a string from closing the script tag early (see the Next.js JSON-LD guide).
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
