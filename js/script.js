/* ============================================
   NCRC - SCRIPT.JS
   Navigation, Mobile Menu, Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // MENU TOGGLE - MOBILE
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Ferme le menu quand on clique sur un lien
    if (navLinks) {
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // SCROLL ANIMATIONS
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer les éléments
    document.querySelectorAll('.project-card, .skill-card, .cert-badge').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // NAVBAR STICKY SHADOW
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            navbar.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.7)';
        } else {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        }
    });

    // SMOOTH SCROLL POUR LES ANCRES
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // TYPING ANIMATION (optionnel)
    const typeText = (element, text, speed = 50) => {
        let i = 0;
        element.textContent = '';
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        type();
    };

    // Applique l'animation de typing si tu veux
    // const heroTitle = document.querySelector('.hero-title');
    // if (heroTitle) {
    //     typeText(heroTitle, '🛡️ NCRC - Blue Team Portfolio', 50);
    // }

    console.log('✅ NCRC Portfolio loaded successfully!');
});