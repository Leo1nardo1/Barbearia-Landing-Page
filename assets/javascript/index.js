document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("active");
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