# Phase 3 — Feature-Family Ablation (importance)

Corpus: 100,000 candidates. Each row disables ONE family and re-ranks.

Lower top-100 overlap / higher rank-move ⇒ the ranking depends MORE on that family.

| disabled family | top100 overlap | top20 overlap | mean rank move (kept) | dropped from top100 |
|---|---|---|---|---|
| capability_match | 68% | 55% | 19.8 | 32 |
| title_fit | 74% | 70% | 14.9 | 26 |
| behavioral | 81% | 60% | 15.0 | 19 |
| experience_fit | 83% | 85% | 11.1 | 17 |
| assessment_evidence | 84% | 75% | 18.7 | 16 |
| text_relevance | 87% | 90% | 9.2 | 13 |
| boilerplate | 100% | 100% | 0.0 | 0 |
| disqualifiers | 100% | 100% | 0.0 | 0 |

**Read:** the family at the top is the strongest ranking driver; a family with ~100% overlap and ~0 move is near-inert and a candidate for re-weighting or removal.
