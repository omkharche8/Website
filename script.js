// Add any JavaScript functionality here
let clockInterval = null;

function updateISTClock() {
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        const now = new Date();
        const utcOffset = now.getTimezoneOffset() * 60000; // local offset in milliseconds
        const istOffset = (5 * 60 + 30) * 60000; // IST offset in milliseconds (UTC+5:30)
        const istTime = new Date(now.getTime() + utcOffset + istOffset);

        const hours = istTime.getHours().toString().padStart(2, '0');
        const minutes = istTime.getMinutes().toString().padStart(2, '0');
        const seconds = istTime.getSeconds().toString().padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds} IST`;
    }
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const next = document.getElementById('page-' + pageId);
    pages.forEach(page => page.classList.remove('active'));

    // Clear previous clock interval if it exists
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
        const clockElement = document.getElementById('live-clock');
        if (clockElement) clockElement.textContent = ''; // Clear old time
    }

    setTimeout(() => {
        if (next) {
            next.classList.add('active');
            if (pageId === 'contact') {
                updateISTClock(); // Initial update
                clockInterval = setInterval(updateISTClock, 1000); // Update every second
            }
        }
    }, 20);
}

function getPageFromHash() {
    const hash = window.location.hash.replace('#', '');
    return hash && document.getElementById('page-' + hash) ? hash : 'home';
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial page
    showPage(getPageFromHash());
    // Navigation
    document.querySelectorAll('.sidebar .link').forEach(link => {
        link.addEventListener('click', function (event) {
            const pageName = this.getAttribute('data-page');

            if (pageName) {
                // Handle internal SPA navigation
                event.preventDefault();
                window.location.hash = pageName;
                showPage(pageName);
            } else {
                // Handle external link click - show 'home' (blank) page content
                // Default link action (opening in new tab) is NOT prevented
                showPage('home');
                // Optionally, reset hash if you want the URL to reflect the blank state
                // window.location.hash = 'home'; // or ''
            }
        });
    });
    // Title acts as home button
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.style.cursor = 'pointer';
        homeLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.hash = '';
            showPage('home');
        });
    }
    // Hash change (back/forward)
    window.addEventListener('hashchange', () => {
        showPage(getPageFromHash());
    });
});
