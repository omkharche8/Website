// Add any JavaScript functionality here
let clockInterval = null;
let currentActivePage = null; // Keep track of the current page
let vantaEffect = null; // Vanta effect instance

// Centralized Vanta FOG Settings
const vantaFogSettings = {
    el: "#vanta-background",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    highlightColor: 0x2a2a2a,   // slightly softer highlight
    midtoneColor: 0x404040,     // smoother middle tone
    lowlightColor: 0x252a25,    // green-gray hint, very subtle
    baseColor: 0x1a1a1a,        // soft charcoal base
    blurFactor: 0.7,
    speed: 0.03,
    zoom: 1.05
};


// Essay Search State
let essayMatches = [];
let currentMatchIndex = -1;

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

// --- Helper: Scroll to Element ---
function smoothScrollTo(element, container) {
    const offsetTop = element.offsetTop;
    container.scrollTo({
        top: offsetTop - 30, // Adjust offset
        behavior: 'smooth'
    });
}

// --- Helper: Update Nav Button States ---
function updateNavButtons() {
    const prevButton = document.getElementById('essay-search-prev');
    const nextButton = document.getElementById('essay-search-next');
    if (!prevButton || !nextButton) return;

    prevButton.disabled = currentMatchIndex <= 0;
    nextButton.disabled = currentMatchIndex >= essayMatches.length - 1;
}

// --- Essay Search Logic ---
function filterEssays() {
    if (currentActivePage !== 'essays') return;

    const searchInput = document.getElementById('essay-search-input');
    const searchTerm = searchInput.value.trim();
    const essaysContainer = document.querySelector('#page-essays .essays-page-content');
    const entries = essaysContainer.querySelectorAll('.essay-entry');
    const searchControls = document.querySelector('.essay-search-controls');

    essayMatches = []; // Reset matches
    currentMatchIndex = -1; // Reset index

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
            essayMatches.push(entry); // Add to matches array

            // Apply highlights
            if (searchTerm !== '' && entryTextElement) {
                const regex = new RegExp('(' + searchTerm.replace(/[-\/\\^$*+?.()|[\\]{}]/g, '\\$&') + ')', 'gi');
                entryTextElement.innerHTML = entryTextElement.innerHTML.replace(regex, '<span class="highlight">$1</span>');
            }
        } else {
            entry.classList.add('hidden');
        }
    });

    if (searchTerm !== '' && essayMatches.length > 0) {
        currentMatchIndex = 0; // Start at the first match
        smoothScrollTo(essayMatches[currentMatchIndex], essaysContainer);
        searchControls.classList.add('has-results'); // Show nav buttons
    } else {
        searchControls.classList.remove('has-results'); // Hide nav buttons
        if (searchTerm === '') {
            essaysContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    updateNavButtons(); // Update disabled state
}

function goToNextMatch() {
    if (currentMatchIndex < essayMatches.length - 1) {
        currentMatchIndex++;
        const essaysContainer = document.querySelector('#page-essays .essays-page-content');
        smoothScrollTo(essayMatches[currentMatchIndex], essaysContainer);
        updateNavButtons();
    }
}

function goToPrevMatch() {
    if (currentMatchIndex > 0) {
        currentMatchIndex--;
        const essaysContainer = document.querySelector('#page-essays .essays-page-content');
        smoothScrollTo(essayMatches[currentMatchIndex], essaysContainer);
        updateNavButtons();
    }
}

function setupEssaySearch() {
    const openToggle = document.getElementById('essay-search-open-toggle');
    const closeToggle = document.getElementById('essay-search-close-toggle');
    const searchInput = document.getElementById('essay-search-input');
    const searchControls = document.querySelector('.essay-search-controls');
    const prevButton = document.getElementById('essay-search-prev');
    const nextButton = document.getElementById('essay-search-next');

    if (openToggle && closeToggle && searchInput && searchControls && prevButton && nextButton) {
        // Open Search
        openToggle.addEventListener('click', () => {
            searchControls.classList.add('active');
            searchInput.focus();
        });

        // Close Search
        closeToggle.addEventListener('click', () => {
            searchControls.classList.remove('active');
            searchInput.value = ''; // Clear input
            filterEssays(); // Reset filter (removes highlights, shows all)
        });

        // Filter on input
        searchInput.addEventListener('input', filterEssays);

        // Previous/Next Navigation
        prevButton.addEventListener('click', goToPrevMatch);
        nextButton.addEventListener('click', goToNextMatch);
    }
}

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
        if (searchControls) {
            searchControls.classList.remove('active');
            searchControls.classList.remove('has-results'); // Hide nav buttons
        }
        if (essaysContainer) {
            removeHighlights(essaysContainer);
            document.querySelectorAll('#page-essays .essay-entry.hidden').forEach(entry => entry.classList.remove('hidden'));
            essaysContainer.scrollTop = 0;
            essayMatches = []; // Clear matches array
            currentMatchIndex = -1; // Reset index
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

// --- VANTA FOG Effect Initialization ---
function initializeVantaFog() {
    if (VANTA && typeof VANTA.FOG === 'function') {
        if (vantaEffect) {
            vantaEffect.destroy();
        }
        vantaEffect = VANTA.FOG(vantaFogSettings); // Use the centralized settings object
    } else {
        console.error("VANTA.FOG is not available. Make sure vanta.fog.min.js is loaded.");
    }
}

function destroyVantaFog() {
    if (vantaEffect) {
        vantaEffect.destroy();
        vantaEffect = null;
    }
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

    const themeToggleButton = document.getElementById('theme-toggle-button');

    // SVG Icons - stroke set to currentColor, color managed by CSS
    const moonIcon = `<svg class="theme-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunIcon = `<svg class="theme-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    function setTheme(theme) {
        const themeToggleButton = document.getElementById('theme-toggle-button'); // Ensure button is fetched here
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggleButton) themeToggleButton.innerHTML = sunIcon;
            localStorage.setItem('theme', 'dark');
            initializeVantaFog(); // Initialize Vanta for dark mode
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggleButton) themeToggleButton.innerHTML = moonIcon;
            localStorage.setItem('theme', 'light');
            destroyVantaFog(); // Destroy Vanta for light mode
        }
    }

    const preferredTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferredTheme); // Set initial theme

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }
});
