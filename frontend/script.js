// =========================================
// API BASE URL
// =========================================

const API_URL = "";


// =========================================
// GET ELEMENTS
// =========================================

const ticketTableBody = document.getElementById("ticketTableBody");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const totalTickets = document.getElementById("totalTickets");
const openTickets = document.getElementById("openTickets");
const progressTickets = document.getElementById("progressTickets");
const closedTickets = document.getElementById("closedTickets");

const createTicketModal =
    document.getElementById("createTicketModal");

const ticketDetailModal =
    document.getElementById("ticketDetailModal");

const createTicketForm =
    document.getElementById("createTicketForm");

const openCreateModal =
    document.getElementById("openCreateModal");

const closeCreateModal =
    document.getElementById("closeCreateModal");

const cancelCreateTicket =
    document.getElementById("cancelCreateTicket");

const closeDetailModal =
    document.getElementById("closeDetailModal");

const updateTicketBtn =
    document.getElementById("updateTicketBtn");


// Current selected ticket

let currentTicketId = null;


// =========================================
// LOAD TICKETS
// =========================================

async function loadTickets() {

    try {

        const search = searchInput.value.trim();
        const status = statusFilter.value;

        let url = `${API_URL}/api/tickets`;

        const params = new URLSearchParams();

        if (search) {
            params.append("search", search);
        }

        if (status) {
            params.append("status", status);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to load tickets");
        }

        const tickets = await response.json();

        displayTickets(tickets);

        loadStatistics();

    } catch (error) {

        console.error("Error loading tickets:", error);

        ticketTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load tickets.
                </td>
            </tr>
        `;

    }

}


// =========================================
// DISPLAY TICKETS
// =========================================

function displayTickets(tickets) {

    ticketTableBody.innerHTML = "";

    if (tickets.length === 0) {

        emptyState.style.display = "block";

        return;
    }

    emptyState.style.display = "none";


    tickets.forEach(ticket => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>
                <strong>${escapeHtml(ticket.ticket_id)}</strong>
            </td>

            <td>
                ${escapeHtml(ticket.customer_name)}
            </td>

            <td>
                ${escapeHtml(ticket.subject)}
            </td>

            <td>
                <span class="status-badge ${getStatusClass(ticket.status)}">
                    ${escapeHtml(ticket.status)}
                </span>
            </td>

            <td>
                ${formatDate(ticket.created_at)}
            </td>

            <td>

                <button
                    class="view-btn"
                    onclick="openTicketDetails('${ticket.ticket_id}')"
                >
                    View
                </button>

            </td>

        `;

        ticketTableBody.appendChild(row);

    });

}


// =========================================
// STATUS CLASS
// =========================================

function getStatusClass(status) {

    if (status === "Open") {
        return "status-open";
    }

    if (status === "In Progress") {
        return "status-progress";
    }

    if (status === "Closed") {
        return "status-closed";
    }

    return "";

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


// =========================================
// LOAD STATISTICS
// =========================================

async function loadStatistics() {

    try {

        const response = await fetch(
            `${API_URL}/api/tickets`
        );

        const tickets = await response.json();

        totalTickets.textContent = tickets.length;

        openTickets.textContent =
            tickets.filter(ticket =>
                ticket.status === "Open"
            ).length;

        progressTickets.textContent =
            tickets.filter(ticket =>
                ticket.status === "In Progress"
            ).length;

        closedTickets.textContent =
            tickets.filter(ticket =>
                ticket.status === "Closed"
            ).length;

    } catch (error) {

        console.error(
            "Error loading statistics:",
            error
        );

    }

}


// =========================================
// OPEN CREATE TICKET MODAL
// =========================================

openCreateModal.addEventListener(
    "click",
    () => {

        createTicketModal.classList.add("active");

    }
);


// =========================================
// CLOSE CREATE MODAL
// =========================================

function closeCreateTicketModal() {

    createTicketModal.classList.remove("active");

    createTicketForm.reset();

}


closeCreateModal.addEventListener(
    "click",
    closeCreateTicketModal
);


cancelCreateTicket.addEventListener(
    "click",
    closeCreateTicketModal
);


// =========================================
// CREATE TICKET
// =========================================

createTicketForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const customerName =
            document.getElementById("customerName").value.trim();

        const customerEmail =
            document.getElementById("customerEmail").value.trim();

        const subject =
            document.getElementById("ticketSubject").value.trim();

        const description =
            document.getElementById("ticketDescription").value.trim();


        const ticketData = {

            customer_name: customerName,

            customer_email: customerEmail,

            subject: subject,

            description: description

        };


        try {

            const response = await fetch(
                `${API_URL}/api/tickets`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(ticketData)
                }
            );


            if (!response.ok) {

                const errorData =
                    await response.json();

                console.error(errorData);

                alert(
                    "Unable to create ticket. Please check the details."
                );

                return;
            }


            const result =
                await response.json();


            alert(
                `Ticket ${result.ticket_id} created successfully!`
            );


            closeCreateTicketModal();

            loadTickets();


        } catch (error) {

            console.error(
                "Error creating ticket:",
                error
            );

            alert(
                "Server connection failed."
            );

        }

    }
);


