from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    role: str  # 'customer' or 'restaurant'

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    avatar: Optional[str] = None
    addresses: Optional[List[Any]] = None
    is_suspended: bool = False
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    addresses: Optional[List[Any]] = None

class UserChangePassword(BaseModel):
    old_password: str
    new_password: str

