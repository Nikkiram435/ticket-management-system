from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime


# -----------------------------
# Create Ticket
# -----------------------------

class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str


# -----------------------------
# Update Ticket
# -----------------------------

class TicketUpdate(BaseModel):
    status: Optional[Literal["Open", "In Progress", "Closed"]] = None
    notes: Optional[str] = None


# -----------------------------
# Ticket List Response
# -----------------------------

class TicketListResponse(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------
# Note Response
# -----------------------------

class NoteResponse(BaseModel):
    note_text: str
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------
# Ticket Detail Response
# -----------------------------

class TicketDetailResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: list[NoteResponse]

    class Config:
        from_attributes = True