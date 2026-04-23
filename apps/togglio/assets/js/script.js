/* ================================================
   GYMMETRIC LANDING PAGE — INTERACTIONS
   ================================================ */

(function () {
    'use strict';

    // ---------- Theme mode ----------
    var themeStorageKey = 'site-theme-mode';
    var themeButtons = document.querySelectorAll('[data-theme-option]');
    var systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function resolveTheme(mode) {
        return mode === 'dark' || (mode === 'system' && systemThemeQuery.matches) ? 'dark' : 'light';
    }

    function applyTheme(mode) {
        var resolvedTheme = resolveTheme(mode);

        document.documentElement.setAttribute('data-theme-mode', mode);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.style.colorScheme = resolvedTheme;

        themeButtons.forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.getAttribute('data-theme-option') === mode));
        });
    }

    function getInitialThemeMode() {
        try {
            return localStorage.getItem(themeStorageKey) || document.documentElement.getAttribute('data-theme-mode') || 'system';
        } catch (error) {
            return document.documentElement.getAttribute('data-theme-mode') || 'system';
        }
    }

    applyTheme(getInitialThemeMode());

    function syncSystemTheme() {
        if ((document.documentElement.getAttribute('data-theme-mode') || 'system') === 'system') {
            applyTheme('system');
        }
    }

    if (systemThemeQuery.addEventListener) {
        systemThemeQuery.addEventListener('change', syncSystemTheme);
    } else if (systemThemeQuery.addListener) {
        systemThemeQuery.addListener(syncSystemTheme);
    }

    // ---------- Navbar scroll effect ----------
    const nav = document.getElementById('nav');
    const progressBar = document.querySelector('.scroll-progress span');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastScroll = 0;

    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (nav) {
            nav.classList.toggle('nav--scrolled', scrollY > 40);
        }

        if (progressBar) {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollable > 0 ? scrollY / scrollable : 0;
            progressBar.style.transform = 'scaleX(' + progress + ')';
        }

        lastScroll = scrollY;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ---------- Mobile menu ----------
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;

    function closeMobileMenu() {
        menuOpen = false;
        if (mobileMenu) {
            mobileMenu.classList.remove('open');
        }
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            menuOpen = !menuOpen;
            mobileMenu.classList.toggle('open', menuOpen);
            hamburger.classList.toggle('active', menuOpen);
            document.body.style.overflow = menuOpen ? 'hidden' : '';
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                closeMobileMenu();
            });
        });
    }

    themeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var mode = button.getAttribute('data-theme-option') || 'system';

            try {
                localStorage.setItem(themeStorageKey, mode);
            } catch (error) {}

            applyTheme(mode);

            if (mobileMenu && mobileMenu.contains(button)) {
                closeMobileMenu();
            }
        });
    });

    // ---------- Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
            var top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    // ---------- Reveal on scroll (Intersection Observer) ----------
    var revealElements = document.querySelectorAll('.reveal');

    if (reducedMotion) {
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
    } else if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        // Fallback: show everything
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // ---------- Counter animation ----------
    var counters = document.querySelectorAll('.counter');

    if ('IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        counters.forEach(function (c) {
            counterObserver.observe(c);
        });
    }

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        var duration = 1600;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(step);
    }

    // ---------- Active nav link highlighting ----------
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__links a');

    function updateActiveLink() {
        var scrollPos = window.scrollY + 120;
        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();

    // ---------- Stagger reveal for grid children ----------
    document.querySelectorAll('.features__grid, .showcase__cards, .privacy__grid, .pricing__grid').forEach(function (grid) {
        var children = grid.children;
        if ('IntersectionObserver' in window) {
            var gridObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        // Stagger each child
                        Array.from(children).forEach(function (child, i) {
                            setTimeout(function () {
                                child.classList.add('visible');
                            }, i * 100);
                        });
                        gridObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            gridObserver.observe(grid);
        }
    });

    // ---------- Hero particles ----------
    var heroSection = document.getElementById('hero');
    if (heroSection && !reducedMotion) {
        var particleContainer = document.createElement('div');
        particleContainer.className = 'hero__particles';
        heroSection.appendChild(particleContainer);

        var particleCount = 16;
        for (var i = 0; i < particleCount; i++) {
            var p = document.createElement('span');
            p.className = 'hero__particle';
            p.style.setProperty('--x', (Math.random() * 90 + 5) + '%');
            p.style.setProperty('--y', (Math.random() * 85 + 5) + '%');
            p.style.setProperty('--size', (Math.random() * 4 + 2) + 'px');
            p.style.setProperty('--duration', (Math.random() * 6 + 4) + 's');
            p.style.setProperty('--delay', (Math.random() * 5) + 's');
            p.style.setProperty('--opacity', (Math.random() * 0.32 + 0.10).toFixed(2));
            particleContainer.appendChild(p);
        }
    }

    // ---------- Parallax for hero glow ----------
    var heroGlow = document.querySelector('.hero__bg-glow');

    if (heroGlow && !reducedMotion) {
        window.addEventListener('mousemove', function (e) {
            var x = (e.clientX / window.innerWidth - 0.5) * 30;
            var y = (e.clientY / window.innerHeight - 0.5) * 30;
            heroGlow.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(1)';
        }, { passive: true });
    }

})();
