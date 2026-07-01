"""Recruiter authentication schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RecruiterRegister(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RecruiterLogin(BaseModel):
    email: EmailStr
    password: str


class RecruiterResponse(BaseModel):
    id: UUID
    company_name: str
    email: EmailStr
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    recruiter: RecruiterResponse
