# Phases 1-2 — Top-100 Audit & Adjacent-Pair Attribution

Per candidate: final score, certainty, score decomposition. Each pair line answers *why rank i beats i+1* via leave-one-component-swap.

### 1. CAND_0088025  —  0.9024  [HIGH]
- Staff Machine Learning Engineer (8.6y); caps[retrieval_ir:1.00,ranking_recsys:0.92,nlp_llm:1.00,production_systems:0.88]; 2 JD-relevant assessments avg=90
- additive: title=0.114, capability=0.435, assessment=0.137, text=0.173
  - capability ← retrieval_ir 0.146, ranking_recsys 0.105, nlp_llm 0.084, production_systems 0.074, llm_tooling 0.026
- multipliers: behavioral=1.05
- **vs #2 (Δ=0.0332):** driven by **capability_match** (0.435 vs 0.401); reverting it would cost rank #1 0.0366

### 2. CAND_0079387  —  0.8692  [HIGH]
- AI Engineer (6.9y); caps[retrieval_ir:0.99,ranking_recsys:0.89,nlp_llm:1.00,production_systems:0.84]; 3 JD-relevant assessments avg=76
- additive: title=0.114, capability=0.401, assessment=0.138, text=0.175
  - capability ← retrieval_ir 0.145, ranking_recsys 0.102, nlp_llm 0.083, production_systems 0.070
- multipliers: behavioral=1.05
- **vs #3 (Δ=0.0193):** driven by **assessment_evidence** (0.138 vs 0.087); reverting it would cost rank #2 0.0544

### 3. CAND_0069905  —  0.8500  [HIGH]
- Applied ML Engineer (6.6y); caps[retrieval_ir:0.98,ranking_recsys:0.93,nlp_llm:0.98,production_systems:0.86]; 1 JD-relevant assessments avg=71
- additive: title=0.114, capability=0.436, assessment=0.087, text=0.173
  - capability ← retrieval_ir 0.144, ranking_recsys 0.107, nlp_llm 0.082, production_systems 0.072, llm_tooling 0.030
- multipliers: behavioral=1.05
- **vs #4 (Δ=0.0216):** driven by **assessment_evidence** (0.087 vs 0.077); reverting it would cost rank #3 0.0103

### 4. CAND_0077337  —  0.8284  [HIGH]
- Staff Machine Learning Engineer (7.0y); caps[retrieval_ir:1.00,ranking_recsys:0.79,nlp_llm:0.99,production_systems:0.88]; 1 JD-relevant assessments avg=63
- additive: title=0.114, capability=0.429, assessment=0.077, text=0.175
  - capability ← retrieval_ir 0.146, ranking_recsys 0.090, nlp_llm 0.083, production_systems 0.074, llm_tooling 0.036
- multipliers: behavioral=1.04
- **vs #5 (Δ=0.0021):** driven by **capability_match** (0.429 vs 0.400); reverting it would cost rank #4 0.0296

### 5. CAND_0064904  —  0.8262  [HIGH]
- AI Engineer (4.9y); caps[retrieval_ir:1.00,ranking_recsys:0.61,nlp_llm:0.90,production_systems:0.90]; 4 JD-relevant assessments avg=67
- additive: title=0.114, capability=0.400, assessment=0.122, text=0.163
  - capability ← retrieval_ir 0.146, production_systems 0.075, nlp_llm 0.075, ranking_recsys 0.070, llm_tooling 0.033
- multipliers: experience=0.99, behavioral=1.05
- **vs #6 (Δ=0.0005):** driven by **capability_match** (0.400 vs 0.391); reverting it would cost rank #5 0.0098

### 6. CAND_0052328  —  0.8257  [HIGH]
- Recommendation Systems Engineer (6.5y); caps[retrieval_ir:0.98,ranking_recsys:0.88,nlp_llm:1.00,production_systems:0.75]; 2 JD-relevant assessments avg=76
- additive: title=0.114, capability=0.391, assessment=0.115, text=0.167
  - capability ← retrieval_ir 0.144, ranking_recsys 0.101, nlp_llm 0.083, production_systems 0.063
- multipliers: behavioral=1.05
- **vs #7 (Δ=0.0011):** driven by **capability_match** (0.391 vs 0.377); reverting it would cost rank #6 0.0139

### 7. CAND_0006567  —  0.8247  [HIGH]
- Senior AI Engineer (7.9y); caps[retrieval_ir:0.71,ranking_recsys:0.99,nlp_llm:0.72,production_systems:0.84]; 3 JD-relevant assessments avg=72
- additive: title=0.114, capability=0.377, assessment=0.131, text=0.163
  - capability ← ranking_recsys 0.114, retrieval_ir 0.103, production_systems 0.070, nlp_llm 0.060, llm_tooling 0.029
- multipliers: behavioral=1.05
- **vs #8 (Δ=0.0072):** driven by **assessment_evidence** (0.131 vs 0.117); reverting it would cost rank #7 0.0148

### 8. CAND_0061265  —  0.8175  [HIGH]
- Recommendation Systems Engineer (6.6y); caps[retrieval_ir:1.00,ranking_recsys:0.87,nlp_llm:0.97,production_systems:0.40]; 2 JD-relevant assessments avg=77
- additive: title=0.114, capability=0.393, assessment=0.117, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.100, nlp_llm 0.081, production_systems 0.034, llm_tooling 0.032
- multipliers: behavioral=1.03
- **vs #9 (Δ=0.0213):** driven by **capability_match** (0.393 vs 0.376); reverting it would cost rank #8 0.0179

### 9. CAND_0066376  —  0.7962  [HIGH]
- Applied ML Engineer (5.7y); caps[retrieval_ir:1.00,ranking_recsys:0.95,nlp_llm:0.99,llm_tooling:0.91]; 2 JD-relevant assessments avg=75
- additive: title=0.114, capability=0.376, assessment=0.114, text=0.170
  - capability ← retrieval_ir 0.146, ranking_recsys 0.109, nlp_llm 0.083, llm_tooling 0.038
- multipliers: behavioral=1.03
- **vs #10 (Δ=0.0153):** driven by **capability_match** (0.376 vs 0.351); reverting it would cost rank #9 0.0258

### 10. CAND_0081846  —  0.7809  [HIGH]
- Lead AI Engineer (6.7y); caps[retrieval_ir:1.00,ranking_recsys:0.97,production_systems:0.82,llm_tooling:0.59]; 2 JD-relevant assessments avg=66
- additive: title=0.114, capability=0.351, assessment=0.100, text=0.179
  - capability ← retrieval_ir 0.146, ranking_recsys 0.111, production_systems 0.068, llm_tooling 0.025
- multipliers: behavioral=1.05
- **vs #11 (Δ=0.0049):** driven by **behavioral** (1.050 vs 1.012); reverting it would cost rank #10 0.0279

### 11. CAND_0037944  —  0.7760  [HIGH]
- Senior Data Scientist (4.9y); caps[retrieval_ir:1.00,nlp_llm:1.00,production_systems:0.91,llm_tooling:0.91]; 3 JD-relevant assessments avg=82
- additive: title=0.114, capability=0.344, assessment=0.150, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.084, production_systems 0.077, llm_tooling 0.038
- multipliers: experience=0.99, behavioral=1.01
- **vs #12 (Δ=0.0009):** driven by **assessment_evidence** (0.150 vs 0.088); reverting it would cost rank #11 0.0618

### 12. CAND_0018499  —  0.7751  [HIGH]
- Senior Machine Learning Engineer (7.2y); caps[retrieval_ir:1.00,ranking_recsys:0.97,nlp_llm:0.80,production_systems:0.18]; 1 JD-relevant assessments avg=72
- additive: title=0.114, capability=0.365, assessment=0.088, text=0.179
  - capability ← retrieval_ir 0.146, ranking_recsys 0.111, nlp_llm 0.067, llm_tooling 0.025, production_systems 0.015
