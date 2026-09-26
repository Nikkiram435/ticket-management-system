from sqlalchemy.orm import Session
from sqlalchemy import or_

from models import Ticket, Note
from schemas import TicketCreate, TicketUpdate

# 1. CREATE TICKET


def create_ticket(db: Session, ticket_data: TicketCreate):

    # Create a temporary ticket first
    new_ticket = Ticket(
        ticket_id="TEMP",
        customer_name=ticket_data.customer_name,
        customer_email=ticket_data.customer_email,
        subject=ticket_data.subject,
        description=ticket_data.description,
        status="Open"
    )

    db.add(new_ticket)

    # Save temporarily so we get the database ID
    db.flush()

    # Generate ticket ID
    new_ticket.ticket_id = f"TKT-{new_ticket.id:03d}"

    # Save permanently
    db.commit()

    # Refresh object with latest database data
    db.refresh(new_ticket)

    return new_ticket


# 2. GET ALL TICKETS

def get_tickets(
    db: Session,
    status: str = None,
    search: str = None
):

    query = db.query(Ticket)

    # Filter by status
    if status:
        query = query.filter(Ticket.status == status)

    # Search
    if search:

        search_text = f"%{search}%"

        query = query.filter(
            or_(
                Ticket.ticket_id.ilike(search_text),
                Ticket.customer_name.ilike(search_text),
                Ticket.customer_email.ilike(search_text),
                Ticket.subject.ilike(search_text),
                Ticket.description.ilike(search_text)
            )
        )

    # Latest tickets first
    tickets = query.order_by(
        Ticket.created_at.desc()
    ).all()

    return tickets


# 3. GET SINGLE TICKET

def get_ticket_by_id(
    db: Session,
    ticket_id: str
):

    ticket = db.query(Ticket).filter(
        Ticket.ticket_id == ticket_id
    ).first()

    return ticket


# 4. UPDATE TICKET

def update_ticket(
    db: Session,
    ticket_id: str,
    ticket_data: TicketUpdate
):

    ticket = db.query(Ticket).filter(
        Ticket.ticket_id == ticket_id
    ).first()

    # Ticket doesn't exist
    if not ticket:
        return None

    # Update status
    if ticket_data.status is not None:
        ticket.status = ticket_data.status

    # Add note
    if ticket_data.notes:

        new_note = Note(
            ticket_id=ticket.id,
            note_text=ticket_data.notes
        )

        db.add(new_note)

    # Update timestamp
    from datetime import datetime

    ticket.updated_at = datetime.utcnow()

    # Save changes
    db.commit()

    # Refresh ticket
    db.refresh(ticket)

    return ticket
