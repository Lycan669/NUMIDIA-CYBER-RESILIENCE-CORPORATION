/* ============================================
   NUMIDIA CYBER RESILIENCE CORPORATION
   Advanced Portfolio JavaScript
   SOC/Blue Team Edition
   ============================================ */

// ============================================
// 1. CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    animationDuration: 2000,
    scrollThreshold: 0.1,
    debounceDelay: 250,
    throttleDelay: 100,
    counterDuration: 2000,
    theme: {
        primary: '#00d4ff',
        secondary: '#ff006e',
        accent: '#8338ec'
    }
};

// ============================================
// 2. UTILITY CLASS
// ============================================

class Utils {
    /**
     * Debounce function for performance optimization
     */
    static debounce(func, wait = CONFIG.debounceDelay) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function for scroll events
     */
    static throttle(func, wait = CONFIG.throttleDelay) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                func(...args);
            };
            if (!timeout) {
                func(...args);
                timeout = setTimeout(later, wait);
            }
        };
    }

    /**
     * Smooth scroll to element
     */
    static smoothScroll(target, offset = 0) {
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }
        
        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Check if element is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    /**
     * Animate number counter
     */
    static animateCounter(element, target, duration = CONFIG.counterDuration) {
        return new Promise(resolve => {
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + '+';
                    clearInterval(timer);
                    resolve();
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        });
    }

    /**
     * Copy to clipboard with feedback
     */
    static async copyToClipboard(text, feedbackElement = null) {
        try {
            await navigator.clipboard.writeText(text);
            
            if (feedbackElement) {
                const originalText = feedbackElement.textContent;
                feedbackElement.textContent = '✓ Copié !';
                feedbackElement.classList.add('copied');
                
                setTimeout(() => {
                    feedbackElement.textContent = originalText;
                    feedbackElement.classList.remove('copied');
                }, 2000);
            }
            return true;
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
            return false;
        }
    }

    /**
     * Get random color from theme
     */
    static getRandomThemeColor() {
        const colors = Object.values(CONFIG.theme);
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Log with styling
     */
    static log(message, type = 'info') {
        const styles = {
            info: 'color: #00d4ff; font-weight: bold;',
            success: 'color: #00dd44; font-weight: bold;',
            warning: 'color: #ffaa00; font-weight: bold;',
            error: 'color: #ff4444; font-weight: bold;'
        };
        console.log(`%c[NUMIDIA] ${message}`, styles[type] || styles.info);
    }
}

// ============================================
// 3. MOBILE MENU MANAGER
// ============================================

class MobileMenuManager {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isOpen = false;

        this.init();
    }

    init() {
        if (!this.hamburger || !this.navMenu) return;

        this.hamburger.addEventListener('click', () => this.toggle());
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        Utils.log('Mobile Menu Manager initialized', 'success');
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.navMenu.classList.add('active');
        this.hamburger.classList.add('active');
        this.isOpen = true;
    }

    close() {
        this.navMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
        this.isOpen = false;
    }
}

// ============================================
// 4. SCROLL ANIMATIONS MANAGER
// ============================================

class ScrollAnimationsManager {
    constructor() {
        this.elements = document.querySelectorAll(
            '.service-card, .portfolio-card, .tech-badge, .cert-card, .info-item'
        );
        this.init();
    }

    init() {
        if (this.elements.length === 0) return;

        const observerOptions = {
            threshold: CONFIG.scrollThreshold,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('fade-in-up');
                    }, index * 100);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.elements.forEach(el => {
            observer.observe(el);
        });

        Utils.log('Scroll Animations initialized', 'success');
    }
}

// ============================================
// 5. HEADER MANAGER
// ============================================

class HeaderManager {
    constructor() {
        this.header = document.querySelector('.navbar');
        this.lastScrollY = 0;
        this.ticking = false;

        this.init();
    }

    init() {
        if (!this.header) return;

        window.addEventListener('scroll', () => this.handleScroll());
        Utils.log('Header Manager initialized', 'success');
    }

    handleScroll() {
        this.lastScrollY = window.scrollY;

        if (!this.ticking) {
            window.requestAnimationFrame(() => this.update());
            this.ticking = true;
        }
    }

    update() {
        if (this.lastScrollY > 10) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
        this.ticking = false;
    }
}

// ============================================
// 6. ACTIVE NAV LINK MANAGER
// ============================================