- multipliers: behavioral=1.04
- **vs #13 (Δ=0.0068):** driven by **capability_match** (0.365 vs 0.298); reverting it would cost rank #12 0.0701

### 13. CAND_0071974  —  0.7683  [HIGH]
- Senior AI Engineer (7.8y); caps[retrieval_ir:1.00,ranking_recsys:0.60,nlp_llm:0.99]; 4 JD-relevant assessments avg=80
- additive: title=0.114, capability=0.298, assessment=0.145, text=0.175
  - capability ← retrieval_ir 0.146, nlp_llm 0.082, ranking_recsys 0.069
- multipliers: behavioral=1.05
- **vs #14 (Δ=0.0028):** driven by **assessment_evidence** (0.145 vs 0.136); reverting it would cost rank #13 0.0093

### 14. CAND_0010257  —  0.7655  [HIGH]
- Senior Data Scientist (6.5y); caps[retrieval_ir:1.00,ranking_recsys:0.79,production_systems:0.90]; 3 JD-relevant assessments avg=75
- additive: title=0.114, capability=0.312, assessment=0.136, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.090, production_systems 0.075
- multipliers: behavioral=1.05
- **vs #15 (Δ=0.0011):** driven by **assessment_evidence** (0.136 vs 0.086); reverting it would cost rank #14 0.0528

### 15. CAND_0040887  —  0.7644  [HIGH]
- Machine Learning Engineer (4.7y); caps[retrieval_ir:0.80,ranking_recsys:0.78,nlp_llm:0.97,production_systems:0.89]; 1 JD-relevant assessments avg=71
- additive: title=0.114, capability=0.392, assessment=0.086, text=0.173
  - capability ← retrieval_ir 0.118, ranking_recsys 0.090, nlp_llm 0.081, production_systems 0.075, llm_tooling 0.029
- multipliers: experience=0.96, behavioral=1.05
- **vs #16 (Δ=0.0011):** driven by **capability_match** (0.392 vs 0.332); reverting it would cost rank #15 0.0594

### 16. CAND_0093193  —  0.7633  [HIGH]
- Senior Machine Learning Engineer (7.9y); caps[retrieval_ir:1.00,ranking_recsys:0.91,production_systems:0.98]; 3 JD-relevant assessments avg=75
- additive: title=0.114, capability=0.332, assessment=0.136, text=0.150
  - capability ← retrieval_ir 0.146, ranking_recsys 0.104, production_systems 0.082
- multipliers: behavioral=1.04
- **vs #17 (Δ=0.0004):** driven by **capability_match** (0.332 vs 0.326); reverting it would cost rank #16 0.0069

### 17. CAND_0039383  —  0.7629  [HIGH]
- Applied ML Engineer (7.1y); caps[retrieval_ir:1.00,ranking_recsys:0.59,nlp_llm:0.99,llm_tooling:0.68]; 3 JD-relevant assessments avg=71
- additive: title=0.114, capability=0.326, assessment=0.130, text=0.163
  - capability ← retrieval_ir 0.146, nlp_llm 0.083, ranking_recsys 0.068, llm_tooling 0.029
- multipliers: behavioral=1.04
- **vs #18 (Δ=0.0004):** driven by **assessment_evidence** (0.130 vs 0.103); reverting it would cost rank #17 0.0276

### 18. CAND_0091909  —  0.7625  [HIGH]
- Machine Learning Engineer (6.9y); caps[retrieval_ir:1.00,ranking_recsys:0.81,nlp_llm:0.99,llm_tooling:0.73]; 1 JD-relevant assessments avg=85
- additive: title=0.114, capability=0.353, assessment=0.103, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.094, nlp_llm 0.083, llm_tooling 0.030
- multipliers: behavioral=1.03
- **vs #19 (Δ=0.0055):** driven by **capability_match** (0.353 vs 0.299); reverting it would cost rank #18 0.0558

### 19. CAND_0096142  —  0.7570  [HIGH]
- Applied ML Engineer (5.0y); caps[retrieval_ir:1.00,nlp_llm:0.97,production_systems:0.86]; 3 JD-relevant assessments avg=86
- additive: title=0.114, capability=0.299, assessment=0.157, text=0.163
  - capability ← retrieval_ir 0.146, nlp_llm 0.082, production_systems 0.072
- multipliers: behavioral=1.03
- **vs #20 (Δ=0.0021):** driven by **assessment_evidence** (0.157 vs 0.112); reverting it would cost rank #19 0.0468

### 20. CAND_0055905  —  0.7550  [HIGH]
- Senior Machine Learning Engineer (8.1y); caps[retrieval_ir:1.00,nlp_llm:0.97,production_systems:0.81,llm_tooling:0.75]; 2 JD-relevant assessments avg=74
- additive: title=0.114, capability=0.326, assessment=0.112, text=0.179
  - capability ← retrieval_ir 0.146, nlp_llm 0.081, production_systems 0.068, llm_tooling 0.031
- multipliers: behavioral=1.03
- **vs #21 (Δ=0.0027):** driven by **text_relevance** (0.179 vs 0.170); reverting it would cost rank #20 0.0093

### 21. CAND_0086151  —  0.7522  [HIGH]
- Recommendation Systems Engineer (7.7y); caps[retrieval_ir:1.00,ranking_recsys:0.60,nlp_llm:0.93,llm_tooling:0.72]; 3 JD-relevant assessments avg=71
- additive: title=0.114, capability=0.324, assessment=0.130, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.078, ranking_recsys 0.069, llm_tooling 0.030
- multipliers: behavioral=1.02
- **vs #22 (Δ=0.0012):** driven by **experience** (1.000 vs 0.985); reverting it would cost rank #21 0.0113

### 22. CAND_0079284  —  0.7511  [HIGH]
- Machine Learning Engineer (4.9y); caps[retrieval_ir:0.98,ranking_recsys:0.73,nlp_llm:0.99,llm_tooling:0.87]; 3 JD-relevant assessments avg=66
- additive: title=0.114, capability=0.346, assessment=0.121, text=0.167
  - capability ← retrieval_ir 0.143, ranking_recsys 0.083, nlp_llm 0.083, llm_tooling 0.036
- multipliers: experience=0.99, behavioral=1.02
- **vs #23 (Δ=0.0033):** driven by **assessment_evidence** (0.121 vs 0.082); reverting it would cost rank #22 0.0390

### 23. CAND_0070398  —  0.7477  [HIGH]
- Machine Learning Engineer (7.2y); caps[retrieval_ir:1.00,ranking_recsys:0.89,nlp_llm:0.87,production_systems:0.62]; 1 JD-relevant assessments avg=68
- additive: title=0.114, capability=0.374, assessment=0.082, text=0.163
  - capability ← retrieval_ir 0.146, ranking_recsys 0.103, nlp_llm 0.073, production_systems 0.052
- multipliers: behavioral=1.02
- **vs #24 (Δ=0.0001):** driven by **capability_match** (0.374 vs 0.343); reverting it would cost rank #23 0.0316

### 24. CAND_0070202  —  0.7476  [HIGH]
- Machine Learning Engineer (5.1y); caps[retrieval_ir:1.00,ranking_recsys:0.81,nlp_llm:0.99,production_systems:0.25]; 4 JD-relevant assessments avg=67
- additive: title=0.114, capability=0.343, assessment=0.122, text=0.163
  - capability ← retrieval_ir 0.146, ranking_recsys 0.093, nlp_llm 0.083, production_systems 0.021
- multipliers: behavioral=1.01
- **vs #25 (Δ=0.0015):** driven by **assessment_evidence** (0.122 vs 0.000); reverting it would cost rank #24 0.1233

