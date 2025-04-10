document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("active");
    });

    const accessibilityButton = document.getElementById('accessibilityButton');
    const accessibilitySidebar = document.getElementById('accessibilitySidebar');
    const accessibilityOverlay = document.getElementById('accessibilityOverlay');
    const accessibilityClose = document.getElementById('accessibilityClose');
    const accessibilityCards = document.querySelectorAll('.accessibility-card');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeCard = document.querySelector('.accessibility-card.dark-mode-toggle');

  
    //DARK MODE 

   
 // CHECA PELOS TEMAS SALVOS NO LOCALSTORAGE PARA USAR
 const currentTheme = localStorage.getItem('theme') || 'light';
 if (currentTheme === 'dark') {
     document.documentElement.setAttribute('data-theme', 'dark');
 }
    // APLICA O TEMA SALVO NA PÁGINA CARREGADA
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
    }

    // ABRE O SIDEBAR AO CLICAR NO BOTAO DE ACESSIBILIDADE
    accessibilityButton.addEventListener('click', function () {
        accessibilitySidebar.classList.add('active');
        accessibilityOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    });

    // FECHA SIDEBAR AO CLICAR NO BOTÃO DE FECHAR
    accessibilityClose.addEventListener('click', function () {
        closeSidebar();
    });

    // FECHA SIDEBAR AO CLICAR NO OVERLAY
    accessibilityOverlay.addEventListener('click', function () {
        closeSidebar();
    });

    // FECHA SIDEBAR
    function closeSidebar() {
        accessibilitySidebar.classList.remove('active');
        accessibilityOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Dark Mode Toggle 
    darkModeToggle.addEventListener('change', function () {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    //VEJA QUAL CARD FOI CLICADO
    accessibilityCards.forEach(function (card) {
        if (!card.classList.contains('dark-mode-toggle')) {
            card.addEventListener('click', function () {
                console.log('Card clicked:', this.querySelector('.accessibility-card-text').textContent);
            });
        }
    });
    //ativa ao clicar no card inteiro
    darkModeCard.addEventListener('click', function (event) {

        darkModeToggle.checked = !darkModeToggle.checked;

        darkModeToggle.dispatchEvent(new Event('change'));
    });

    // RESETA FUNCIONALIDADES
    const resetCard = document.querySelector('.accessibility-card:last-child');
    resetCard.addEventListener('click', function () {
        // Reseta dark mode
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        darkModeToggle.checked = false;

    });

    // Fecha com esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && accessibilitySidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    


});

let index = 0;

function moveSlide(direction) {
    const slides = document.querySelectorAll(".card");
    const totalSlides = slides.length;
    index += direction;

    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    const offset = -index * 100;
    document.querySelector(".card-grid").style.transform = `translateX(${offset}%)`;
}

