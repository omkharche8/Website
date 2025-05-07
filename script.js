// Add any JavaScript functionality here
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const next = document.getElementById('page-' + pageId);
    // Remove .active from all pages immediately
    pages.forEach(page => page.classList.remove('active'));
    // Add .active to the new page after a short delay for transition
    setTimeout(() => {
        if (next) next.classList.add('active');
    }, 20); // 1 frame delay to allow CSS transition to apply
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
