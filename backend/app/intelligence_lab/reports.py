"""Report renderers for the DELULU Intelligence Lab.

Turn a :class:`~app.intelligence_lab.benchmark.BenchmarkReport` into the three
formats a hackathon demo and a CI gate both want: Markdown (human), JSON
(machine / archival), and CSV (spreadsheets / quick charts). Rendering only — no
computation lives here, so the numbers always match the benchmark run.
"""

from __future__ import annotations

import csv
import io

from app.intelligence_lab.benchmark import BenchmarkReport

__all__ = ["to_json", "to_csv", "to_markdown"]


def to_json(report: BenchmarkReport, *, indent: int = 2) -> str:
    """Full report as JSON (round-trips via ``BenchmarkReport.model_validate_json``)."""
    return report.model_dump_json(indent=indent)


def to_csv(report: BenchmarkReport) -> str:
    """Per-job rows with one column per metric — sorted worst-first for triage."""
    metric_keys = sorted({k for q in report.queries for k in q.metrics})
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["job_id", "n_candidates", "n_relevant", "latency_ms", *metric_keys])
    for q in report.ranked_queries(by="map", best=False):
        writer.writerow(
            [q.job_id, q.n_candidates, q.n_relevant, q.latency_ms]
            + [round(q.metrics.get(k, 0.0), 4) for k in metric_keys]
        )
    return buf.getvalue()


def _table(rows: list[list[str]], headers: list[str]) -> str:
    line = "| " + " | ".join(headers) + " |"
    sep = "| " + " | ".join("---" for _ in headers) + " |"
    body = "\n".join("| " + " | ".join(r) + " |" for r in rows)
    return "\n".join([line, sep, body]) if rows else "\n".join([line, sep])


def to_markdown(report: BenchmarkReport, *, top_n: int = 3) -> str:
    """Human-readable summary: headline, metric breakdown, latency, best/worst jobs."""
    out: list[str] = []
    out.append(f"# Benchmark — `{report.dataset_key}`")
    out.append("")
    out.append(f"- **Target:** `{report.target_name}`")
    out.append(f"- **Generated:** {report.generated_at.isoformat()}")
    out.append(f"- **Jobs scored:** {len(report.queries)} / {report.metadata.get('n_jobs', '?')}")
    out.append(f"- **Overall score:** **{report.overall_score:.4f}**")
    failed = report.metadata.get("failed_jobs") or []
    if failed:
        out.append(f"- ⚠️ **Failed jobs:** {len(failed)} ({'; '.join(failed[:3])})")
    out.append("")

    out.append("## Metric breakdown")
    out.append("")
    metric_rows = [[k, f"{v:.4f}"] for k, v in sorted(report.summary.items())]
    out.append(_table(metric_rows, ["Metric", "Score"]))
    out.append("")

    out.append("## Pipeline / latency")
    out.append("")
    lat_rows = [[k, f"{v:g}"] for k, v in report.latency.items()]
    out.append(_table(lat_rows, ["Stat", "Value"]))
    out.append("")

    def _job_rows(best: bool) -> list[list[str]]:
        return [
            [q.job_id, f"{q.metrics.get('map', 0.0):.4f}", f"{q.metrics.get('ndcg@10', 0.0):.4f}"]
            for q in report.ranked_queries(by="map", best=best)[:top_n]
        ]

    out.append(f"## Best jobs (top {top_n})")
    out.append("")
    out.append(_table(_job_rows(best=True), ["Job", "MAP", "NDCG@10"]))
    out.append("")
    out.append(f"## Worst jobs (bottom {top_n})")
    out.append("")
    out.append(_table(_job_rows(best=False), ["Job", "MAP", "NDCG@10"]))
    out.append("")
    return "\n".join(out)
