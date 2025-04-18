let currentPage = 1;
const itemsPerPage = 7;
let totalAppointments = 0;
let totalPages = 0;

document.addEventListener('DOMContentLoaded', function () {
    loadAppointments();

    //Modal de comentários
    document.querySelector('.close-modal').addEventListener('click', function () {
        document.getElementById('comment-modal').style.display = 'none';
    });
    window.addEventListener('click', function (event) {
        if (event.target === document.getElementById('comment-modal')) {
            document.getElementById('comment-modal').style.display = 'none';
        }
    });
});

// Carrega os agendamentos
function loadAppointments() {

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    totalAppointments = appointments.length;
    totalPages = Math.ceil(totalAppointments / itemsPerPage);
    const tbody = document.getElementById('appointments-tbody');
    tbody.innerHTML = '';
    // Trata da paginação da tabela
    if (appointments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="10" class="empty-message">Nenhum agendamento encontrado.</td>';
        tbody.appendChild(row);
        document.getElementById('pagination').innerHTML = '';
        document.getElementById('page-info').textContent = 'Mostrando 0 de 0 agendamentos';
        return;
    }

    const serviceMap = { 'beard': 'Barba', 'hair': 'Cabelo', 'package': 'Conjunto' };
    const barberMap = { 'barber1': 'Barbeiro 1', 'barber2': 'Barbeiro 2' };
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, appointments.length);
    const paginatedAppointments = appointments.slice(start, end);

    paginatedAppointments.forEach((appointment, index) => {
        const globalIndex = start + index;
        if (!appointment.hasOwnProperty('status')) {
            appointment.status = 'pendente';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${globalIndex + 1}</td>
                    <td>${appointment.name}</td>
                    <td>${appointment.phone}</td>
                    <td>${appointment.date_time}</td>
                    <td>${serviceMap[appointment.service] || appointment.service}</td>
                    <td>${barberMap[appointment.barber] || appointment.barber}</td>
                    <td><button class="btn-view-comment" onclick="openCommentModal('${encodeURIComponent(appointment.comment || 'Nenhum comentário')}')">Ver comentário</button></td>
                    <td>${new Date(appointment.timestamp).toLocaleString()}</td>
                    <td class="status-${appointment.status}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</td>
                    
                    <td>
                        <div class="action-buttons">
                            <button class="btn-confirm" onclick="confirmAppointment(${globalIndex})"><i class="fas fa-check"></i></button>
                            <button class="btn-delete" onclick="deleteAppointment(${globalIndex})"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                    
                `;
        tbody.appendChild(row);
    });

    document.getElementById('page-info').textContent = `Mostrando ${start + 1} - ${end} de ${totalAppointments} agendamentos`;
    updatePagination();
}
// Abre modal de comentário
function openCommentModal(encodedComment) {
    const modal = document.getElementById('comment-modal');
    const modalText = document.getElementById('modal-comment-text');
    modalText.textContent = decodeURIComponent(encodedComment);
    modal.style.display = 'block';
}



function confirmAppointment(index) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments[index].status = appointments[index].status === 'confirmado' ? 'pendente' : 'confirmado';
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments();
}

function deleteAppointment(index) {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.splice(index, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        if (currentPage > 1 && (currentPage - 1) * itemsPerPage >= appointments.length) {
            currentPage--;
        }
        loadAppointments();
    }
}

function updatePagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('active', i === currentPage);
        button.addEventListener('click', () => { currentPage = i; loadAppointments(); });
        paginationDiv.appendChild(button);
    }
}