### 25. CAND_0002025  —  0.7460  [MED]
- Senior AI Engineer (5.9y); caps[retrieval_ir:1.00,ranking_recsys:0.74,nlp_llm:0.99,production_systems:0.83]
- additive: title=0.114, capability=0.422, text=0.177
  - capability ← retrieval_ir 0.146, ranking_recsys 0.085, nlp_llm 0.083, production_systems 0.069, llm_tooling 0.039
- multipliers: behavioral=1.05
- **vs #26 (Δ=0.0012):** driven by **capability_match** (0.422 vs 0.325); reverting it would cost rank #25 0.1016

### 26. CAND_0044855  —  0.7448  [HIGH]
- Senior Data Scientist (6.6y); caps[retrieval_ir:1.00,ranking_recsys:0.83,nlp_llm:0.99]; 3 JD-relevant assessments avg=70
- additive: title=0.114, capability=0.325, assessment=0.127, text=0.173
  - capability ← retrieval_ir 0.146, ranking_recsys 0.095, nlp_llm 0.083
- multipliers: behavioral=1.01
- **vs #27 (Δ=0.0027):** driven by **capability_match** (0.325 vs 0.312); reverting it would cost rank #26 0.0122

### 27. CAND_0047721  —  0.7421  [HIGH]
- Senior Data Scientist (7.0y); caps[retrieval_ir:1.00,ranking_recsys:0.81,nlp_llm:0.87]; 4 JD-relevant assessments avg=82
- additive: title=0.114, capability=0.312, assessment=0.149, text=0.170
  - capability ← retrieval_ir 0.146, ranking_recsys 0.094, nlp_llm 0.072
- multipliers: behavioral=1.00
- **vs #28 (Δ=0.0030):** driven by **assessment_evidence** (0.149 vs 0.087); reverting it would cost rank #27 0.0615

### 28. CAND_0079064  —  0.7391  [HIGH]
- Senior Data Scientist (5.2y); caps[retrieval_ir:0.99,ranking_recsys:0.60,nlp_llm:0.99,llm_tooling:0.85]; 2 JD-relevant assessments avg=57
- additive: title=0.114, capability=0.333, assessment=0.087, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.083, ranking_recsys 0.069, llm_tooling 0.036
- multipliers: behavioral=1.05
- **vs #29 (Δ=0.0006):** driven by **capability_match** (0.333 vs 0.261); reverting it would cost rank #28 0.0748

### 29. CAND_0046525  —  0.7385  [HIGH]
- Senior Machine Learning Engineer (6.1y); caps[retrieval_ir:1.00,nlp_llm:0.94,llm_tooling:0.88]; 4 JD-relevant assessments avg=84
- additive: title=0.114, capability=0.261, assessment=0.153, text=0.177
  - capability ← retrieval_ir 0.146, nlp_llm 0.079, llm_tooling 0.037
- multipliers: behavioral=1.05
- **vs #30 (Δ=0.0047):** driven by **assessment_evidence** (0.153 vs 0.104); reverting it would cost rank #29 0.0515

### 30. CAND_0029367  —  0.7338  [HIGH]
- Senior Data Scientist (5.7y); caps[retrieval_ir:0.99,ranking_recsys:0.70,nlp_llm:0.98,llm_tooling:0.81]; 1 JD-relevant assessments avg=86
- additive: title=0.114, capability=0.342, assessment=0.104, text=0.173
  - capability ← retrieval_ir 0.145, nlp_llm 0.082, ranking_recsys 0.081, llm_tooling 0.034
- multipliers: behavioral=1.00
- **vs #31 (Δ=0.0024):** driven by **capability_match** (0.342 vs 0.330); reverting it would cost rank #30 0.0112

### 31. CAND_0009691  —  0.7313  [HIGH]
- Applied ML Engineer (6.2y); caps[retrieval_ir:0.99,ranking_recsys:0.55,nlp_llm:1.00,llm_tooling:0.94]; 4 JD-relevant assessments avg=67
- additive: title=0.114, capability=0.330, assessment=0.123, text=0.167
  - capability ← retrieval_ir 0.145, nlp_llm 0.083, ranking_recsys 0.063, llm_tooling 0.039
- multipliers: behavioral=1.00
- **vs #32 (Δ=0.0014):** driven by **assessment_evidence** (0.123 vs 0.089); reverting it would cost rank #31 0.0332

### 32. CAND_0049538  —  0.7299  [HIGH]
- Applied ML Engineer (5.8y); caps[retrieval_ir:1.00,ranking_recsys:0.93,nlp_llm:0.91,llm_tooling:0.78]; 2 JD-relevant assessments avg=59
- additive: title=0.114, capability=0.362, assessment=0.089, text=0.157
  - capability ← retrieval_ir 0.146, ranking_recsys 0.107, nlp_llm 0.076, llm_tooling 0.033
- multipliers: behavioral=1.01
- **vs #33 (Δ=0.0002):** driven by **capability_match** (0.362 vs 0.337); reverting it would cost rank #32 0.0251

### 33. CAND_0061175  —  0.7297  [HIGH]
- AI Research Engineer (6.7y); caps[retrieval_ir:0.99,ranking_recsys:0.62,nlp_llm:0.44,production_systems:0.74]; 4 JD-relevant assessments avg=62
- additive: title=0.114, capability=0.337, assessment=0.114, text=0.150
  - capability ← retrieval_ir 0.144, ranking_recsys 0.072, production_systems 0.062, nlp_llm 0.036, llm_tooling 0.023
- multipliers: behavioral=1.02
- **vs #34 (Δ=0.0042):** driven by **experience** (1.000 vs 0.865); reverting it would cost rank #33 0.0985

### 34. CAND_0057701  —  0.7255  [HIGH]
- Recommendation Systems Engineer (4.1y); caps[retrieval_ir:0.99,ranking_recsys:0.90,nlp_llm:0.91,production_systems:0.86]; 4 JD-relevant assessments avg=77
- additive: title=0.114, capability=0.428, assessment=0.139, text=0.157
  - capability ← retrieval_ir 0.144, ranking_recsys 0.103, nlp_llm 0.077, production_systems 0.072, llm_tooling 0.033
- multipliers: experience=0.86, behavioral=1.00
- **vs #35 (Δ=0.0014):** driven by **capability_match** (0.428 vs 0.380); reverting it would cost rank #34 0.0419

### 35. CAND_0074225  —  0.7241  [HIGH]
- Machine Learning Engineer (4.3y); caps[retrieval_ir:1.00,ranking_recsys:0.69,nlp_llm:0.92,production_systems:0.92]; 2 JD-relevant assessments avg=74
- additive: title=0.114, capability=0.380, assessment=0.112, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.080, nlp_llm 0.077, production_systems 0.077
- multipliers: experience=0.90, behavioral=1.05
- **vs #36 (Δ=0.0003):** driven by **behavioral** (1.047 vs 1.005); reverting it would cost rank #35 0.0294

### 36. CAND_0007460  —  0.7238  [HIGH]
- AI Engineer (4.7y); caps[retrieval_ir:0.99,ranking_recsys:0.65,nlp_llm:0.99,production_systems:0.61]; 3 JD-relevant assessments avg=58
- additive: title=0.114, capability=0.384, assessment=0.106, text=0.150
  - capability ← retrieval_ir 0.146, nlp_llm 0.083, ranking_recsys 0.074, production_systems 0.051, llm_tooling 0.030
- multipliers: experience=0.96, behavioral=1.00
- **vs #37 (Δ=0.0014):** driven by **capability_match** (0.384 vs 0.337); reverting it would cost rank #36 0.0450

### 37. CAND_0043228  —  0.7224  [HIGH]
- Applied ML Engineer (6.8y); caps[retrieval_ir:1.00,ranking_recsys:0.73,nlp_llm:0.99,production_systems:0.28]; 2 JD-relevant assessments avg=74
- additive: title=0.114, capability=0.337, assessment=0.112, text=0.163
  - capability ← retrieval_ir 0.146, ranking_recsys 0.084, nlp_llm 0.083, production_systems 0.024
