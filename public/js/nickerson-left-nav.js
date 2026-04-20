/**
 * @file nickerson-left-nav.js
 * @description Left navigation sidebar toggle, keyboard handling, and state persistence.
 *   NAV-001: skeleton created. NAV-006: toggle + sessionStorage + keyboard + CustomEvent.
 */
(function() {
    'use strict';

    var nav = document.getElementById('left-nav');
    var toggleBtn = document.querySelector('.left-nav-toggle');
    if (!nav || !toggleBtn) return;

    var hamburger = toggleBtn.querySelector('.hamburger-icon');
    var closeIcon = toggleBtn.querySelector('.close-icon');
    var STORAGE_KEY = 'leftNavOpen';

    function openNav() {
        nav.classList.add('open');
        document.body.classList.add('left-nav-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        if (hamburger) hamburger.style.display = 'none';
        if (closeIcon) closeIcon.style.display = '';
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch(e) {}
    }

    function closeNav() {
        nav.classList.remove('open');
        document.body.classList.remove('left-nav-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (hamburger) hamburger.style.display = '';
        if (closeIcon) closeIcon.style.display = 'none';
        try { sessionStorage.setItem(STORAGE_KEY, '0'); } catch(e) {}
    }

    toggleBtn.addEventListener('click', function() {
        if (nav.classList.contains('open')) {
            closeNav();
        } else {
            openNav();
        }
    });

    // Escape key closes nav
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            closeNav();
            toggleBtn.focus();
        }
    });

    // Close left nav when param sidebar opens (dual sidebar coordination)
    document.addEventListener('paramSidebarOpened', function() {
        if (nav.classList.contains('open')) {
            closeNav();
        }
    });

    // Restore state from sessionStorage (mobile only)
    try {
        if (window.innerWidth < 1024 && sessionStorage.getItem(STORAGE_KEY) === '1') {
            openNav();
        }
    } catch(e) {}

    // Scroll nav out of view when page scrolls horizontally
    window.addEventListener('scroll', function() {
        nav.style.transform = 'translateX(' + (-window.scrollX) + 'px)';
    });

    // NAV-008: Active page highlighting — exact match only
    var currentPath = window.location.pathname;
    var links = nav.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href');
        if (href && currentPath === href) {
            links[i].classList.add('active');
            links[i].setAttribute('aria-current', 'page');
        }
    }
})();

