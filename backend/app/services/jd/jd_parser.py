"""JD Parser — legacy text paste endpoint."""

from app.schemas.fields import ExtractedField
from app.schemas.job import RoleBlueprint


async def parse_job_description(title: str, description: str) -> RoleBlueprint:
    return RoleBlueprint(
        role_title=ExtractedField(value=title, confidence=0.5, source=title),
        experience_level=ExtractedField(value="mid", confidence=0.5),
        required_skills=[],
        behavioral_traits=[
            ExtractedField(value="Ownership", confidence=0.5),
            ExtractedField(value="Execution", confidence=0.5),
            ExtractedField(value="Learning", confidence=0.5),
        ],
        capability_weights={
            "technical": 0.35,
            "execution": 0.25,
            "ownership": 0.20,
            "learning": 0.20,
        },
        required_evidence=["projects", "github", "production_systems"],
    )
