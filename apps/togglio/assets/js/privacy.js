/* ================================================
   GYMMETRIC — PRIVACY PAGE INTERACTIONS
   ================================================ */

(function () {
    'use strict';

    // ---------- TOC active link on scroll ----------
    var tocLinks = document.querySelectorAll('.priv-toc__link');
    var sections = document.querySelectorAll('.priv-section[id]');

    if (!tocLinks.length || !sections.length) return;

    function updateToc() {
        var scrollPos = window.scrollY + 140;
        var activeSectionId = null;

        sections.forEach(function (section) {
            if (section.offsetTop <= scrollPos) {
                activeSectionId = section.getAttribute('id');
            }
        });

        tocLinks.forEach(function (link) {
            var href = link.getAttribute('href').replace('#', '');
            if (href === activeSectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateToc, { passive: true });
    updateToc();

    // ---------- Smooth scroll for TOC links ----------
    tocLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
            var top = target.getBoundingClientRect().top + window.scrollY - navH - 24;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

})();
