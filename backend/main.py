from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import crud
from schemas import (
    TicketCreate,
    TicketUpdate,
    TicketListResponse,
    TicketDetailResponse
)


# ==========================================
# CREATE DATABASE TABLES
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# CREATE FASTAPI APP
# ==========================================

app = FastAPI(
    title="DataStraw Support CRM",
    description="Customer Support Ticketing CRM API",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# HOME / HEALTH CHECK
# ==========================================

@app.get("/")
def home():
    return {
        "message": "DataStraw Support CRM API is running"
    }


# ==========================================
# 1. CREATE TICKET
# ==========================================

@app.post("/api/tickets")
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db)
):
    new_ticket = crud.create_ticket(db, ticket)

    return {
        "ticket_id": new_ticket.ticket_id,
        "created_at": new_ticket.created_at
    }


# ==========================================
# 2. GET ALL TICKETS
# ==========================================

@app.get(
    "/api/tickets",
    response_model=list[TicketListResponse]
)
def get_tickets(
    status: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    tickets = crud.get_tickets(
        db=db,
        status=status,
        search=search
    )

    return tickets


# ==========================================
# 3. GET SINGLE TICKET
# ==========================================

@app.get(
    "/api/tickets/{ticket_id}",
    response_model=TicketDetailResponse
)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = crud.get_ticket_by_id(
        db=db,
        ticket_id=ticket_id
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


# ==========================================
# 4. UPDATE TICKET
# ==========================================

@app.put("/api/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db)
):
    updated_ticket = crud.update_ticket(
        db=db,
        ticket_id=ticket_id,
        ticket_data=ticket_data
    )

    if not updated_ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return {
        "success": True,
        "updated_at": updated_ticket.updated_at
    }