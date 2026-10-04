const { haversineKm } = require("./geo");

// Weighted relevance scoring across three factors: keyword match (50%),
// category relevance (20%), and business proximity (30%) — consistent with
// the weighted-factor relevance-ranking approach described in the study
// (Poppink, Frasincar, & Robal, 2023; Iyer, Kohli, & Prabhumoye, 2020).
function scoreProduct(product, { term, category, buyerLat, buyerLng }) {
  const name = (product.name || "").toLowerCase();
  const sellerName = (product.seller?.name || "").toLowerCase();
  const prodCategory = (product.category || "").toLowerCase();
  const q = (term || "").toLowerCase().trim();

  // --- Keyword match ---
  let keywordScore = 1; // neutral when no search term was typed
  if (q) {
    if (name === q) keywordScore = 1.0;
    else if (name.startsWith(q)) keywordScore = 0.85;
    else if (name.includes(q)) keywordScore = 0.65;
    else if (prodCategory.includes(q)) keywordScore = 0.5;
    else if (sellerName.includes(q)) keywordScore = 0.4;
    else keywordScore = 0; // no match at all
  }

  // --- Category relevance ---
  // Category is already applied as a hard filter before scoring runs, so a
  // returned product always matches the selected category (or none was
  // requested). Kept explicit here so the formula visibly implements all
  // three cited factors, and so the score breakdown stays inspectable.
  const categoryScore =
    !category || category === "All" || prodCategory === category.toLowerCase() ? 1 : 0;

  // --- Business proximity ---
  let proximityScore = 1; // neutral when the buyer hasn't shared a location
  let distanceKm = null;
  if (
    buyerLat != null && buyerLng != null &&
    product.seller?.latitude != null && product.seller?.longitude != null
  ) {
    distanceKm = haversineKm(buyerLat, buyerLng, product.seller.latitude, product.seller.longitude);
    proximityScore = 1 / (1 + distanceKm / 5); // smooth decay — ~0.5 at 5km
  }

  const relevanceScore = 0.5 * keywordScore + 0.2 * categoryScore + 0.3 * proximityScore;

  return {
    relevanceScore: Number(relevanceScore.toFixed(4)),
    keywordScore,
    categoryScore,
    proximityScore: Number(proximityScore.toFixed(4)),
    distanceKm: distanceKm != null ? Number(distanceKm.toFixed(2)) : null,
  };
}

module.exports = { scoreProduct };