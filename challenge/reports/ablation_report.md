# Phase 3 — Feature-Family Ablation (importance)

Corpus: 100,000 candidates. Each row disables ONE family and re-ranks.

Lower top-100 overlap / higher rank-move ⇒ the ranking depends MORE on that family.

| disabled family | top100 overlap | top20 overlap | mean rank move (kept) | dropped from top100 |
|---|---|---|---|---|
| capability_match | 68% | 50% | 19.6 | 32 |
| title_fit | 75% | 65% | 15.3 | 25 |
| assessment_evidence | 79% | 80% | 16.2 | 21 |
| behavioral | 79% | 60% | 17.4 | 21 |
| text_relevance | 86% | 90% | 8.9 | 14 |
| experience_fit | 95% | 90% | 8.5 | 5 |
| boilerplate | 100% | 100% | 0.0 | 0 |
| disqualifiers | 100% | 100% | 0.0 | 0 |

**Read:** the family at the top is the strongest ranking driver; a family with ~100% overlap and ~0 move is near-inert and a candidate for re-weighting or removal.
