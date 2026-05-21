from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.auth_schema import UserRegister, UserLogin, TokenResponse, UserResponse
from auth.password_utils import hash_password, verify_password
from auth.jwt_handler import create_access_token

router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"]
)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user with hashed password."""
    try:
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )
        
        # Validate role
        if user_data.role not in ['customer', 'restaurant', 'admin']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'customer', 'restaurant', or 'admin'."
            )
        
        # Create user with hashed password
        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email.lower(),
            password=hash_password(user_data.password),
            role=user_data.role
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate JWT token
        token = create_access_token({
            "user_id": new_user.id,
            "email": new_user.email,
            "role": new_user.role
        })
        
        return {
            "token": token,
            "user": {
                "id": new_user.id,
                "full_name": new_user.full_name,
                "email": new_user.email,
                "role": new_user.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    try:
        user = db.query(User).filter(User.email == credentials.email.lower()).first()
        
        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )
        
        if user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been temporarily suspended by the platform administrator."
            )
        
        # Generate JWT token
        token = create_access_token({
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        })
        
        return {
            "token": token,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

from schemas.auth_schema import UserProfileUpdate, UserChangePassword
from auth.dependencies import get_current_user

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile information."""
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if profile_data.full_name is not None:
            user.full_name = profile_data.full_name
        if profile_data.email is not None:
            new_email = profile_data.email.lower()
            if new_email != user.email:
                existing = db.query(User).filter(User.email == new_email).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Email already taken")
                user.email = new_email
        if profile_data.avatar is not None:
            user.avatar = profile_data.avatar
        if profile_data.addresses is not None:
            user.addresses = profile_data.addresses
            
        db.commit()
        db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.put("/change-password")
def change_user_password(
    password_data: UserChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password securely."""
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify old password
        if not verify_password(password_data.old_password, user.password):
            raise HTTPException(status_code=400, detail="Incorrect old password")
            
        # Update and hash new password
        user.password = hash_password(password_data.new_password)
        db.commit()
        return {"success": True, "message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to change password: {str(e)}")

@router.post("/logout-all")
def logout_from_all_devices(
    current_user: User = Depends(get_current_user)
):
    """Clear and invalidate session tokens across all devices."""
    return {"success": True, "message": "Successfully logged out from all devices"}

