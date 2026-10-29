export interface FaqLike {
  question: string;
  answer: string;
  category?: string;
}

export interface FaqResult<T extends FaqLike> {
  faq: T;
  score: number;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "do",
  "does",
  "did",
  "i",
  "my",
  "me",
  "we",
  "our",
  "you",
  "your",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "can",
  "could",
  "how",
  "what",
  "why",
  "when",
  "where",
  "it",
  "this",
  "that",
  "with",
]);

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(value: string): string[] {
  return normalize(value).match(/[a-z0-9]+/g) ?? [];
}

function queryTokens(query: string): string[] {
  const all = tokenize(query);
  const meaningful = all.filter((token) => !STOP_WORDS.has(token));
  return meaningful.length > 0 ? meaningful : all;
}

function haystackFor(faq: FaqLike): string {
  return normalize(`${faq.question} ${faq.answer} ${faq.category ?? ""}`);
}

/** Escape everything except `*` and `?`, which stay as wildcards. */
function wildcardPattern(query: string): RegExp {
  const escaped = query.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    escaped.replace(/\*/g, ".*").replace(/\?/g, "."),
    "i",
  );
}

/** Optimal-string-alignment distance (Levenshtein + adjacent swaps). */
export function editDistance(a: string, b: string, cutoff = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cutoff) return cutoff + 1;

  let previousPrevious: number[] | null = null;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );

      // Treat an adjacent transposition as one edit (e.g. "mrege" -> "merge").
      if (
        previousPrevious &&
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        current[j] = Math.min(current[j], previousPrevious[j - 2] + 1);
      }
    }
    previousPrevious = previous;
    previous = current;
  }
  return previous[b.length];
}

function maxTypoDistance(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  if (token.length <= 8) return 2;
  return 3;
}

function wildcardScore(query: string, faq: FaqLike): number | null {
  return wildcardPattern(query).test(haystackFor(faq)) ? 0 : null;
}

/**
 * Fuzzy score for a query without wildcards. Every meaningful query token must
 * match a word in the question, answer or category. Lower is better; null means
 * no match.
 */
function fuzzyScore(query: string, faq: FaqLike): number | null {
  const haystack = haystackFor(faq);
  if (haystack.includes(query)) return 0;

  const tokens = queryTokens(query);
  if (tokens.length === 0) return null;
  const words = tokenize(haystack);

  let total = 0;
  for (const token of tokens) {
    let best = Infinity;
    const allowance = maxTypoDistance(token);

    for (const word of words) {
      if (word === token) {
        best = 0;
        break;
      }
      if (token.length >= 3 && word.includes(token)) {
        best = Math.min(best, 0.15);
        continue;
      }
      if (allowance > 0) {
        const distance = editDistance(token, word, allowance);
        if (distance <= allowance) {
          best = Math.min(
            best,
            distance / Math.max(token.length, word.length),
          );
        }
      }
    }

    if (best === Infinity) return null;
    total += best;
  }

  return total / tokens.length;
}

/** Search the FAQ, honouring `*` / `?` wildcards and typo-tolerant matching. */
export function searchFaqs<T extends FaqLike>(
  query: string,
  faqs: T[],
): FaqResult<T>[] {
  const normalized = normalize(query).trim();
  if (!normalized) {
    return faqs.map((faq) => ({ faq, score: 0 }));
  }

  const useWildcard = /[*?]/.test(normalized);
  const results: FaqResult<T>[] = [];

  for (const faq of faqs) {
    const score = useWildcard
      ? wildcardScore(normalized, faq)
      : fuzzyScore(normalized, faq);
    if (score !== null) results.push({ faq, score });
  }

  return results.sort((a, b) => a.score - b.score);
}

/**
 * Looser nearest-match suggestions for the empty state. Prefers entries that
 * match more of the query tokens, then the smallest total edit distance.
 */
export function suggestFaqs<T extends FaqLike>(
  query: string,
  faqs: T[],
  limit = 3,
): T[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];

  const scored = faqs
    .map((faq) => {
      const words = tokenize(haystackFor(faq));
      let matched = 0;
      let total = 0;

      for (const token of tokens) {
        let best = Infinity;
        for (const word of words) {
          best = Math.min(best, editDistance(token, word, 6));
        }
        if (best <= Math.max(3, token.length)) {
          matched += 1;
          total += best;
        }
      }

      return { faq, matched, total };
    })
    .filter((entry) => entry.matched > 0);

  scored.sort((a, b) => b.matched - a.matched || a.total - b.total);
  return scored.slice(0, limit).map((entry) => entry.faq);
}