class ActiveNavLinkManager {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        if (this.sections.length === 0 || this.navLinks.length === 0) return;

        const observerOptions = {
            threshold: [0.3, 0.7],
            rootMargin: '-50% 0px -50% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    this.updateActive(entry.target.id);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => observer.observe(section));

        // Click handler
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    Utils.smoothScroll(href, 70);
                }
            });
        });

        Utils.log('Active Nav Link Manager initialized', 'success');
    }

    updateActive(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
}

// ============================================
// 7. COUNTER ANIMATIONS MANAGER
// ============================================

class CounterAnimationsManager {
    constructor() {
        this.statCards = document.querySelectorAll('.stat-card');
        this.isAnimated = false;

        this.init();
    }

    init() {
        if (this.statCards.length === 0) return;

        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isAnimated) {
                    this.animateCounters(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.statCards.forEach(card => observer.observe(card));

        Utils.log('Counter Animations Manager initialized', 'success');
    }

    animateCounters(card) {
        const number = card.querySelector('.stat-card h3');
        if (number && !number.dataset.animated) {
            const value = parseInt(number.textContent);
            Utils.animateCounter(number, value);
            number.dataset.animated = 'true';
            this.isAnimated = true;
        }
    }
}

// ============================================
// 8. SKILL BARS MANAGER
// ============================================

class SkillBarsManager {
    constructor() {
        this.skillBars = document.querySelectorAll('[data-skill-bar]');
        this.init();
    }

    init() {
        if (this.skillBars.length === 0) return;

        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateBar(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.skillBars.forEach(bar => observer.observe(bar));

        Utils.log('Skill Bars Manager initialized', 'success');
    }

    animateBar(bar) {
        const width = bar.getAttribute('data-skill-bar') || '0%';
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            bar.style.width = width;
        }, 100);
    }
}

// ============================================
// 9. COPY TO CLIPBOARD MANAGER
// ============================================

class CopyToClipboardManager {
    constructor() {
        this.copyButtons = document.querySelectorAll('[data-copy]');
        this.init();
    }

    init() {
        this.copyButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const text = button.getAttribute('data-copy');
                await Utils.copyToClipboard(text, button);
            });

            // Keyboard support
            button.setAttribute('role', 'button');
            button.setAttribute('tabindex', '0');
            
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });

        Utils.log('Copy to Clipboard Manager initialized', 'success');
    }
}

// ============================================
// 10. SCROLL TO TOP BUTTON MANAGER
// ============================================

class ScrollToTopManager {
    constructor() {
        this.button = document.querySelector('[data-scroll-top]');
        this.scrollThreshold = 300;

        this.init();
    }

    init() {
        if (!this.button) return;

        window.addEventListener('scroll', 
            Utils.throttle(() => this.handleScroll(), CONFIG.throttleDelay)
        );

        this.button.addEventListener('click', () => this.scrollToTop());

        Utils.log('Scroll to Top Manager initialized', 'success');
    }

    handleScroll() {
        if (window.scrollY > this.scrollThreshold) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ============================================
// 11. DARK MODE MANAGER
// ============================================

class DarkModeManager {
    constructor() {
        this.toggle = document.querySelector('[data-dark-mode]');
        this.storageKey = 'numidia_theme';
        this.darkClass = 'dark-mode';

        this.init();
    }

    init() {
        if (!this.toggle) return;

        this.loadTheme();
        this.toggle.addEventListener('click', () => this.toggleTheme());

        // System preference listener
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.storageKey)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        Utils.log('Dark Mode Manager initialized', 'success');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');

        this.setTheme(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.storageKey, theme);

        if (this.toggle) {
            this.toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            this.toggle.setAttribute('aria-label', 
                theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'
            );
        }
    }
}

// ============================================
// 12. FORM VALIDATION MANAGER
// ============================================

class FormValidationManager {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupFieldValidation(form);
        });

        Utils.log('Form Validation Manager initialized', 'success');
    }

    setupFieldValidation(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('change', () => this.validateField(field));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = this.isFieldValid(field, value);

        field.classList.toggle('error', !isValid);
        field.setAttribute('aria-invalid', !isValid);

        return isValid;
    }

    isFieldValid(field, value) {
        const type = field.type;
        const required = field.hasAttribute('required');

        if (required && !value) return false;

        switch (type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'tel':
                return /^[\d\s\-\+\(\)]+$/.test(value);
            case 'url':
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            default:
                return true;
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fields = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            this.submitForm(form);
        }
    }

    submitForm(form) {
        Utils.log('Form submitted successfully', 'success');
        
        // Simulate submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Envoi...';

        setTimeout(() => {
            submitBtn.textContent = '✓ Envoyé !';
            submitBtn.style.backgroundColor = 'var(--success, #00dd44)';
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '';
                form.reset();
            }, 2000);
        }, 1000);
    }
}

