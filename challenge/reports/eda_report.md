# Redrob Challenge — Candidate Dataset Forensic Report

**Records analyzed:** 100,000  
**Latest `last_active_date` in data:** 2026-05-27  
**JD:** Senior AI Engineer, 5–9 yrs, retrieval/ranking/embeddings at product companies

## 1. Field completeness (present & non-empty)

| field | coverage |
|---|---|
| profile.current_title | 100.0% |
| profile.current_industry | 100.0% |
| profile.location | 100.0% |
| profile.summary | 100.0% |
| profile.headline | 100.0% |
| career_history | 100.0% |
| education | 100.0% |
| skills | 100.0% |
| certifications |  25.0% |
| languages | 100.0% |
| redrob github linked (score≥0) |  35.4% |
| redrob offer history (rate≥0) |  40.4% |

## 2. Experience distribution

years_of_experience — min 1.0, median 6.8, mean 7.2, p90 13.0, max 16.9

| band | count | share |
|---|---|---|
| 0-2 | 7,470 |   7.5% |
| 2-5 | 26,400 |  26.4% |
| 5-9 (JD band) | 34,375 |  34.4% |
| 9+ | 31,755 |  31.8% |

## 3. Title buckets & top titles

_'non-software-eng' = Mechanical/Civil/etc. — off-target for an AI-Engineer JD and honeypot-prone when stacked with AI skills._

| bucket | count | share |
|---|---|---|
| engineering | 30,142 |  30.1% |
| non-technical | 57,328 |  57.3% |
| non-software-eng | 11,493 |  11.5% |
| other | 1,037 |   1.0% |

**Top 25 current_title:**

| title | count |
|---|---|
| Business Analyst | 5,833 |
| HR Manager | 5,830 |
| Mechanical Engineer | 5,791 |
| Accountant | 5,764 |
| Project Manager | 5,754 |
| Customer Support | 5,750 |
| Operations Manager | 5,744 |
| Content Writer | 5,727 |
| Sales Executive | 5,713 |
| Civil Engineer | 5,702 |
| Graphic Designer | 5,689 |
| Marketing Manager | 5,524 |
| Software Engineer | 3,450 |
| Full Stack Developer | 2,873 |
| Cloud Engineer | 2,836 |
| Java Developer | 2,809 |
| .NET Developer | 2,788 |
| DevOps Engineer | 2,787 |
| Mobile Developer | 2,757 |
| Frontend Engineer | 2,738 |
| QA Engineer | 2,682 |
| Analytics Engineer | 764 |
| Data Engineer | 744 |
| Data Analyst | 728 |
| Backend Engineer | 704 |

## 4. Skills

distinct skills: 133; per candidate — median 9, mean 9.6, p90 14, max 23

**Top 30 skills:**

| skill | count | share |
|---|---|---|
| html | 12,246 |  12.2% |
| databricks | 12,244 |  12.2% |
| redux | 12,222 |  12.2% |
| terraform | 12,187 |  12.2% |
| angular | 12,173 |  12.2% |
| figma | 12,157 |  12.2% |
| salesforce crm | 12,157 |  12.2% |
| vue.js | 12,142 |  12.1% |
| sales | 12,138 |  12.1% |
| accounting | 12,136 |  12.1% |
| agile | 12,135 |  12.1% |
| kafka | 12,114 |  12.1% |
| excel | 12,109 |  12.1% |
| bigquery | 12,108 |  12.1% |
| ci/cd | 12,108 |  12.1% |
| project management | 12,106 |  12.1% |
| airflow | 12,105 |  12.1% |
| aws | 12,104 |  12.1% |
| flask | 12,104 |  12.1% |
| scrum | 12,083 |  12.1% |
| illustrator | 12,072 |  12.1% |
| kubernetes | 12,071 |  12.1% |
| etl | 12,068 |  12.1% |
| css | 12,065 |  12.1% |
| docker | 12,062 |  12.1% |
| next.js | 12,058 |  12.1% |
| apache beam | 12,054 |  12.1% |
| java | 12,049 |  12.0% |
| go | 12,049 |  12.0% |
| typescript | 12,048 |  12.0% |

**Rarity:** 14 skills appear ≤100 times ( 10.5% of distinct skills). Rare ≠ noise — a scarce retrieval/ranking skill is far more discriminating than ubiquitous Python.

