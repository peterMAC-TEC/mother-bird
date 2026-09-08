/**
 * Expense shape:
 * { id, amountRupees: number, description: string, category: 'personal' | 'business',
 *   rawTranscript: string, createdAt: string (ISO date) }
 */

const CURRENCY_WORD = /\b(rupees?|rs\.?|inr)\b/i;
const NUMBER_RE = /\d[\d,]*(?:\.\d+)?/g;
const FILLER_WORDS = /\b(rupees?|rs\.?|inr|spent|paid|for|on|towards)\b/gi;

const BUSINESS_KEYWORDS = [
  "manufacturer", "supplier", "inventory", "material", "materials", "shipping",
  "packaging", "wholesale", "client", "customer", "invoice", "office", "sample",
  "samples", "production", "factory", "vendor", "logistics", "marketing", "ad",
  "ads", "advertisement", "advertising", "domain", "hosting", "software",
  "subscription", "equipment", "tools", "bulk", "delivery charge", "freight",
  "warehouse", "business", "company", "manufacturing", "stock", "raw material",
];

const PERSONAL_KEYWORDS = [
  "tea", "coffee", "lunch", "dinner", "breakfast", "snack", "snacks", "movie",
  "groceries", "grocery", "personal", "myself", "clothes", "clothing",
  "medicine", "doctor", "uber", "cab", "taxi", "haircut", "gym", "food",
  "restaurant", "netflix", "entertainment", "gift", "rent",
];

/** Picks the number in `text` nearest a currency word (rupees/rs/inr), or the first number found. */
function extractAmount(text) {
  const numbers = [...text.matchAll(NUMBER_RE)];
  if (numbers.length === 0) return null;

  const currencyMatch = text.match(CURRENCY_WORD);
  let chosen = numbers[0];
  if (currencyMatch) {
    let bestDist = Infinity;
    for (const n of numbers) {
      const dist = Math.abs(n.index - currencyMatch.index);
      if (dist < bestDist) {
        bestDist = dist;
        chosen = n;
      }
    }
  }

  const value = Number(chosen[0].replace(/,/g, ""));
  return Number.isFinite(value) ? { value, match: chosen[0] } : null;
}

/** Strips the matched amount plus currency/connector filler words, leaving what it was for. */
function extractDescription(text, amountMatchStr) {
  let cleaned = text;
  if (amountMatchStr) {
    const idx = cleaned.indexOf(amountMatchStr);
    if (idx !== -1) cleaned = cleaned.slice(0, idx) + " " + cleaned.slice(idx + amountMatchStr.length);
  }
  cleaned = cleaned.replace(FILLER_WORDS, " ");
  return cleaned.replace(/\s+/g, " ").trim();
}

/** Keyword-count heuristic — not NLU. Ties (or no keyword hits at all) default to personal. */
export function classifyExpense(description) {
  const lower = description.toLowerCase();
  const businessHits = BUSINESS_KEYWORDS.filter((k) => lower.includes(k)).length;
  const personalHits = PERSONAL_KEYWORDS.filter((k) => lower.includes(k)).length;
  return businessHits > personalHits ? "business" : "personal";
}

/**
 * Best-effort parse of a spoken expense phrase, e.g. "40 rupees for tea" or
 * "6000 rupees for glass bottles from manufacturer". Pattern-matching, not NLU:
 * pulls the number nearest a currency word (or the first number, if none), strips
 * it plus filler words to get the description, then guesses personal vs. business
 * from keywords in what's left. `amount` is null if no number was found at all —
 * callers should treat that as "couldn't parse," not save a zero-amount expense.
 */
export function parseExpensePhrase(text) {
  const trimmed = text.trim();
  const amountInfo = extractAmount(trimmed);
  const description = extractDescription(trimmed, amountInfo?.match);
  return {
    amount: amountInfo ? amountInfo.value : null,
    description,
    category: classifyExpense(description),
  };
}

export function totalsByCategory(expenses) {
  return expenses.reduce(
    (totals, e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amountRupees;
      return totals;
    },
    { personal: 0, business: 0 },
  );
}