// =========================================
// OPEN TICKET DETAILS
// =========================================

async function openTicketDetails(ticketId) {

    try {

        const response = await fetch(
            `${API_URL}/api/tickets/${ticketId}`
        );


        if (!response.ok) {

            throw new Error(
                "Ticket not found"
            );

        }


        const ticket =
            await response.json();


        currentTicketId =
            ticket.ticket_id;


        document.getElementById(
            "detailTicketId"
        ).textContent =
            ticket.ticket_id;


        document.getElementById(
            "detailCustomer"
        ).textContent =
            ticket.customer_name;


        document.getElementById(
            "detailEmail"
        ).textContent =
            ticket.customer_email;


        document.getElementById(
            "detailSubject"
        ).textContent =
            ticket.subject;


        document.getElementById(
            "detailDescription"
        ).textContent =
            ticket.description;


        document.getElementById(
            "detailStatus"
        ).value =
            ticket.status;


        displayNotes(ticket.notes);


        document.getElementById(
            "newNote"
        ).value = "";


        ticketDetailModal.classList.add(
            "active"
        );


    } catch (error) {

        console.error(
            "Error loading ticket details:",
            error
        );

        alert(
            "Unable to load ticket details."
        );

    }

}


// =========================================
// DISPLAY NOTES
// =========================================

function displayNotes(notes) {

    const notesList =
        document.getElementById("notesList");


    notesList.innerHTML = "";


    if (!notes || notes.length === 0) {

        notesList.innerHTML = `
            <p style="color:#6b7280;font-size:13px;">
                No notes added yet.
            </p>
        `;

        return;
    }


    notes.forEach(note => {

        const noteElement =
            document.createElement("div");

        noteElement.className =
            "note-item";


        noteElement.innerHTML = `

            <p>
                ${escapeHtml(note.note_text)}
            </p>

            <small>
                ${formatDate(note.created_at)}
            </small>

        `;


        notesList.appendChild(
            noteElement
        );

    });

}


// =========================================
// UPDATE TICKET
// =========================================

updateTicketBtn.addEventListener(
    "click",
    async function () {

        if (!currentTicketId) {
            return;
        }


        const status =
            document.getElementById(
                "detailStatus"
            ).value;


        const notes =
            document.getElementById(
                "newNote"
            ).value.trim();


        const updateData = {

            status: status,

            notes: notes || null

        };


        try {

            const response = await fetch(

                `${API_URL}/api/tickets/${currentTicketId}`,

                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(updateData)
                }

            );


            if (!response.ok) {

                throw new Error(
                    "Update failed"
                );

            }


            await response.json();


            alert(
                "Ticket updated successfully!"
            );


            ticketDetailModal.classList.remove(
                "active"
            );


            loadTickets();


        } catch (error) {

            console.error(
                "Error updating ticket:",
                error
            );

            alert(
                "Unable to update ticket."
            );

        }

    }
);


// =========================================
// CLOSE DETAIL MODAL
// =========================================

closeDetailModal.addEventListener(
    "click",
    () => {

        ticketDetailModal.classList.remove(
            "active"
        );

    }
);


// =========================================
// SEARCH
// =========================================

let searchTimeout;


searchInput.addEventListener(
    "input",
    function () {

        clearTimeout(searchTimeout);


        searchTimeout = setTimeout(
            () => {

                loadTickets();

            },
            300
        );

    }
);


// =========================================
// STATUS FILTER
// =========================================

statusFilter.addEventListener(
    "change",
    () => {

        loadTickets();

    }
);


// =========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =========================================

window.addEventListener(
    "click",
    function (event) {

        if (event.target === createTicketModal) {

            closeCreateTicketModal();

        }


        if (event.target === ticketDetailModal) {

            ticketDetailModal.classList.remove(
                "active"
            );

        }

    }
);


// =========================================
// ESCAPE HTML
// =========================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =========================================
// INITIAL LOAD
// =========================================

loadTickets();