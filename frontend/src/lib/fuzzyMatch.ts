/** Compute Levenshtein distance between two strings. */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  // Use single-row optimization
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) {
    prev[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,      // insertion
        prev[j] + 1,          // deletion
        prev[j - 1] + cost,   // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

/** Compute similarity between two strings (0.0 to 1.0). */
export function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - levenshteinDistance(a, b) / maxLen;
}

/** Compute n-gram similarity between two token sequences. */
export function ngramSimilarity(asrTokens: string[], scriptTokens: string[]): number {
  if (asrTokens.length === 0 || scriptTokens.length === 0) return 0;

  const comparisons = Math.min(asrTokens.length, scriptTokens.length);
  let totalSim = 0;

  for (let i = 0; i < comparisons; i++) {
    const sim = stringSimilarity(asrTokens[i], scriptTokens[i]);
    // Exact matches get a bonus
    totalSim += sim === 1.0 ? 1.2 : sim;
  }

  const lengthPenalty = comparisons / Math.max(asrTokens.length, scriptTokens.length);
  return (totalSim / comparisons) * lengthPenalty;
}
