"""Soft confidence gates — field-level validation, never block entire save."""

from __future__ import annotations

from app.schemas.candidate import CandidateProfile
from app.schemas.fields import (
    CRITICAL_BLUEPRINT_FIELDS,
    CRITICAL_PROFILE_FIELDS,
    FieldValidation,
    validate_field,
)
from app.schemas.job import RoleBlueprint


def validate_blueprint(blueprint: RoleBlueprint) -> list[FieldValidation]:
    results: list[FieldValidation] = []

    results.append(validate_field(
        "role_title", blueprint.role_title.confidence, CRITICAL_BLUEPRINT_FIELDS,
    ))
    results.append(validate_field(
        "experience_level", blueprint.experience_level.confidence, CRITICAL_BLUEPRINT_FIELDS,
    ))

    if blueprint.required_skills:
        avg_conf = sum(s.confidence for s in blueprint.required_skills) / len(blueprint.required_skills)
        results.append(validate_field("required_skills", avg_conf, CRITICAL_BLUEPRINT_FIELDS))
    else:
        results.append(FieldValidation(
            field="required_skills",
            confidence_level=validate_field("required_skills", 0.0, CRITICAL_BLUEPRINT_FIELDS).confidence_level,
            is_critical=True,
            requires_confirmation=True,
            message="No required skills extracted",
        ))

    # Non-critical: preferred certifications etc. — no confirmation required
    for cert in blueprint.certifications:
        results.append(validate_field(
            f"certification:{cert.value[:30]}",
            cert.confidence,
            frozenset(),  # never critical
        ))

    return results


def validate_profile(profile: CandidateProfile) -> list[FieldValidation]:
    results = [
        validate_field("name", profile.name.confidence, CRITICAL_PROFILE_FIELDS),
    ]
    if profile.email:
        results.append(validate_field("email", profile.email.confidence, CRITICAL_PROFILE_FIELDS))
    if profile.skills:
        avg = sum(s.confidence for s in profile.skills) / len(profile.skills)
        results.append(validate_field("skills", avg, CRITICAL_PROFILE_FIELDS))
    return results


def can_save(validations: list[FieldValidation], confirmations: dict[str, bool] | None = None) -> tuple[bool, list[str]]:
    """Returns (can_save, messages). RED critical fields need explicit confirmation."""
    confirmations = confirmations or {}
    messages: list[str] = []
    blocked = False

    for v in validations:
        if v.message:
            messages.append(v.message)
        if v.requires_confirmation and not confirmations.get(v.field, False):
            blocked = True
            messages.append(f"Confirmation required for: {v.field}")

    return not blocked, messages