- multipliers: behavioral=1.00
- **vs #38 (Δ=0.0021):** driven by **capability_match** (0.337 vs 0.286); reverting it would cost rank #37 0.0511

### 38. CAND_0075574  —  0.7202  [HIGH]
- Machine Learning Engineer (5.7y); caps[retrieval_ir:1.00,ranking_recsys:0.54,nlp_llm:0.35,production_systems:0.20]; 4 JD-relevant assessments avg=69
- additive: title=0.114, capability=0.286, assessment=0.126, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.062, llm_tooling 0.031, nlp_llm 0.029, production_systems 0.017
- multipliers: behavioral=1.04
- **vs #39 (Δ=0.0025):** driven by **behavioral** (1.040 vs 1.013); reverting it would cost rank #38 0.0185

### 39. CAND_0075249  —  0.7177  [HIGH]
- Applied ML Engineer (6.2y); caps[retrieval_ir:1.00,ranking_recsys:0.66,nlp_llm:0.89]; 3 JD-relevant assessments avg=72
- additive: title=0.114, capability=0.296, assessment=0.131, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.076, nlp_llm 0.074
- multipliers: behavioral=1.01
- **vs #40 (Δ=0.0003):** driven by **experience** (1.000 vs 0.940); reverting it would cost rank #39 0.0431

### 40. CAND_0003977  —  0.7175  [HIGH]
- Recommendation Systems Engineer (4.6y); caps[retrieval_ir:0.94,ranking_recsys:0.86,nlp_llm:0.28,production_systems:0.90]; 3 JD-relevant assessments avg=75
- additive: title=0.114, capability=0.362, assessment=0.137, text=0.157
  - capability ← retrieval_ir 0.137, ranking_recsys 0.099, production_systems 0.075, llm_tooling 0.027, nlp_llm 0.023
- multipliers: experience=0.94, behavioral=0.99
- **vs #41 (Δ=0.0003):** driven by **capability_match** (0.362 vs 0.325); reverting it would cost rank #40 0.0343

### 41. CAND_0098952  —  0.7172  [HIGH]
- AI Research Engineer (5.5y); caps[retrieval_ir:0.72,ranking_recsys:0.66,nlp_llm:0.88,production_systems:0.68]; 2 JD-relevant assessments avg=75
- additive: title=0.114, capability=0.325, assessment=0.114, text=0.150
  - capability ← retrieval_ir 0.106, ranking_recsys 0.075, nlp_llm 0.074, production_systems 0.057, llm_tooling 0.014
- multipliers: behavioral=1.02
- **vs #42 (Δ=0.0018):** driven by **capability_match** (0.325 vs 0.274); reverting it would cost rank #41 0.0519

### 42. CAND_0095528  —  0.7154  [HIGH]
- Senior Data Scientist (5.3y); caps[retrieval_ir:1.00,nlp_llm:0.75,production_systems:0.78]; 4 JD-relevant assessments avg=72
- additive: title=0.114, capability=0.274, assessment=0.132, text=0.170
  - capability ← retrieval_ir 0.146, production_systems 0.065, nlp_llm 0.063
- multipliers: behavioral=1.04
- **vs #43 (Δ=0.0018):** driven by **assessment_evidence** (0.132 vs 0.019); reverting it would cost rank #42 0.1173

### 43. CAND_0007009  —  0.7136  [MED]
- Recommendation Systems Engineer (7.9y); caps[retrieval_ir:1.00,ranking_recsys:0.90,nlp_llm:1.00,production_systems:0.94]; 1 assessments, none JD-relevant
- additive: title=0.114, capability=0.412, assessment=0.019, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.103, nlp_llm 0.084, production_systems 0.078
- multipliers: behavioral=1.00
- **vs #44 (Δ=0.0020):** driven by **capability_match** (0.412 vs 0.341); reverting it would cost rank #43 0.0706

### 44. CAND_0041610  —  0.7116  [HIGH]
- Recommendation Systems Engineer (6.7y); caps[retrieval_ir:1.00,ranking_recsys:0.96,nlp_llm:0.75,llm_tooling:0.50]; 1 JD-relevant assessments avg=56
- additive: title=0.114, capability=0.341, assessment=0.067, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.111, nlp_llm 0.063, llm_tooling 0.021
- multipliers: behavioral=1.03
- **vs #45 (Δ=0.0006):** driven by **capability_match** (0.341 vs 0.272); reverting it would cost rank #44 0.0718

### 45. CAND_0041669  —  0.7110  [HIGH]
- Recommendation Systems Engineer (8.0y); caps[retrieval_ir:1.00,nlp_llm:0.85,production_systems:0.30,llm_tooling:0.69]; 2 JD-relevant assessments avg=80
- additive: title=0.114, capability=0.272, assessment=0.121, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.071, llm_tooling 0.029, production_systems 0.025
- multipliers: behavioral=1.05
- **vs #46 (Δ=0.0006):** driven by **behavioral** (1.050 vs 1.011); reverting it would cost rank #45 0.0264

### 46. CAND_0042029  —  0.7104  [HIGH]
- Senior Data Scientist (6.5y); caps[retrieval_ir:1.00,ranking_recsys:0.78,nlp_llm:0.95]; 1 JD-relevant assessments avg=83
- additive: title=0.114, capability=0.315, assessment=0.100, text=0.173
  - capability ← retrieval_ir 0.146, ranking_recsys 0.089, nlp_llm 0.080
- multipliers: behavioral=1.01
- **vs #47 (Δ=0.0031):** driven by **text_relevance** (0.173 vs 0.130); reverting it would cost rank #46 0.0436

### 47. CAND_0069773  —  0.7073  [HIGH]
- AI Research Engineer (6.0y); caps[retrieval_ir:0.89,ranking_recsys:0.87,nlp_llm:0.88,production_systems:0.61]; 1 JD-relevant assessments avg=83
- additive: title=0.114, capability=0.356, assessment=0.100, text=0.130
  - capability ← retrieval_ir 0.130, ranking_recsys 0.100, nlp_llm 0.074, production_systems 0.051
- multipliers: behavioral=1.01
- **vs #48 (Δ=0.0009):** driven by **assessment_evidence** (0.100 vs 0.000); reverting it would cost rank #47 0.1015

### 48. CAND_0024620  —  0.7065  [MED]
- AI Engineer (5.9y); caps[retrieval_ir:1.00,ranking_recsys:0.64,nlp_llm:0.97,production_systems:0.86]
- additive: title=0.114, capability=0.412, text=0.163
  - capability ← retrieval_ir 0.146, nlp_llm 0.081, ranking_recsys 0.073, production_systems 0.072, llm_tooling 0.040
- multipliers: behavioral=1.03
- **vs #49 (Δ=0.0018):** driven by **capability_match** (0.412 vs 0.292); reverting it would cost rank #48 0.1237

### 49. CAND_0044222  —  0.7046  [HIGH]
- AI Engineer (7.7y); caps[retrieval_ir:1.00,nlp_llm:0.99,production_systems:0.28,llm_tooling:0.94]; 2 JD-relevant assessments avg=68
- additive: title=0.114, capability=0.292, assessment=0.104, text=0.167
  - capability ← retrieval_ir 0.146, nlp_llm 0.083, llm_tooling 0.039, production_systems 0.023
- multipliers: behavioral=1.04
- **vs #50 (Δ=0.0007):** driven by **capability_match** (0.292 vs 0.280); reverting it would cost rank #49 0.0121

### 50. CAND_0005538  —  0.7039  [HIGH]
- Senior AI Engineer (5.9y); caps[retrieval_ir:1.00,nlp_llm:0.91,production_systems:0.69]; 1 JD-relevant assessments avg=93
- additive: title=0.114, capability=0.280, assessment=0.113, text=0.167
  - capability ← retrieval_ir 0.146, nlp_llm 0.076, production_systems 0.058
