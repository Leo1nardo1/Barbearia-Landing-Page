document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const datePicker = document.getElementById('appointment_date');
    const timePicker = document.getElementById('appointment_time');
    const textarea = document.querySelector("textarea");



    //Redimensionamento do textarea no formulario de agendamento
    textarea.addEventListener("keyup", e => {
        textarea.style.height = "45px";
        let scHeight = e.target.scrollHeight;
        textarea.style.height = `${scHeight}px`;
    });

    //Masks na página de agendamento.
    $('#date').mask('00/00/0000');
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

    // Verifica se o usuário fez um agendamento recentemente pra evitar spam
    // function hasRecentSubmission() {
    //     const lastSubmissionTime = localStorage.getItem('lastSubmissionTime');
    //     if (!lastSubmissionTime) {
    //         return false;
    //     }
    // //Calcula tempo em horas.
    // const hoursSinceLastSubmission = (Date.now() - parseInt(lastSubmissionTime)) / (1000 * 60 * 60);
    //retorna true ou false, a depender da quantidade de horas passadas depois do envio, nesse caso, 24 horas.
    //     return hoursSinceLastSubmission < 24;
    // }

    //Acompanha o número de envios do formulário em um dia
    function getTodaySubmissionCount() {
        const today = new Date().toDateString();
        const submissionData = JSON.parse(localStorage.getItem('submissionData') || '{"date":"", "count":0}');

        if (submissionData.date !== today) {
            return 0;
        }

        return submissionData.count;
    }

    //Atualização do 'count' e 'date' no acompanhamento de envio de formulários
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
        // Reseta a lista de horários disponíveis, começando com a opção padrão
        timePicker.innerHTML = '<option value="">Selecione um horário</option>';

        // Se nenhuma data foi selecionada, sai da função
        if (!selectedDate) {
            return;
        }

        // Converte a data selecionada para um objeto Date e obtém o dia da semana (0 = Domingo, 6 = Sábado)
        const selectedDay = new Date(selectedDate);
        const dayOfWeek = selectedDay.getUTCDay();

        // Verifica se a data selecionada é um dia de folga (presente em businessHours.daysOff)
        if (businessHours.daysOff.includes(dayOfWeek)) {
            timePicker.innerHTML = '<option value="">Não há horários disponíveis neste dia</option>';
            return;
        }

        // Recupera os agendamentos salvos no localStorage (se houver) e converte para array
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

        // Gera os horários disponíveis com base no horário de funcionamento e intervalo definido
        const timeSlots = generateTimeSlots(businessHours.start, businessHours.end, businessHours.interval);

        // Filtra os horários já reservados para a data selecionada
        const bookedTimes = appointments
            .filter(apt => {
                // Se houver um campo 'appointment_date', verifica se coincide com a data selecionada
                if (apt.appointment_date) {
                    return apt.appointment_date === selectedDate;
                }

                // Se a data vier no formato 'DD/MM/YYYY HH:MM', converte para 'YYYY-MM-DD' antes de comparar
                if (apt.date_time) {
                    const aptDate = apt.date_time.split(' ')[0];
                    const [day, month, year] = aptDate.split('/');
                    const formattedDate = `${year}-${month}-${day}`;
                    return formattedDate === selectedDate;
                }

                return false;
            })
            .map(apt => {
                // Se houver um campo específico para o horário, retorna ele
                if (apt.appointment_time) return apt.appointment_time;

                // Caso a data e hora estejam no formato 'DD/MM/YYYY HH:MM', extrai apenas o horário (HH:MM)
                if (apt.date_time) {
                    const aptTime = apt.date_time.split(' ')[1];
                    return aptTime.substring(0, 5); // Remove segundos, deixando apenas HH:MM
                }

                return '';
            });

        // Adiciona os horários disponíveis ao seletor, ignorando os que já foram reservados
        timeSlots.forEach(slot => {
            if (!bookedTimes.includes(slot)) {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                timePicker.appendChild(option);
            }
        });

        // Se após a filtragem não houver horários disponíveis, exibe a mensagem:
        if (timePicker.options.length === 1) {
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





    // Envio de formulário
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (getTodaySubmissionCount() >= 2) {
            showModal(`Limite de 2 agendamentos por dia atingido. Por favor, tente novamente amanhã.`, 'agendar.html');
            return;
        }

        //Caso esse campo esteja preenchido, o envio do formulário não será realizado.
        const honeypotField = document.getElementById('website');
        if (honeypotField && honeypotField.value) {
            window.location.href = 'agendar.html';
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
            comment: form.elements['comment'].value,
            timestamp: new Date().toISOString()
        };

        // Salva o agendamento
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(formData);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        updateSubmissionTracking();



        showModal('Agendamento realizado com sucesso!', 'agendar.html');
    });
});
