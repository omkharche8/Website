// Add any JavaScript functionality here
let clockInterval = null;
let currentActivePage = null; // Keep track of the current page

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

// --- Helper: Remove Highlights ---
function removeHighlights(container) {
    const highlighted = container.querySelectorAll('span.highlight');
    highlighted.forEach(span => {
        // Replace span with its text content
        span.outerHTML = span.innerHTML;
    });
    // Normalize text nodes (merge adjacent text nodes)
    container.normalize();
}

// --- Essay Search Logic ---
function filterEssays() {
    if (currentActivePage !== 'essays') return;

    const searchInput = document.getElementById('essay-search-input');
    const searchTerm = searchInput.value.trim(); // Trim whitespace
    const essaysContainer = document.querySelector('#page-essays .essays-page-content');
    const entries = essaysContainer.querySelectorAll('.essay-entry');
    let firstVisibleEntry = null;

    // Remove previous highlights first
    removeHighlights(essaysContainer);

    entries.forEach(entry => {
        const entryTextElement = entry.querySelector('.essay-text');
        const dateElement = entry.querySelector('.essay-date');
        const entryText = (entryTextElement ? entryTextElement.textContent : '').toLowerCase();
        const dateText = (dateElement ? dateElement.textContent : '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const isMatch = searchTerm === '' || entryText.includes(searchLower) || dateText.includes(searchLower);

        if (isMatch) {
            entry.classList.remove('hidden');
            if (!firstVisibleEntry) {
                firstVisibleEntry = entry; // Found the first one to scroll to
            }
            // Apply new highlights if there's a search term
            if (searchTerm !== '' && entryTextElement) {
                const regex = new RegExp('(' + searchTerm.replace(/[-\/\\^$*+?.()|[\\]{}]/g, '\\$&') + ')', 'gi');
                entryTextElement.innerHTML = entryTextElement.innerHTML.replace(regex, '<span class="highlight">$1</span>');
            }
        } else {
            entry.classList.add('hidden');
        }
    });

    // Scroll to the first visible entry if search term is not empty
    if (firstVisibleEntry && searchTerm !== '') {
        // Use the scrollable container
        const offsetTop = firstVisibleEntry.offsetTop;
        essaysContainer.scrollTo({
            top: offsetTop - 30, // Adjust 30px offset as needed for padding/search bar
            behavior: 'smooth'
        });
    } else if (searchTerm === '') {
        // Scroll to top if search is cleared
        essaysContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function setupEssaySearch() {
    const searchToggle = document.getElementById('essay-search-toggle');
    const searchInput = document.getElementById('essay-search-input');
    const searchControls = document.querySelector('.essay-search-controls');

    if (searchToggle && searchInput && searchControls) {
        searchToggle.addEventListener('click', () => {
            searchControls.classList.toggle('active');
            if (searchControls.classList.contains('active')) {
                searchInput.focus();
            }
        });

        searchInput.addEventListener('input', filterEssays);

        // Optional: Close search if user clicks outside
        document.addEventListener('click', (event) => {
            if (!searchControls.contains(event.target) && searchControls.classList.contains('active')) {
                if (event.target !== searchInput && event.target !== searchToggle) {
                    searchControls.classList.remove('active');
                }
            }
        });
    }
}
// --- End Essay Search Logic ---

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const next = document.getElementById('page-' + pageId);
    currentActivePage = pageId; // Update current page tracker

    pages.forEach(page => page.classList.remove('active'));

    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
        const clockElement = document.getElementById('live-clock');
        if (clockElement) clockElement.textContent = '';
    }

    if (pageId !== 'essays') {
        const searchInput = document.getElementById('essay-search-input');
        const searchControls = document.querySelector('.essay-search-controls');
        const essaysContainer = document.querySelector('#page-essays .essays-page-content');
        if (searchInput) searchInput.value = '';
        if (searchControls) searchControls.classList.remove('active');
        if (essaysContainer) {
            removeHighlights(essaysContainer); // Clear highlights when leaving
            document.querySelectorAll('#page-essays .essay-entry.hidden').forEach(entry => entry.classList.remove('hidden'));
            essaysContainer.scrollTop = 0; // Reset scroll
        }
    }

    setTimeout(() => {
        if (next) {
            next.classList.add('active');
            if (pageId === 'contact') {
                updateISTClock();
                clockInterval = setInterval(updateISTClock, 1000);
            }
        }
    }, 20);
}

function getPageFromHash() {
    const hash = window.location.hash.replace('#', '');
    return hash && document.getElementById('page-' + hash) ? hash : 'home';
}

document.addEventListener('DOMContentLoaded', () => {
    showPage(getPageFromHash());
    setupEssaySearch(); // Initialize essay search listeners

    document.querySelectorAll('.sidebar .link').forEach(link => {
        link.addEventListener('click', function (event) {
            const pageName = this.getAttribute('data-page');
            if (pageName) {
                event.preventDefault();
                window.location.hash = pageName;
                showPage(pageName);
            } else {
                showPage('home');
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