- multipliers: behavioral=1.04
- **vs #51 (Δ=0.0003):** driven by **behavioral** (1.045 vs 0.999); reverting it would cost rank #50 0.0311

### 51. CAND_0087630  —  0.7036  [HIGH]
- AI Engineer (7.2y); caps[retrieval_ir:1.00,ranking_recsys:0.71,nlp_llm:1.00,production_systems:0.23]; 2 JD-relevant assessments avg=72
- additive: title=0.114, capability=0.331, assessment=0.109, text=0.150
  - capability ← retrieval_ir 0.146, nlp_llm 0.084, ranking_recsys 0.082, production_systems 0.019
- multipliers: behavioral=1.00
- **vs #52 (Δ=0.0007):** driven by **capability_match** (0.331 vs 0.319); reverting it would cost rank #51 0.0123

### 52. CAND_0050876  —  0.7029  [HIGH]
- Applied ML Engineer (6.0y); caps[retrieval_ir:0.99,nlp_llm:0.95,production_systems:0.66,llm_tooling:0.92]; 2 JD-relevant assessments avg=71
- additive: title=0.114, capability=0.319, assessment=0.108, text=0.163
  - capability ← retrieval_ir 0.145, nlp_llm 0.080, production_systems 0.055, llm_tooling 0.038
- multipliers: behavioral=1.00
- **vs #53 (Δ=0.0018):** driven by **assessment_evidence** (0.108 vs 0.085); reverting it would cost rank #52 0.0228

### 53. CAND_0065878  —  0.7012  [HIGH]
- Senior Data Scientist (7.8y); caps[retrieval_ir:0.88,ranking_recsys:0.71,nlp_llm:0.95,llm_tooling:0.81]; 1 JD-relevant assessments avg=70
- additive: title=0.114, capability=0.323, assessment=0.085, text=0.167
  - capability ← retrieval_ir 0.129, ranking_recsys 0.082, nlp_llm 0.079, llm_tooling 0.034
- multipliers: behavioral=1.02
- **vs #54 (Δ=0.0020):** driven by **capability_match** (0.323 vs 0.260); reverting it would cost rank #53 0.0641

### 54. CAND_0018549  —  0.6992  [HIGH]
- Recommendation Systems Engineer (6.8y); caps[retrieval_ir:1.00,nlp_llm:0.57,production_systems:0.33,llm_tooling:0.94]; 3 JD-relevant assessments avg=72
- additive: title=0.114, capability=0.260, assessment=0.131, text=0.167
  - capability ← retrieval_ir 0.146, nlp_llm 0.048, llm_tooling 0.039, production_systems 0.027
- multipliers: behavioral=1.04
- **vs #55 (Δ=0.0009):** driven by **assessment_evidence** (0.131 vs 0.083); reverting it would cost rank #54 0.0498

### 55. CAND_0042100  —  0.6983  [HIGH]
- Machine Learning Engineer (7.3y); caps[retrieval_ir:0.99,ranking_recsys:0.94,nlp_llm:0.98]; 1 JD-relevant assessments avg=69
- additive: title=0.114, capability=0.335, assessment=0.083, text=0.150
  - capability ← retrieval_ir 0.144, ranking_recsys 0.109, nlp_llm 0.082
- multipliers: behavioral=1.02
- **vs #56 (Δ=0.0012):** driven by **capability_match** (0.335 vs 0.294); reverting it would cost rank #55 0.0413

### 56. CAND_0080766  —  0.6971  [HIGH]
- Staff Machine Learning Engineer (8.8y); caps[retrieval_ir:0.98,nlp_llm:0.95,production_systems:0.85]; 1 JD-relevant assessments avg=84
- additive: title=0.114, capability=0.294, assessment=0.103, text=0.175
  - capability ← retrieval_ir 0.144, nlp_llm 0.080, production_systems 0.071
- multipliers: behavioral=1.02
- **vs #57 (Δ=0.0007):** driven by **behavioral** (1.017 vs 0.929); reverting it would cost rank #56 0.0598

### 57. CAND_0094759  —  0.6964  [HIGH]
- Lead AI Engineer (8.6y); caps[retrieval_ir:1.00,ranking_recsys:0.54,nlp_llm:0.96,llm_tooling:0.80]; 3 JD-relevant assessments avg=75
- additive: title=0.114, capability=0.322, assessment=0.136, text=0.177
  - capability ← retrieval_ir 0.146, nlp_llm 0.081, ranking_recsys 0.063, llm_tooling 0.033
- multipliers: behavioral=0.93
- **vs #58 (Δ=0.0005):** driven by **behavioral** (0.929 vs 0.919); reverting it would cost rank #57 0.0076

### 58. CAND_0007411  —  0.6959  [HIGH]
- Senior Machine Learning Engineer (8.0y); caps[retrieval_ir:1.00,ranking_recsys:0.83,nlp_llm:0.66,llm_tooling:0.74]; 5 JD-relevant assessments avg=76
- additive: title=0.114, capability=0.327, assessment=0.138, text=0.178
  - capability ← retrieval_ir 0.146, ranking_recsys 0.095, nlp_llm 0.055, llm_tooling 0.031
- multipliers: behavioral=0.92
- **vs #59 (Δ=0.0016):** driven by **capability_match** (0.327 vs 0.292); reverting it would cost rank #58 0.0321

### 59. CAND_0035315  —  0.6944  [HIGH]
- Data Scientist (4.9y); caps[retrieval_ir:0.91,ranking_recsys:0.44,nlp_llm:0.94,production_systems:0.36]; 3 JD-relevant assessments avg=62
- additive: title=0.114, capability=0.292, assessment=0.112, text=0.157
  - capability ← retrieval_ir 0.133, nlp_llm 0.079, ranking_recsys 0.051, production_systems 0.030
- multipliers: experience=0.99, behavioral=1.04
- **vs #60 (Δ=0.0020):** driven by **behavioral** (1.043 vs 0.996); reverting it would cost rank #59 0.0315

### 60. CAND_0054123  —  0.6923  [HIGH]
- Applied ML Engineer (4.7y); caps[retrieval_ir:1.00,nlp_llm:0.98,production_systems:0.61,llm_tooling:0.79]; 3 JD-relevant assessments avg=72
- additive: title=0.114, capability=0.313, assessment=0.131, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.082, production_systems 0.051, llm_tooling 0.033
- multipliers: experience=0.96, behavioral=1.00
- **vs #61 (Δ=0.0010):** driven by **capability_match** (0.313 vs 0.281); reverting it would cost rank #60 0.0307

### 61. CAND_0022463  —  0.6913  [HIGH]
- Junior ML Engineer (6.5y); caps[retrieval_ir:0.88,ranking_recsys:0.47,nlp_llm:0.86,production_systems:0.30]; 3 JD-relevant assessments avg=73
- additive: title=0.114, capability=0.281, assessment=0.132, text=0.141
  - capability ← retrieval_ir 0.129, nlp_llm 0.072, ranking_recsys 0.054, production_systems 0.025
- multipliers: behavioral=1.03
- **vs #62 (Δ=0.0000):** driven by **assessment_evidence** (0.132 vs 0.112); reverting it would cost rank #61 0.0208

### 62. CAND_0021491  —  0.6912  [HIGH]
- AI Research Engineer (6.1y); caps[retrieval_ir:0.74,ranking_recsys:0.27,nlp_llm:0.95,production_systems:0.83]; 2 JD-relevant assessments avg=74
- additive: title=0.114, capability=0.288, assessment=0.112, text=0.150
  - capability ← retrieval_ir 0.109, nlp_llm 0.079, production_systems 0.069, ranking_recsys 0.031
- multipliers: behavioral=1.04
- **vs #63 (Δ=0.0028):** driven by **text_relevance** (0.150 vs 0.115); reverting it would cost rank #62 0.0367