**Uniformity:** the 99 'common' skills (≥2,000 occurrences) each appear ~9,425 times with a coefficient of variation of only **0.366** (≈9.4% of candidates each). The distribution is near-flat ⇒ skills are sprinkled **independently of role fit**. **Keyword count is a trap by construction — the discriminative signal lives in title + career history + summary, not the skills list.**

**Sample AI-core skill frequencies (the JD's real asks):**

| ai-core skill | count |
|---|---|
| hugging face transformers | 5,163 |
| information retrieval | 5,135 |
| llms | 5,094 |
| recommendation systems | 5,091 |
| semantic search | 5,087 |
| sentence transformers | 5,081 |
| embeddings | 5,080 |
| vector search | 5,065 |
| pinecone | 5,062 |
| faiss | 5,052 |
| rag | 4,995 |
| fine-tuning llms | 4,920 |
| qlora | 1,401 |
| pgvector | 1,394 |
| weaviate | 1,389 |
| milvus | 1,384 |
| learning to rank | 1,383 |
| bm25 | 1,382 |
| qdrant | 1,379 |
| peft | 1,377 |

## 5. Redrob behavioral signals (availability is a multiplier, not a feature)

| signal | min | p25 | median | mean | p75 | p90 | max |
|---|---|---|---|---|---|---|---|
| profile_completeness_score | 25.00 | 42.20 | 56.80 | 56.76 | 71.60 | 80.40 | 99.90 |
| recruiter_response_rate | 0.02 | 0.25 | 0.44 | 0.44 | 0.62 | 0.73 | 0.95 |
| avg_response_time_hours | 2.10 | 68.30 | 129.90 | 132.70 | 193.30 | 240.40 | 280.00 |
| interview_completion_rate | 0.30 | 0.48 | 0.62 | 0.62 | 0.76 | 0.85 | 1.00 |
| offer_acceptance_rate | -1.00 | -1.00 | -1.00 | -0.40 | 0.40 | 0.63 | 0.93 |
| github_activity_score | -1.00 | -1.00 | -1.00 | 9.62 | 16.70 | 40.40 | 96.90 |
| endorsements_received | 0.00 | 14.00 | 28.00 | 30.07 | 43.00 | 55.00 | 242.00 |
| saved_by_recruiters_30d | 0.00 | 3.00 | 7.00 | 7.66 | 11.00 | 15.00 | 80.00 |
| profile_views_received_30d | 0.00 | 23.00 | 45.00 | 47.99 | 68.00 | 86.00 | 374.00 |
| applications_submitted_30d | 0.00 | 2.00 | 5.00 | 5.39 | 8.00 | 10.00 | 24.00 |
| notice_period_days | 0.00 | 60.00 | 90.00 | 87.39 | 120.00 | 150.00 | 150.00 |

**Boolean signals (true rate):**

| signal | true rate |
|---|---|
| open_to_work_flag |  35.3% |
| willing_to_relocate |  28.8% |
| verified_email |  72.0% |
| verified_phone |  61.8% |
| linkedin_connected |  36.0% |

**Inactivity (days since last_active, relative to 2026-06-29):** median 138d, p90 239d, max 273d. JD: down-weight the dormant + low-response candidate — 'not actually available'.

**Preferred work mode:** hybrid=25,076, onsite=25,000, flexible=25,000, remote=24,924

## 6. Honeypots & JD disqualifiers (this is where the leaderboard is won)

| pattern | count | share | rationale |
|---|---|---|---|
| off-target title (non-tech/mech/civil) + ≥4 AI skills | 5,517 |   5.5% | explicit keyword-stuffer trap |
| keyword stuffer (≥5 AI skills, ≥4 shallow) | 124 |   0.1% | low endorsement+duration ⇒ not real |
| services-firm-only career | 9,745 |   9.7% | JD down-weights TCS/Infosys/… only |
| research-only title | 0 |   0.0% | JD disqualifier |
| off-domain only (CV/speech/robotics) | 8,878 |   8.9% | JD disqualifier |
| job hopper (3+ jobs all <18mo) | 210 |   0.2% | JD: title-chasers |

**Honeypot examples:**

- `CAND_0000021` — *Project Manager* — skills: recommendation systems, fine-tuning llms, pinecone, vector search, embeddings, faiss, prompt engineering, langchain
- `CAND_0000074` — *Operations Manager* — skills: information retrieval, hugging face transformers, sentence transformers, recommendation systems, embeddings, rag, llms, faiss
- `CAND_0000083` — *Graphic Designer* — skills: semantic search, pinecone, fine-tuning llms, rag, hugging face transformers, recommendation systems, information retrieval, faiss
- `CAND_0000097` — *Mechanical Engineer* — skills: information retrieval, semantic search, sentence transformers, hugging face transformers, rag, pinecone, vector search, faiss
- `CAND_0000120` — *Graphic Designer* — skills: rag, hugging face transformers, vector search, semantic search, information retrieval, llms, fine-tuning llms, sentence transformers
- `CAND_0000121` — *Customer Support* — skills: faiss, vector search, recommendation systems, rag, fine-tuning llms, hugging face transformers, information retrieval, pinecone
- `CAND_0000133` — *Graphic Designer* — skills: hugging face transformers, llms, sentence transformers, fine-tuning llms, vector search, semantic search, pinecone
- `CAND_0000201` — *Marketing Manager* — skills: information retrieval, embeddings, fine-tuning llms, hugging face transformers, rag, llms, langchain, rag

## 7. Ideal-candidate funnel (the JD said 'maybe 10 great matches')

| filter | surviving | share |
|---|---|---|
| all | 100,000 | 100.0% |
| in 5–9 yr band | 34,375 |  34.4% |
| engineering title | 30,142 |  30.1% |
| has ≥1 AI-core skill | 24,782 |  24.8% |
| **all three (rough ideal)** | **8,522** |   8.5% |

**Ideal-candidate examples:**

- `CAND_0000001` — *Backend Engineer* — 6.9y — nlp, fine-tuning llms, lora, milvus
- `CAND_0000014` — *Frontend Engineer* — 8.4y — faiss, opensearch
- `CAND_0000015` — *Software Engineer* — 5.4y — qdrant
- `CAND_0000031` — *Recommendation Systems Engineer* — 6.0y — faiss, pinecone, embeddings, information retrieval, hugging face transformers, sentence transformers
- `CAND_0000032` — *.NET Developer* — 8.1y — embeddings
- `CAND_0000038` — *Java Developer* — 6.7y — weaviate
- `CAND_0000043` — *Cloud Engineer* — 8.3y — elasticsearch, opensearch, fine-tuning llms, peft
- `CAND_0000060` — *Cloud Engineer* — 8.0y — lora

## 8. Geography

JD-preferred locations (Noida/Pune/Hyd/Mumbai/Delhi/Blr): ~ 29.2% of candidates.

**Top 12 locations:** Bhubaneswar, Odisha (4,321), Noida, Uttar Pradesh (4,283), Hyderabad, Telangana (4,283), Jaipur, Rajasthan (4,268), Bangalore, Karnataka (4,238), Kolkata, West Bengal (4,230), Indore, Madhya Pradesh (4,198), Pune, Maharashtra (4,186), Chennai, Tamil Nadu (4,164), Delhi, Delhi (4,161), Trivandrum, Kerala (4,151), Ahmedabad, Gujarat (4,143)

**Top 8 countries:** India (75,113), USA (9,978), Australia (2,579), Canada (2,506), UK (2,472), Germany (2,469), Singapore (2,453), UAE (2,430)

## 9. Takeaways for the ChallengeRankingEngine

1. **Score all 100k in one cheap pass** — no retrieval funnel needed; the reference does 50k/10s on CPU.
2. **Title + career history is the honeypot discriminator**, not skill-keyword count. Weight it heavily and gate non-technical titles.
3. **Trust-weight skills** by endorsements × duration so keyword stuffers collapse.
4. **Behavioral signals are a multiplier** (response rate, recency, open-to-work, interview-completion) — apply *after* skill match, not as additive features.
5. **Reward the JD-means case** (transition-into-ML at product cos via career_history descriptions) and **penalize** services-only / research-only / off-domain / job-hopper patterns.
6. **Experience band is soft** — the JD says 5–9 is a guide, not a gate; partial credit just outside.
