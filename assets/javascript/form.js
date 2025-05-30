document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const datePicker = document.getElementById('appointment_date');
    const timePicker = document.getElementById('appointment_time');
    const textarea = document.querySelector("textarea");

    setupAutoRefresh();

    //Redimensionamento do textarea no formulario de agendamento
    textarea.addEventListener("keyup", e => {
        textarea.style.height = "45px";
        let scHeight = e.target.scrollHeight;
        textarea.style.height = `${scHeight}px`;
    });

    //Mask para telefone
    $('#phone').mask('(00) 0 0000-0000');

    // Configuração de horário comercial
    const businessHours = {
        start: 9,
        end: 19,
        interval: 30, // 30 minutos de intervalo
        daysOff: [0] // 6 = Sábado, 0 = Domingo / segundo a função selectedDay.getUTCDay()
    };

    // Estabelece que o usuário só pode escolher a data mínima de hoje
    const today = new Date();
    const formattedToday = formatDateForInput(today);
    datePicker.min = formattedToday;

    // Estabelece uma data máxima, e.g. 30 dias depois de hoje.
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    datePicker.max = formatDateForInput(maxDate);

    // Adiciona um evento de mudança ao datePicker para atualizar os horários disponíveis
    datePicker.addEventListener('change', function () {
        updateAvailableTimeSlots(this.value);
    });

    //Acompanha o número de envios do formulário em um dia (Form)
    function getTodaySubmissionCount() {
        const today = new Date().toDateString();
        const submissionData = JSON.parse(localStorage.getItem('submissionData') || '{"date":"", "count":0}');

        if (submissionData.date !== today) {
            return 0;
        }

        return submissionData.count;
    }

    //Atualização da contagem e data no acompanhamento de envio de formulários (Form)
    function updateSubmissionTracking() {
        const today = new Date().toDateString();
        const submissionData = JSON.parse(localStorage.getItem('submissionData') || '{"date":"", "count":0}');
        if (submissionData.date != today) {
            submissionData.date = today;
            submissionData.count = 1;
        } else {
            submissionData.count += 1;
        }
        localStorage.setItem('submissionData', JSON.stringify(submissionData));
        localStorage.setItem('lastSubmissionTime', Date.now().toString());
    }

    // Formata a data para o input[type="date"] 
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Atualiza os horários disponíveis com base na data selecionada e nos agendamentos existentes
    function updateAvailableTimeSlots(selectedDate) {
        timePicker.innerHTML = '<option value="">Selecione um horário</option>';

        if (!selectedDate) {
            return;
        }

        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek = selectedDateObj.getUTCDay(); // 0 = Domingo, 6 = Sábado

        // console.log('Dia da semana:', dayOfWeek, 'Dias de folga:', businessHours.daysOff);

        if (businessHours.daysOff.includes(dayOfWeek)) {
            timePicker.innerHTML = '<option value="">Não há horários disponíveis neste dia</option>';
            return;
        }

        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

        const timeSlots = generateTimeSlots(businessHours.start, businessHours.end, businessHours.interval);

        const bookedTimes = appointments
            .filter(apt => apt.appointment_date === selectedDate)
            .map(apt => apt.appointment_time || '');

        const today = new Date();
        const todayFormatted = today.toISOString().split('T')[0];
        const isToday = selectedDate === todayFormatted;

        const currentHour = isToday ? today.getHours() : 0;
        const currentMinute = isToday ? today.getMinutes() : 0;

        // console.log('Hora atual:', currentHour, 'Minuto atual:', currentMinute);

        let availableSlotCount = 0;

        timeSlots.forEach(slot => {
            if (!bookedTimes.includes(slot)) {
                let shouldShow = true;

                if (isToday) {
                    const [slotHour, slotMinute] = slot.split(':').map(Number);

                    if (slotHour < currentHour ||
                        (slotHour === currentHour && slotMinute <= currentMinute)) {
                        shouldShow = false;
                    }

                    // console.log('Slot:', slot, 'Deve mostrar:', shouldShow);
                }

                if (shouldShow) {
                    const option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    timePicker.appendChild(option);
                    availableSlotCount++;
                }
            }
        });

        // console.log('Slots disponíveis:', availableSlotCount);

        if (availableSlotCount === 0) {
            timePicker.innerHTML = '<option value="">Não há horários disponíveis neste dia</option>';
        }
    }


    // Gera opções de horários do inicío (9hrs) ao fim (19 hrs)
    function generateTimeSlots(startHour, endHour, intervalMinutes) {
        const slots = [];
        const totalMinutes = (endHour - startHour) * 60;
        const totalSlots = totalMinutes / intervalMinutes;

        for (let i = 0; i <= totalSlots; i++) {
            const minutes = i * intervalMinutes;
            const hour = Math.floor(startHour + minutes / 60);
            const minute = minutes % 60;

            const formattedHour = String(hour).padStart(2, '0');
            const formattedMinute = String(minute).padStart(2, '0');
            slots.push(`${formattedHour}:${formattedMinute}`);
        }

        return slots;
    }


    // Função para exibir o modal
    function showModal(message, redirectUrl = null) {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');

        modalMessage.textContent = message;
        modal.style.display = 'flex';
        modal.dataset.redirectUrl = redirectUrl || '';
    }

    function closeModal() {
        const modal = document.getElementById('customModal');
        modal.style.display = 'none';


        if (modal.dataset.redirectUrl) {
            window.location.href = modal.dataset.redirectUrl;
        }
    }



    const modal = document.getElementById('customModal');
    const okButton = document.getElementById('modalOkButton');


    //Fechar o modal ao clicar no botão "OK"
    okButton.addEventListener('click', closeModal);

    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    //Atualiza os horários em tempo real
    function setupAutoRefresh() {

        setInterval(() => {
            const selectedDate = datePicker.value;
            if (selectedDate) {
                updateAvailableTimeSlots(selectedDate);
            }
        }, 60000); // 1 minuto
    }



    // Envio de formulário
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (getTodaySubmissionCount() >= 2) {
            showModal(`Limite de 2 agendamentos por dia atingido. Por favor, tente novamente amanhã.`, 'appointment-form.html');
            return;
        }

        //Caso esse campo esteja preenchido, o envio do formulário não será realizado.
        const honeypotField = document.getElementById('website');
        if (honeypotField && honeypotField.value) {
            window.location.href = 'appointment-form.html';
        }

        const appointmentDate = datePicker.value;
        const appointmentTime = timePicker.value;

        const [year, month, day] = appointmentDate.split('-');
        const formattedDateTime = `${day}/${month}/${year} ${appointmentTime}:00`;

        const formData = {
            name: form.elements['name'].value,
            phone: form.elements['phone'].value,
            // Armazena os dados combinados e separados
            date_time: formattedDateTime,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            service: form.elements['service'].value,
            barber: form.elements['barber'].value,
            payment: form.elements['payment'].value,
            comment: form.elements['comment'].value,
            timestamp: new Date().toISOString()
        };

        // Salva o agendamento
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(formData);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        updateSubmissionTracking();



        showModal('Agendamento realizado com sucesso!', 'appointment-form.html');
    });
});