### 63. CAND_0066791  —  0.6885  [HIGH]
- Senior Software Engineer (ML) (5.6y); caps[retrieval_ir:0.81,ranking_recsys:0.59,nlp_llm:0.62,production_systems:0.65]; 2 JD-relevant assessments avg=79
- additive: title=0.114, capability=0.324, assessment=0.120, text=0.115
  - capability ← retrieval_ir 0.118, ranking_recsys 0.068, production_systems 0.054, nlp_llm 0.052, llm_tooling 0.032
- multipliers: behavioral=1.02
- **vs #64 (Δ=0.0016):** driven by **assessment_evidence** (0.120 vs 0.000); reverting it would cost rank #63 0.1227

### 64. CAND_0068351  —  0.6868  [MED]
- Lead AI Engineer (6.4y); caps[retrieval_ir:1.00,ranking_recsys:0.94,nlp_llm:1.00,production_systems:0.77]
- additive: title=0.114, capability=0.402, text=0.157
  - capability ← retrieval_ir 0.146, ranking_recsys 0.108, nlp_llm 0.083, production_systems 0.064
- multipliers: behavioral=1.02
- **vs #65 (Δ=0.0011):** driven by **capability_match** (0.402 vs 0.302); reverting it would cost rank #64 0.1019

### 65. CAND_0078002  —  0.6857  [HIGH]
- Machine Learning Engineer (6.3y); caps[retrieval_ir:0.95,nlp_llm:1.00,production_systems:0.52,llm_tooling:0.88]; 1 JD-relevant assessments avg=80
- additive: title=0.114, capability=0.302, assessment=0.097, text=0.163
  - capability ← retrieval_ir 0.139, nlp_llm 0.083, production_systems 0.043, llm_tooling 0.037
- multipliers: behavioral=1.01
- **vs #66 (Δ=0.0018):** driven by **capability_match** (0.302 vs 0.277); reverting it would cost rank #65 0.0253

### 66. CAND_0066713  —  0.6839  [HIGH]
- Senior Software Engineer (ML) (5.7y); caps[retrieval_ir:0.38,ranking_recsys:0.53,nlp_llm:0.65,production_systems:0.84]; 4 JD-relevant assessments avg=81
- additive: title=0.114, capability=0.277, assessment=0.148, text=0.157
  - capability ← production_systems 0.070, ranking_recsys 0.061, retrieval_ir 0.056, nlp_llm 0.055, llm_tooling 0.035
- multipliers: behavioral=0.98
- **vs #67 (Δ=0.0008):** driven by **assessment_evidence** (0.148 vs 0.082); reverting it would cost rank #66 0.0654

### 67. CAND_0047542  —  0.6832  [HIGH]
- Senior Software Engineer (ML) (5.0y); caps[retrieval_ir:0.89,ranking_recsys:0.71,nlp_llm:0.90,production_systems:0.27]; 1 JD-relevant assessments avg=67
- additive: title=0.114, capability=0.311, assessment=0.082, text=0.157
  - capability ← retrieval_ir 0.131, ranking_recsys 0.082, nlp_llm 0.076, production_systems 0.023
- multipliers: behavioral=1.03
- **vs #68 (Δ=0.0002):** driven by **capability_match** (0.311 vs 0.296); reverting it would cost rank #67 0.0151

### 68. CAND_0020877  —  0.6829  [HIGH]
- Applied ML Engineer (5.1y); caps[retrieval_ir:1.00,nlp_llm:0.98,production_systems:0.35,llm_tooling:0.92]; 2 JD-relevant assessments avg=65
- additive: title=0.114, capability=0.296, assessment=0.099, text=0.167
  - capability ← retrieval_ir 0.146, nlp_llm 0.082, llm_tooling 0.038, production_systems 0.029
- multipliers: behavioral=1.01
- **vs #69 (Δ=0.0049):** driven by **capability_match** (0.296 vs 0.266); reverting it would cost rank #68 0.0307

### 69. CAND_0029671  —  0.6781  [HIGH]
- Data Scientist (5.7y); caps[retrieval_ir:0.98,nlp_llm:0.67,production_systems:0.35,llm_tooling:0.89]; 3 JD-relevant assessments avg=70
- additive: title=0.114, capability=0.266, assessment=0.127, text=0.150
  - capability ← retrieval_ir 0.143, nlp_llm 0.056, llm_tooling 0.037, production_systems 0.029
- multipliers: behavioral=1.03
- **vs #70 (Δ=0.0007):** driven by **assessment_evidence** (0.127 vs 0.078); reverting it would cost rank #69 0.0503

### 70. CAND_0039838  —  0.6774  [HIGH]
- Recommendation Systems Engineer (4.9y); caps[retrieval_ir:1.00,nlp_llm:1.00,production_systems:0.50,llm_tooling:0.66]; 2 JD-relevant assessments avg=52
- additive: title=0.114, capability=0.300, assessment=0.078, text=0.163
  - capability ← retrieval_ir 0.146, nlp_llm 0.083, production_systems 0.042, llm_tooling 0.028
- multipliers: experience=0.99, behavioral=1.05
- **vs #71 (Δ=0.0059):** driven by **capability_match** (0.300 vs 0.273); reverting it would cost rank #70 0.0273

### 71. CAND_0093912  —  0.6715  [HIGH]
- Senior Data Scientist (5.3y); caps[retrieval_ir:1.00,ranking_recsys:0.87,production_systems:0.32]; 1 JD-relevant assessments avg=75
- additive: title=0.114, capability=0.273, assessment=0.091, text=0.163
  - capability ← retrieval_ir 0.146, ranking_recsys 0.101, production_systems 0.026
- multipliers: behavioral=1.05
- **vs #72 (Δ=0.0015):** driven by **text_relevance** (0.163 vs 0.141); reverting it would cost rank #71 0.0224

### 72. CAND_0003791  —  0.6699  [HIGH]
- ML Engineer (6.6y); caps[retrieval_ir:0.97,nlp_llm:0.89,production_systems:0.80]; 1 JD-relevant assessments avg=84
- additive: title=0.114, capability=0.283, assessment=0.101, text=0.141
  - capability ← retrieval_ir 0.142, nlp_llm 0.075, production_systems 0.067
- multipliers: behavioral=1.05
- **vs #73 (Δ=0.0000):** driven by **capability_match** (0.283 vs 0.268); reverting it would cost rank #72 0.0162

### 73. CAND_0037566  —  0.6699  [HIGH]
- Machine Learning Engineer (6.9y); caps[retrieval_ir:0.99,nlp_llm:1.00,llm_tooling:0.94]; 1 JD-relevant assessments avg=82
- additive: title=0.114, capability=0.268, assessment=0.100, text=0.167
  - capability ← retrieval_ir 0.145, nlp_llm 0.083, llm_tooling 0.039
- multipliers: behavioral=1.03
- **vs #74 (Δ=0.0003):** driven by **text_relevance** (0.167 vs 0.150); reverting it would cost rank #73 0.0172

### 74. CAND_0030031  —  0.6696  [HIGH]
- AI Engineer (5.7y); caps[retrieval_ir:0.99,nlp_llm:1.00,production_systems:0.79]; 3 JD-relevant assessments avg=57
- additive: title=0.114, capability=0.295, assessment=0.104, text=0.150
  - capability ← retrieval_ir 0.145, nlp_llm 0.084, production_systems 0.066
- multipliers: behavioral=1.01
- **vs #75 (Δ=0.0018):** driven by **assessment_evidence** (0.104 vs 0.000); reverting it would cost rank #74 0.1048

### 75. CAND_0030827  —  0.6678  [MED]
- Senior Data Scientist (5.4y); caps[retrieval_ir:1.00,ranking_recsys:0.95,nlp_llm:0.97,llm_tooling:0.99]
- additive: title=0.114, capability=0.378, text=0.163
  - capability ← retrieval_ir 0.146, ranking_recsys 0.109, nlp_llm 0.081, llm_tooling 0.041
