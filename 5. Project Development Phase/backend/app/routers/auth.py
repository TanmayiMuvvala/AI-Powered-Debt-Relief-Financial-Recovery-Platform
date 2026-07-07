from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.databases.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.user_service import create_user, authenticate_user
from app.core.auth import create_access_token, get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    
    new_user = create_user(db, user_data)

    if new_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    return {
        "message": "Account created successfully",
        "user_id": new_user.id,
        "email": new_user.email
    }


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get JWT token"
)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile"
)
def get_me(current_user: User = Depends(get_current_user)):

    return UserResponse.model_validate(current_user)