// ============================================
// 13. LAZY LOAD MANAGER
// ============================================

class LazyLoadManager {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if (this.images.length === 0 || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.images.forEach(img => observer.observe(img));

        Utils.log('Lazy Load Manager initialized', 'success');
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        
        img.onload = () => {
            img.classList.add('loaded');
        };
        
        img.onerror = () => {
            img.classList.add('error');
        };
        
        img.src = src;
        img.removeAttribute('data-src');
    }
}

// ============================================
// 14. PERFORMANCE MONITOR
// ============================================

class PerformanceMonitor {
    static init() {
        if ('PerformanceObserver' in window) {
            try {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    Utils.log(`LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`, 'info');
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        Utils.log(`FID: ${entry.processingDuration}ms`, 'info');
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });

            } catch (e) {
                console.log('Performance monitoring not available');
            }
        }

        Utils.log('Performance Monitor initialized', 'success');
    }
}

// ============================================
// 15. PORTFOLIO FILTERS
// ============================================

class PortfolioFilters {
    constructor() {
        this.filterBtns = document.querySelectorAll('[data-filter]');
        this.portfolioItems = document.querySelectorAll('[data-category]');

        this.init();
    }

    init() {
        if (this.filterBtns.length === 0) return;

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applyFilter(btn));
        });

        Utils.log('Portfolio Filters initialized', 'success');
    }

    applyFilter(btn) {
        const filter = btn.getAttribute('data-filter');

        // Update active button
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter items
        this.portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                setTimeout(() => item.classList.add('fade-in-up'), 10);
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// ============================================
// 16. MODAL MANAGER
// ============================================

class ModalManager {
    constructor() {
        this.modals = document.querySelectorAll('[data-modal]');
        this.openBtns = document.querySelectorAll('[data-open-modal]');
        this.closeBtns = document.querySelectorAll('[data-close-modal]');

        this.init();
    }

    init() {
        this.openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = btn.getAttribute('data-open-modal');
                this.open(modalId);
            });
        });

        this.closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('[data-modal]');
                if (modal) this.close(modal.id);
            });
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });

        Utils.log('Modal Manager initialized', 'success');
    }

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    closeAll() {
        this.modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// 17. MAIN APP CLASS
// ============================================

class NUMIDIAPortfolio {
    constructor() {
        this.managers = [];
        Utils.log('NUMIDIA Portfolio Initializing...', 'info');
    }

    init() {
        try {
            // Initialize all managers
            new MobileMenuManager();
            new HeaderManager();
            new ActiveNavLinkManager();
            new ScrollAnimationsManager();
            new CounterAnimationsManager();
            new SkillBarsManager();
            new CopyToClipboardManager();
            new ScrollToTopManager();
            new DarkModeManager();
            new FormValidationManager();
            new LazyLoadManager();
            new PortfolioFilters();
            new ModalManager();

            // Performance monitoring
            PerformanceMonitor.init();

            Utils.log('✨ All systems operational!', 'success');
            this.logBrandingMessage();

        } catch (error) {
            Utils.log(`Initialization Error: ${error.message}`, 'error');
            console.error(error);
        }
    }

    logBrandingMessage() {
        const style = `
            color: #00d4ff;
            font-size: 14px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        `;
        console.log('%c🛡️ NUMIDIA Cyber Resilience Corporation', style);
        console.log('%cBlue Team Portfolio | SOC Operations | Threat Hunting', style);
    }
}

// ============================================
// 18. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new NUMIDIAPortfolio();
    portfolio.init();
});

// Error handling
window.addEventListener('error', (event) => {
    Utils.log(`Runtime Error: ${event.error}`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    Utils.log(`Promise Rejection: ${event.reason}`, 'error');
});

// ============================================
// 19. EXPORT FOR MODULE USE (if needed)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        MobileMenuManager,
        HeaderManager,
        ScrollAnimationsManager,
        NUMIDIAPortfolio
    };
}