- multipliers: behavioral=1.02
- **vs #76 (Δ=0.0001):** driven by **experience** (1.000 vs 0.895); reverting it would cost rank #75 0.0701

### 76. CAND_0009837  —  0.6677  [HIGH]
- Senior Data Scientist (4.3y); caps[retrieval_ir:0.95,ranking_recsys:0.84,nlp_llm:0.96,production_systems:0.86]; 1 JD-relevant assessments avg=91
- additive: title=0.114, capability=0.405, assessment=0.110, text=0.150
  - capability ← retrieval_ir 0.139, ranking_recsys 0.096, nlp_llm 0.080, production_systems 0.072, llm_tooling 0.017
- multipliers: experience=0.90, behavioral=0.96
- **vs #77 (Δ=0.0001):** driven by **capability_match** (0.405 vs 0.380); reverting it would cost rank #76 0.0209

### 77. CAND_0064270  —  0.6676  [HIGH]
- Applied ML Engineer (4.2y); caps[retrieval_ir:1.00,ranking_recsys:0.85,nlp_llm:0.98,production_systems:0.24]; 1 JD-relevant assessments avg=74
- additive: title=0.114, capability=0.380, assessment=0.089, text=0.167
  - capability ← retrieval_ir 0.146, ranking_recsys 0.098, nlp_llm 0.082, llm_tooling 0.035, production_systems 0.020
- multipliers: experience=0.88, behavioral=1.01
- **vs #78 (Δ=0.0002):** driven by **text_relevance** (0.167 vs 0.130); reverting it would cost rank #77 0.0331

### 78. CAND_0066035  —  0.6674  [HIGH]
- Data Scientist (6.7y); caps[retrieval_ir:0.97,ranking_recsys:0.77,nlp_llm:0.89,production_systems:0.49]; 2 JD-relevant assessments avg=53
- additive: title=0.114, capability=0.346, assessment=0.081, text=0.130
  - capability ← retrieval_ir 0.142, ranking_recsys 0.088, nlp_llm 0.075, production_systems 0.041
- multipliers: behavioral=1.00
- **vs #79 (Δ=0.0002):** driven by **capability_match** (0.346 vs 0.260); reverting it would cost rank #78 0.0859

### 79. CAND_0045250  —  0.6672  [HIGH]
- Applied ML Engineer (6.6y); caps[retrieval_ir:1.00,nlp_llm:1.00,llm_tooling:0.71]; 4 JD-relevant assessments avg=69
- additive: title=0.114, capability=0.260, assessment=0.125, text=0.163
  - capability ← retrieval_ir 0.146, nlp_llm 0.084, llm_tooling 0.030
- multipliers: behavioral=1.01
- **vs #80 (Δ=0.0026):** driven by **capability_match** (0.260 vs 0.239); reverting it would cost rank #79 0.0207

### 80. CAND_0053591  —  0.6646  [HIGH]
- AI Engineer (5.3y); caps[retrieval_ir:1.00,nlp_llm:0.78,llm_tooling:0.66]; 1 JD-relevant assessments avg=90
- additive: title=0.114, capability=0.239, assessment=0.109, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.065, llm_tooling 0.028
- multipliers: behavioral=1.05
- **vs #81 (Δ=0.0005):** driven by **experience** (1.000 vs 0.970); reverting it would cost rank #80 0.0199

### 81. CAND_0026532  —  0.6641  [HIGH]
- Recommendation Systems Engineer (4.8y); caps[retrieval_ir:1.00,nlp_llm:0.92,llm_tooling:0.60]; 3 JD-relevant assessments avg=74
- additive: title=0.114, capability=0.248, assessment=0.134, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.077, llm_tooling 0.025
- multipliers: experience=0.97, behavioral=1.03
- **vs #82 (Δ=0.0002):** driven by **assessment_evidence** (0.134 vs 0.085); reverting it would cost rank #81 0.0489

### 82. CAND_0032216  —  0.6639  [HIGH]
- ML Engineer (6.1y); caps[retrieval_ir:0.98,ranking_recsys:0.73,nlp_llm:0.89,production_systems:0.24]; 1 JD-relevant assessments avg=70
- additive: title=0.114, capability=0.323, assessment=0.085, text=0.141
  - capability ← retrieval_ir 0.144, ranking_recsys 0.085, nlp_llm 0.075, production_systems 0.020
- multipliers: all neutral
- **vs #83 (Δ=0.0003):** driven by **capability_match** (0.323 vs 0.268); reverting it would cost rank #82 0.0555

### 83. CAND_0072688  —  0.6636  [HIGH]
- Data Scientist (6.9y); caps[retrieval_ir:0.90,ranking_recsys:0.63,nlp_llm:0.76]; 2 JD-relevant assessments avg=66
- additive: title=0.114, capability=0.268, assessment=0.100, text=0.150
  - capability ← retrieval_ir 0.132, ranking_recsys 0.073, nlp_llm 0.063
- multipliers: behavioral=1.05
- **vs #84 (Δ=0.0010):** driven by **behavioral** (1.050 vs 1.036); reverting it would cost rank #83 0.0086

### 84. CAND_0036184  —  0.6627  [HIGH]
- Recommendation Systems Engineer (6.0y); caps[retrieval_ir:1.00,nlp_llm:0.97,llm_tooling:0.81]; 4 JD-relevant assessments avg=62
- additive: title=0.114, capability=0.262, assessment=0.113, text=0.150
  - capability ← retrieval_ir 0.146, nlp_llm 0.081, llm_tooling 0.034
- multipliers: behavioral=1.04
- **vs #85 (Δ=0.0003):** driven by **assessment_evidence** (0.113 vs 0.000); reverting it would cost rank #84 0.1175

### 85. CAND_0005649  —  0.6624  [MED]
- Senior Data Scientist (7.4y); caps[retrieval_ir:0.99,ranking_recsys:0.76,nlp_llm:0.94,production_systems:0.16]
- additive: title=0.114, capability=0.351, text=0.173
  - capability ← retrieval_ir 0.144, ranking_recsys 0.087, nlp_llm 0.079, llm_tooling 0.027, production_systems 0.013
- multipliers: behavioral=1.04
- **vs #86 (Δ=0.0006):** driven by **capability_match** (0.351 vs 0.312); reverting it would cost rank #85 0.0397

### 86. CAND_0069232  —  0.6617  [HIGH]
- ML Engineer (6.3y); caps[retrieval_ir:0.81,ranking_recsys:0.50,nlp_llm:0.83,production_systems:0.80]; 2 JD-relevant assessments avg=64
- additive: title=0.114, capability=0.312, assessment=0.097, text=0.141
  - capability ← retrieval_ir 0.119, nlp_llm 0.070, production_systems 0.067, ranking_recsys 0.057
- multipliers: behavioral=1.00
- **vs #87 (Δ=0.0001):** driven by **capability_match** (0.312 vs 0.265); reverting it would cost rank #86 0.0474

### 87. CAND_0040117  —  0.6616  [HIGH]
- Recommendation Systems Engineer (6.5y); caps[retrieval_ir:0.99,nlp_llm:0.94,llm_tooling:0.99]; 2 JD-relevant assessments avg=58
- additive: title=0.114, capability=0.265, assessment=0.088, text=0.170
  - capability ← retrieval_ir 0.145, nlp_llm 0.079, llm_tooling 0.041
- multipliers: behavioral=1.04
- **vs #88 (Δ=0.0003):** driven by **experience** (1.000 vs 0.910); reverting it would cost rank #87 0.0595

