"""Soft confidence gates for human review."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.fields import ExtractedField, SkillField
from app.schemas.job import RoleBlueprint

CRITICAL_FIELDS = frozenset({
    "role_title",
    "required_skills",
    "experience_level",
    "capability_weights",
})

GREEN_THRESHOLD = 0.85
YELLOW_THRESHOLD = 0.60


class ConfidenceBand(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"


class FieldValidationResult(BaseModel):
    field: str
    band: ConfidenceBand
    confidence: float
    message: str = ""


class ValidationResult(BaseModel):
    passed: bool = True
    field_results: list[FieldValidationResult] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    unconfirmed_red_fields: list[str] = Field(default_factory=list)


class ValidationEngine:
    @staticmethod
    def band_for_confidence(confidence: float) -> ConfidenceBand:
        if confidence >= GREEN_THRESHOLD:
            return ConfidenceBand.GREEN
        if confidence >= YELLOW_THRESHOLD:
            return ConfidenceBand.YELLOW
        return ConfidenceBand.RED

    @classmethod
    def validate_blueprint(
        cls,
        blueprint: RoleBlueprint,
        confirmations: list[str] | None = None,
    ) -> ValidationResult:
        confirmations_set = set(confirmations or [])
        result = ValidationResult()

        checks: list[tuple[str, float]] = [
            ("role_title", blueprint.role_title.confidence),
            ("experience_level", blueprint.experience_level.confidence),
        ]

        if blueprint.required_skills:
            avg_skill_conf = sum(s.confidence for s in blueprint.required_skills) / len(
                blueprint.required_skills
            )
            checks.append(("required_skills", avg_skill_conf))
        else:
            result.errors.append("required_skills must not be empty")
            result.passed = False

        if blueprint.capability_weights:
            checks.append(("capability_weights", 0.9))
        else:
            result.warnings.append("capability_weights missing — will use defaults")

        for field_name, confidence in checks:
            band = cls.band_for_confidence(confidence)
            field_result = FieldValidationResult(
                field=field_name,
                band=band,
                confidence=confidence,
            )

            if band == ConfidenceBand.GREEN:
                field_result.message = "High confidence — auto-pass"
            elif band == ConfidenceBand.YELLOW:
                field_result.message = "Medium confidence — review recommended"
                result.warnings.append(f"{field_name} confidence {confidence:.2f} is YELLOW")
            else:
                field_result.message = "Low confidence — confirmation required"
                if field_name in CRITICAL_FIELDS and field_name not in confirmations_set:
                    result.unconfirmed_red_fields.append(field_name)
                    result.errors.append(
                        f"{field_name} is RED (confidence {confidence:.2f}) and not confirmed"
                    )
                    result.passed = False

            result.field_results.append(field_result)

        return result

    @staticmethod
    def field_confidence(field: ExtractedField | SkillField) -> float:
        return field.confidence
