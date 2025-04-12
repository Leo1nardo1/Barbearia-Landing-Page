document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("nav ul");

menuToggle.addEventListener("click", function (event) {
    event.stopPropagation(); // Impede que o clique suba até o document
    navMenu.classList.toggle("active");
});

// Fecha o menu ao clicar fora
document.addEventListener("click", function (event) {
    const isClickInsideMenu = navMenu.contains(event.target);
    const isClickOnToggle = menuToggle.contains(event.target);

    if (!isClickInsideMenu && !isClickOnToggle) {
        navMenu.classList.remove("active");
    }
});
    const accessibilityButton = document.getElementById('accessibilityButton');
    const accessibilitySidebar = document.getElementById('accessibilitySidebar');
    const accessibilityOverlay = document.getElementById('accessibilityOverlay');
    const accessibilityClose = document.getElementById('accessibilityClose');
    const accessibilityCards = document.querySelectorAll('.accessibility-card');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeCard = document.querySelector('.accessibility-card.dark-mode-toggle');


    //DARK MODE 

    // CHECA localStorage, SE NÃO HOUVER NENHUM TEMA SALVO, O TEMA CLARO É ARMAZENADO NA CONSTANTE
    const currentTheme = localStorage.getItem('theme') || 'light';

    // CHECA SE O DARK MODE ESTÁ ATIVO OU NÃO E APLICA O TEMA SALVO NA PÁGINA CARREGADA
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
        document.body.style.overflow = ''; // Permite rolar a página novamente
    }

    function setDarkMode(enabled) {
        //Acessa o documento HTML e aplica o tema desejado, "enable" deve ser true para dark mode e false para light mode.
        document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');

        localStorage.setItem('theme', enabled ? 'dark' : 'light');
        darkModeToggle.checked = enabled;
    }

    // Dark Mode ao clicar no toggle 
    darkModeToggle.addEventListener('change', function () {
        //retorna true or false
        setDarkMode(this.checked);
    });
    //Aciona o evento ao clicar no card e não apenas no toggle
    darkModeCard.addEventListener('click', function () {
        setDarkMode(!darkModeToggle.checked);
    });



    //Reseta a acessibilidade 
    let resetCard = null;
    accessibilityCards.forEach(function (card) {
        const cardText = card.querySelector('.accessibility-card-text');
        if (cardText && cardText.textContent.trim() === 'Resetar tudo') {
            resetCard = card;
        }
    });


    if (resetCard) {
        resetCard.addEventListener('click', function () {
            setDarkMode(false);
            //ADICIONE OUTROS RESETS AQUI
        });
    } 

    // Fecha acessibilidade com esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && accessibilitySidebar.classList.contains('active')) {
            closeSidebar();
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

