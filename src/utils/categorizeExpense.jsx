// ================= BASE KEYWORDS (exact/substring matching — high precision) =================
const BASE_KEYWORDS = {
  Bills: [
    "electricity bill","electric bill","water bill","gas bill","internet bill",
    "phone bill","mobile bill","wifi bill","ptcl","utility bill",
    "electricity","electric","water","gas","internet","wifi","utility",
    "maintenance","rent",
  ],
  Food: [
    "pizza","burger","kfc","mcdonald","biryani","restaurant","lunch",
    "dinner","breakfast","cafe","coffee","tea","bbq","snack","fries",
    "shawarma","zinger","bakery","ice cream","dominos","food",
  ],
  Transport: [
    "uber","careem","taxi","bus fare","metro","fuel","petrol","diesel",
    "car wash","rickshaw","train","parking","toll","indrive","bykea","bus","bike",
  ],
  Shopping: [
    "shopping","shirt","clothes","shoes","nike","adidas","mall","amazon",
    "daraz","jacket","jeans","perfume","makeup","cosmetics","dress","bag","watch","cap",
  ],
  Entertainment: [
    "netflix","spotify","cinema","movie","youtube premium","playstation",
    "xbox","concert","amazon prime","disney","gaming","subscription","game","music",
  ],
  Health: [
    "doctor","medicine","hospital","pharmacy","checkup","clinic",
    "surgery","vitamins","lab test","medical","health","tablet",
  ],
  Education: [
    "university","college","tuition fee","udemy","coursera","assignment",
    "stationery","school fee","course","books","education","exam","fees",
  ],
  Travel: [
    "flight","hotel","airbnb","resort","vacation","visa","trip","tour","travel","ticket","booking",
  ],
  Salary: [
    "salary","freelance payment","client payment","bonus","income","earning","profit","revenue",
  ],
};

// ================= TOKENIZER =================
function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// ================= STEP 1 — EXACT/SUBSTRING KEYWORD MATCH =================
// Sorted longest-first so multi-word phrases ("electricity bill") match
// before single words ("bill" alone, which isn't even listed to avoid false positives).
function keywordMatch(title) {
  const text = title.toLowerCase();

  const allPairs = [];
  Object.entries(BASE_KEYWORDS).forEach(([cat, words]) => {
    words.forEach((kw) => allPairs.push([kw, cat]));
  });
  allPairs.sort((a, b) => b[0].length - a[0].length); // longest phrase first

  for (const [kw, cat] of allPairs) {
    if (text.includes(kw)) return cat;
  }
  return null;
}

// ================= STEP 2 — NAIVE BAYES FALLBACK (learns from YOUR history) =================
// Only used when no keyword matches. Trains purely on the user's own
// past expenses, so it personalizes to titles you've categorized before
// (e.g. "Ali Store" -> "Food" if you've tagged similar entries that way).
function naiveBayesFallback(title, expenses) {
  const tokens = tokenize(title);
  if (tokens.length === 0 || expenses.length === 0) return "Other";

  const wordCounts = {};
  const totalWords = {};
  const docCounts  = {};

  expenses.forEach((e) => {
    if (!e.title || !e.category) return;
    const weight = e.aiGenerated ? 1 : 2; // user-confirmed categories count more
    const words = tokenize(e.title);
    if (words.length === 0) return;

    wordCounts[e.category] = wordCounts[e.category] || {};
    totalWords[e.category] = totalWords[e.category] || 0;
    docCounts[e.category]  = (docCounts[e.category] || 0) + weight;

    words.forEach((w) => {
      wordCounts[e.category][w] = (wordCounts[e.category][w] || 0) + weight;
      totalWords[e.category]    += weight;
    });
  });

  const categories = Object.keys(docCounts);
  if (categories.length === 0) return "Other";

  const vocab = new Set();
  Object.values(wordCounts).forEach((wc) => Object.keys(wc).forEach((w) => vocab.add(w)));
  const V = vocab.size || 1;
  const totalDocs = Object.values(docCounts).reduce((a, b) => a + b, 0) || 1;

  let bestCategory = null;
  let bestScore    = -Infinity;
  let matchedAnyWord = false;

  categories.forEach((cat) => {
    const prior = Math.log(docCounts[cat] / totalDocs);
    let score = prior;

    tokens.forEach((token) => {
      if (wordCounts[cat][token]) matchedAnyWord = true;
      const count = (wordCounts[cat][token] || 0) + 1;
      const denom = totalWords[cat] + V;
      score += Math.log(count / denom);
    });

    if (score > bestScore) {
      bestScore    = score;
      bestCategory = cat;
    }
  });

  // Only trust the ML guess if at least one token was actually seen before
  return matchedAnyWord ? bestCategory : "Other";
}

// ================= MAIN ENTRY POINT =================
export function categorizeExpense(title = "", expenses = []) {
  if (!title.trim()) return "Other";

  // 1 — Try reliable keyword matching first
  const matched = keywordMatch(title);
  if (matched) return matched;

  // 2 — Fall back to ML personalization from user's history
  return naiveBayesFallback(title, expenses);
}