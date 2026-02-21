/**
 * Mobile Tooltip Sidebar
 * Opens a slide-out sidebar to display tooltip content on mobile devices
 */

(function() {
    'use strict';

    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Open tooltip sidebar
    window.openTooltipSidebar = function(title, content) {
        const sidebar = document.getElementById('tooltip-sidebar');
        const overlay = document.getElementById('tooltip-sidebar-overlay');
        const titleEl = document.getElementById('tooltip-sidebar-title');
        const contentEl = document.getElementById('tooltip-sidebar-content');

        if (!sidebar || !overlay) return;

        // Set title and content
        titleEl.textContent = title || 'Details';

        // Parse content line by line and style LTC Savings Spending
        const lines = content.split('\n');
        const styledLines = lines.map(line => {
            if (line.includes('LTC Savings Spending:')) {
                return '<span style="font-weight: bold; color: #66ccff;">' + escapeHtml(line) + '</span>';
            }
            return escapeHtml(line);
        });
        contentEl.innerHTML = '<pre>' + styledLines.join('\n') + '</pre>';

        // Show sidebar
        sidebar.classList.add('active');
        overlay.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    };

    // Close tooltip sidebar
    window.closeTooltipSidebar = function() {
        const sidebar = document.getElementById('tooltip-sidebar');
        const overlay = document.getElementById('tooltip-sidebar-overlay');

        if (!sidebar || !overlay) return;

        // Hide sidebar
        sidebar.classList.remove('active');
        overlay.classList.remove('active');

        // Restore body scroll
        document.body.style.overflow = '';
    };

    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initialize tooltip sidebar on page load
    document.addEventListener('DOMContentLoaded', function() {
        if (!isMobile()) return;

        // Find all cells with title attribute
        const cells = document.querySelectorAll('.projection-table td[title]');

        cells.forEach(function(cell) {
            // Add click event listener
            cell.addEventListener('click', function(e) {
                const title = this.getAttribute('data-tooltip-title') || this.getAttribute('aria-label') || 'Details';
                const content = this.getAttribute('title');

                if (content) {
                    e.preventDefault();
                    openTooltipSidebar(title, content);
                }
            });

            // Add accessibility attributes
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');

            // Keyboard support
            cell.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeTooltipSidebar();
            }
        });
    });
})();
