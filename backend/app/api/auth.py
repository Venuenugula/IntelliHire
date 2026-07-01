"""Recruiter authentication: register, login, and current-user endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models import Recruiter
from app.schemas.auth import (
    RecruiterLogin,
    RecruiterRegister,
    RecruiterResponse,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_recruiter(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Recruiter:
    """Resolve the authenticated recruiter from a Bearer JWT."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    subject = decode_access_token(credentials.credentials)
    if subject is None:
        raise unauthorized
    try:
        recruiter_id = uuid.UUID(subject)
    except ValueError:
        raise unauthorized
    recruiter = await db.get(Recruiter, recruiter_id)
    if recruiter is None:
        raise unauthorized
    return recruiter


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RecruiterRegister, db: AsyncSession = Depends(get_db)):
    email = payload.email.lower()
    existing = await db.execute(select(Recruiter).where(Recruiter.email == email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    recruiter = Recruiter(
        company_name=payload.company_name.strip(),
        email=email,
        hashed_password=hash_password(payload.password),
    )
    db.add(recruiter)
    await db.commit()
    await db.refresh(recruiter)
    token = create_access_token(str(recruiter.id))
    return TokenResponse(
        access_token=token,
        recruiter=RecruiterResponse.model_validate(recruiter),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: RecruiterLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Recruiter).where(Recruiter.email == payload.email.lower())
    )
    recruiter = result.scalar_one_or_none()
    if recruiter is None or not verify_password(payload.password, recruiter.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(str(recruiter.id))
    return TokenResponse(
        access_token=token,
        recruiter=RecruiterResponse.model_validate(recruiter),
    )


@router.get("/me", response_model=RecruiterResponse)
async def me(recruiter: Recruiter = Depends(get_current_recruiter)):
    return RecruiterResponse.model_validate(recruiter)
