# Phase 3 — Feature-Family Ablation (importance)

Corpus: 100,000 candidates. Each row disables ONE family and re-ranks.

Lower top-100 overlap / higher rank-move ⇒ the ranking depends MORE on that family.

| disabled family | top100 overlap | top20 overlap | mean rank move (kept) | dropped from top100 |
|---|---|---|---|---|
| capability_match | 67% | 50% | 21.4 | 33 |
| title_fit | 72% | 65% | 14.4 | 28 |
| assessment_evidence | 83% | 60% | 18.7 | 17 |
| experience_fit | 83% | 80% | 10.5 | 17 |
| text_relevance | 85% | 95% | 8.6 | 15 |
| behavioral | 91% | 65% | 8.3 | 9 |
| boilerplate | 100% | 100% | 0.0 | 0 |
| disqualifiers | 100% | 100% | 0.0 | 0 |

**Read:** the family at the top is the strongest ranking driver; a family with ~100% overlap and ~0 move is near-inert and a candidate for re-weighting or removal.
