"""JD → RoleDNA for the Redrob Senior-AI-Engineer challenge.

This is the *semantic interpretation of the JD* (not a flat feature list), built
deterministically and offline — mirroring the platform's `app.shared.models.RoleDNA`
(must_have_skills, capability_weights, engineering_level, red_flags) but kept
dependency-light so `rank.py` runs standalone on CPU with no network.

CAPABILITY GROUPS replace independent-skill matching: five JD-derived capabilities,
each a cluster of skill fingerprints. WEIGHTS are derived from the JD's explicit
"absolutely need" vs "nice to have" sections (provenance noted inline) and are
EXPLICITLY MARKED for Intelligence-Lab ablation — no weight is sacred.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Capability:
    key: str
    weight: float           # JD-derived; ablate in the Lab
    members: tuple[str, ...]  # lowercased skill-name substrings
    provenance: str


# -- capability taxonomy ---------------------------------------------------- #
# Weights sum to ~1.0. Provenance ties each to a JD sentence so the rubric is
# defensible in the Stage-5 interview.
CAPABILITIES: tuple[Capability, ...] = (
    Capability(
        "retrieval_ir", 0.28,
        ("information retrieval", "semantic search", "vector search", "embeddings",
         "sentence transformers", "faiss", "pinecone", "weaviate", "qdrant", "milvus",
         "pgvector", "bm25", "elasticsearch", "opensearch", "hugging face transformers",
         # synonym enrichment for hidden-set robustness (B3) — ranking-neutral on this dataset
         "dense retrieval", "sparse retrieval", "hybrid search", "hybrid retrieval",
         "approximate nearest neighbor", "nearest neighbor", "ann", "knn",
         "vector database", "vector db", "lexical search", "neural search", "colbert"),
        "JD 'absolutely need': embeddings-based retrieval + vector DB / hybrid search",
    ),
    Capability(
        "ranking_recsys", 0.22,
        ("learning to rank", "ranking", "rerank", "recommendation systems", "recommender",
         # synonym enrichment for hidden-set robustness (B3)
         "ltr", "pointwise", "pairwise", "listwise", "collaborative filtering",
         "matrix factorization", "two-tower", "candidate generation", "relevance ranking"),
        "JD owns 'the ranking, retrieval and matching systems'; LTR a named nice-to-have",
    ),
    Capability(
        "nlp_llm", 0.16,
        ("nlp", "llms", "transformer", "bert", "fine-tuning llms", "lora", "qlora", "peft"),
        "JD 'deep technical depth in modern ML: embeddings, retrieval, ranking, LLMs, fine-tuning'",
    ),
    Capability(
        "production_systems", 0.16,
        ("python", "spark", "airflow", "kafka", "docker", "kubernetes", "ci/cd", "aws",
         "microservices", "etl", "databricks", "sql", "fastapi", "flask", "go", "java"),
        "JD 'production experience deployed to real users', 'strong Python', distributed systems",
    ),
    Capability(
        "eval_systems", 0.10,
        ("ndcg", "mrr", "map", "evaluation", "a/b", "experimentation", "offline metrics"),
        "JD 'absolutely need': designing evaluation frameworks for ranking (NDCG/MRR/MAP)",
    ),
    Capability(
        "llm_tooling", 0.08,
        ("langchain", "llamaindex", "crewai", "autogen", "agent", "mcp", "prompt engineering",
         "openai api"),
        "Nice-to-have only — JD warns against 'framework enthusiasts'; capped low on purpose",
    ),
)


@dataclass(frozen=True)
class JDRoleDNA:
    """The challenge JD as structured hiring intent."""

    role_summary: str
    capabilities: tuple[Capability, ...]
    exp_ideal_min: float
    exp_ideal_max: float
    # JD's explicit "things we explicitly do NOT want" → deterministic penalties
    red_flags: tuple[str, ...]
    # JD-relevant vocabulary for free-text relevance (the 'JD-means' rescue signal)
    text_relevance_terms: tuple[str, ...]
    # boilerplate-summary fingerprints (proven 100% honeypot marker)
    boilerplate_markers: tuple[str, ...]
    weights_are_ablatable: bool = field(default=True)

    def capability(self, key: str) -> Capability:
        return next(c for c in self.capabilities if c.key == key)


SENIOR_AI_ENGINEER = JDRoleDNA(
    role_summary=(
        "Senior AI Engineer owning the intelligence layer (retrieval, ranking, matching) of a "
        "Series-A talent platform; embeddings + hybrid retrieval + LLM re-ranking; rigorous "
        "evaluation (NDCG/MRR/MAP); production shipper at a product company, 5-9 yrs."
    ),
    capabilities=CAPABILITIES,
    exp_ideal_min=5.0,
    exp_ideal_max=9.0,
    red_flags=(
        "research_only",          # pure academic / research-only, no production
        "services_only",          # entire career at TCS/Infosys/… type firms
        "offdomain_only",         # CV/speech/robotics with no IR/NLP
        "framework_enthusiast",   # only LangChain-calling-OpenAI, no depth
    ),
    text_relevance_terms=(
        "retrieval", "ranking", "rerank", "recommendation", "embedding", "vector",
        "semantic search", "search", "nlp", "fine-tun", "production", "deployed",
        "real users", "scale", "evaluation", "ndcg", "mrr", "a/b", "pipeline",
        "matching", "recsys", "information retrieval",
    ),
    boilerplate_markers=(
        "driving outcomes in my domain",
        "typical responsibilities of the role",
        "team management, stakeholder communication",
        "built strong functional expertise",
    ),
)