### 88. CAND_0030784  —  0.6613  [HIGH]
- Data Scientist (4.4y); caps[retrieval_ir:0.93,ranking_recsys:0.39,nlp_llm:0.91,production_systems:0.73]; 3 JD-relevant assessments avg=65
- additive: title=0.114, capability=0.317, assessment=0.118, text=0.150
  - capability ← retrieval_ir 0.136, nlp_llm 0.076, production_systems 0.061, ranking_recsys 0.045
- multipliers: experience=0.91, behavioral=1.04
- **vs #89 (Δ=0.0006):** driven by **assessment_evidence** (0.118 vs 0.093); reverting it would cost rank #88 0.0231

### 89. CAND_0036604  —  0.6608  [HIGH]
- ML Engineer (4.7y); caps[retrieval_ir:0.81,ranking_recsys:0.47,nlp_llm:0.80,production_systems:0.51]; 1 JD-relevant assessments avg=77
- additive: title=0.114, capability=0.314, assessment=0.093, text=0.150
  - capability ← retrieval_ir 0.119, nlp_llm 0.067, ranking_recsys 0.054, production_systems 0.043, llm_tooling 0.032
- multipliers: experience=0.96, behavioral=1.03
- **vs #90 (Δ=0.0002):** driven by **capability_match** (0.314 vs 0.282); reverting it would cost rank #89 0.0314

### 90. CAND_0011432  —  0.6606  [HIGH]
- Senior Data Scientist (7.6y); caps[retrieval_ir:0.99,nlp_llm:0.95,production_systems:0.28,llm_tooling:0.80]; 1 JD-relevant assessments avg=57
- additive: title=0.114, capability=0.282, assessment=0.070, text=0.170
  - capability ← retrieval_ir 0.146, nlp_llm 0.079, llm_tooling 0.034, production_systems 0.024
- multipliers: behavioral=1.04
- **vs #91 (Δ=0.0011):** driven by **assessment_evidence** (0.070 vs 0.000); reverting it would cost rank #90 0.0722

### 91. CAND_0051630  —  0.6595  [MED]
- Machine Learning Engineer (6.0y); caps[retrieval_ir:1.00,ranking_recsys:0.67,nlp_llm:1.00,production_systems:0.88]
- additive: title=0.114, capability=0.381, text=0.167
  - capability ← retrieval_ir 0.146, nlp_llm 0.083, ranking_recsys 0.077, production_systems 0.074
- multipliers: behavioral=1.00
- **vs #92 (Δ=0.0007):** driven by **capability_match** (0.381 vs 0.332); reverting it would cost rank #91 0.0492

### 92. CAND_0089546  —  0.6587  [HIGH]
- Machine Learning Engineer (4.8y); caps[retrieval_ir:0.97,ranking_recsys:0.70,nlp_llm:0.99,llm_tooling:0.62]; 2 JD-relevant assessments avg=59
- additive: title=0.114, capability=0.332, assessment=0.090, text=0.141
  - capability ← retrieval_ir 0.142, nlp_llm 0.083, ranking_recsys 0.081, llm_tooling 0.026
- multipliers: experience=0.97, behavioral=1.00
- **vs #93 (Δ=0.0012):** driven by **capability_match** (0.332 vs 0.283); reverting it would cost rank #92 0.0471

### 93. CAND_0008295  —  0.6576  [HIGH]
- AI Research Engineer (6.5y); caps[retrieval_ir:0.82,nlp_llm:0.86,production_systems:0.87,llm_tooling:0.44]; 1 JD-relevant assessments avg=59
- additive: title=0.114, capability=0.283, assessment=0.072, text=0.157
  - capability ← retrieval_ir 0.120, production_systems 0.072, nlp_llm 0.072, llm_tooling 0.018
- multipliers: behavioral=1.05
- **vs #94 (Δ=0.0023):** driven by **text_relevance** (0.157 vs 0.115); reverting it would cost rank #93 0.0444

### 94. CAND_0095213  —  0.6553  [HIGH]
- ML Engineer (5.1y); caps[retrieval_ir:0.93,nlp_llm:0.90,production_systems:0.79,llm_tooling:0.68]; 3 JD-relevant assessments avg=63
- additive: title=0.114, capability=0.305, assessment=0.114, text=0.115
  - capability ← retrieval_ir 0.136, nlp_llm 0.075, production_systems 0.066, llm_tooling 0.028
- multipliers: behavioral=1.01
- **vs #95 (Δ=0.0004):** driven by **capability_match** (0.305 vs 0.262); reverting it would cost rank #94 0.0441

### 95. CAND_0025640  —  0.6548  [HIGH]
- AI Research Engineer (5.6y); caps[retrieval_ir:0.98,ranking_recsys:0.57,nlp_llm:0.28,production_systems:0.36]; 2 JD-relevant assessments avg=64
- additive: title=0.114, capability=0.262, assessment=0.098, text=0.150
  - capability ← retrieval_ir 0.143, ranking_recsys 0.065, production_systems 0.030, nlp_llm 0.023
- multipliers: behavioral=1.05
- **vs #96 (Δ=0.0011):** driven by **assessment_evidence** (0.098 vs 0.000); reverting it would cost rank #95 0.1026

### 96. CAND_0098846  —  0.6537  [MED]
- AI Engineer (7.6y); caps[retrieval_ir:0.97,ranking_recsys:0.80,nlp_llm:0.98,llm_tooling:0.73]
- additive: title=0.114, capability=0.346, text=0.173
  - capability ← retrieval_ir 0.142, ranking_recsys 0.092, nlp_llm 0.082, llm_tooling 0.031
- multipliers: behavioral=1.03
- **vs #97 (Δ=0.0006):** driven by **text_relevance** (0.173 vs 0.167); reverting it would cost rank #96 0.0061

### 97. CAND_0018722  —  0.6531  [MED]
- Recommendation Systems Engineer (6.6y); caps[retrieval_ir:0.93,ranking_recsys:0.48,nlp_llm:0.98,production_systems:0.81]
- additive: title=0.114, capability=0.341, text=0.167
  - capability ← retrieval_ir 0.136, nlp_llm 0.082, production_systems 0.067, ranking_recsys 0.055
- multipliers: behavioral=1.05
- **vs #98 (Δ=0.0013):** driven by **capability_match** (0.341 vs 0.270); reverting it would cost rank #97 0.0743

### 98. CAND_0010541  —  0.6518  [HIGH]
- AI Research Engineer (6.2y); caps[retrieval_ir:0.98,nlp_llm:0.80,production_systems:0.72]; 2 JD-relevant assessments avg=61
- additive: title=0.114, capability=0.270, assessment=0.092, text=0.150
  - capability ← retrieval_ir 0.143, nlp_llm 0.067, production_systems 0.060
- multipliers: behavioral=1.04
- **vs #99 (Δ=0.0006):** driven by **assessment_evidence** (0.092 vs 0.084); reverting it would cost rank #98 0.0079

### 99. CAND_0061257  —  0.6513  [HIGH]
- Staff Machine Learning Engineer (8.0y); caps[retrieval_ir:0.97,nlp_llm:0.56,production_systems:1.00]; 1 JD-relevant assessments avg=70
- additive: title=0.114, capability=0.273, assessment=0.084, text=0.150
  - capability ← retrieval_ir 0.143, production_systems 0.084, nlp_llm 0.047
- multipliers: behavioral=1.05
- **vs #100 (Δ=0.0012):** driven by **assessment_evidence** (0.084 vs 0.061); reverting it would cost rank #99 0.0246

### 100. CAND_0010149  —  0.6501  [HIGH]
- ML Engineer (6.9y); caps[retrieval_ir:0.98,ranking_recsys:0.77,nlp_llm:0.67,llm_tooling:0.35]; 1 JD-relevant assessments avg=50
- additive: title=0.114, capability=0.303, assessment=0.061, text=0.150
  - capability ← retrieval_ir 0.143, ranking_recsys 0.089, nlp_llm 0.056, llm_tooling 0.014
- multipliers: behavioral=1.04
