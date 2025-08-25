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
    speed: 0.3,
    zoom: 1.05
};

// Site canonical origin (used for absolute canonical/og:url)
const SITE_ORIGIN = "https://www.omkharche.com";

// Global SVG Icons for Theme Toggle Button
const moonIcon = `<svg class="theme-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const sunIcon = `<svg class="theme-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

// Arcade Toggle Icons
const arcadeIcon = `<svg class="theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect><circle cx="9" cy="12" r="2"></circle><circle cx="15" cy="12" r="2"></circle><path d="M8 7h8"></path><path d="M7 17h10"></path></svg>`;
const arcadeExitIcon = `<svg class="theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8"/><polyline points="15 17 20 12 15 7"/><line x1="20" y1="12" x2="4" y2="12"/></svg>`;

// Global Vanta Functions
function initializeVantaFog() {
    if (VANTA && typeof VANTA.FOG === 'function') {
        if (vantaEffect) {
            vantaEffect.destroy();
        }
        vantaEffect = VANTA.FOG(vantaFogSettings);
    } else {
        console.error("VANTA.FOG is not available or not loaded yet.");
    }
}

function destroyVantaFog() {
    if (vantaEffect) {
        vantaEffect.destroy();
        vantaEffect = null;
    }
}

// --------------- SEO HELPERS (non-visual) ---------------
function normalizePathname(pathname) {
    if (!pathname) return '/';
    return pathname === '/index.html' ? '/' : pathname;
}

function getCanonicalUrl() {
    try {
        const { pathname } = window.location;
        return SITE_ORIGIN + normalizePathname(pathname);
    } catch (e) {
        return SITE_ORIGIN + '/';
    }
}

function ensureCanonicalLink(url) {
    const canonicalHref = url || getCanonicalUrl();
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
}

function ensureMetaByName(name) {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
    }
    return tag;
}

function ensureMetaByProperty(property) {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
    }
    return tag;
}

function setBasicSEOMeta(options) {
    const {
        title = document.title,
        description = '',
        type = 'website',
        url = getCanonicalUrl(),
        siteName = 'Om Kharche',
        imageUrl = getProfileImageUrl()
    } = options || {};

    if (title) document.title = title;
    if (description) {
        const desc = ensureMetaByName('description');
        desc.setAttribute('content', description);
    }
    ensureMetaByProperty('og:title').setAttribute('content', title);
    ensureMetaByProperty('og:description').setAttribute('content', description);
    ensureMetaByProperty('og:type').setAttribute('content', type);
    ensureMetaByProperty('og:url').setAttribute('content', url);
    ensureMetaByProperty('og:site_name').setAttribute('content', siteName);
    ensureMetaByProperty('og:image').setAttribute('content', imageUrl);
    ensureMetaByName('author').setAttribute('content', 'Om Kharche');
    ensureMetaByName('twitter:card').setAttribute('content', 'summary');
    ensureMetaByName('twitter:title').setAttribute('content', title);
    ensureMetaByName('twitter:description').setAttribute('content', description);
    ensureMetaByName('twitter:image').setAttribute('content', imageUrl);
}

function injectPersonJSONLD() {
    if (document.getElementById('ld-person')) return;
    const sameAs = [
        'https://www.instagram.com/omkharche_/',
        'https://x.com/omkharche_/'
    ];
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Om Kharche',
        url: getCanonicalUrl(),
        sameAs
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-person';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

function injectArticleJSONLD(article) {
    if (!article || !article.headline) return;
    let script = document.getElementById('ld-article');
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.headline,
        description: article.description || '',
        mainEntityOfPage: getCanonicalUrl(),
        author: { '@type': 'Person', name: 'Om Kharche' }
    };
    if (article.datePublished) data.datePublished = article.datePublished;
    if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'ld-article';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
}

function injectWebsiteJSONLD() {
    if (document.getElementById('ld-website')) return;
    const data = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: SITE_ORIGIN + '/',
        name: 'Om Kharche'
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-website';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

function getProfileImageUrl() {
    return 'https://twitter.com/omkharche_/profile_image?size=original';
}

function parseDateToISO(dateText) {
    if (!dateText) return '';
    try {
        // Attempt to parse flexible formats like "11 june 2025", "May 09, 2025 | MAA", "3 August 2025"
        const cleaned = dateText
            .replace(/\|.*$/, '')
            .replace(/\b(PNQ|MAA)\b/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
        const parsed = new Date(cleaned);
        if (!isNaN(parsed.getTime())) return parsed.toISOString();
    } catch (e) { }
    return '';
}

function extractAndApplyEssaySEO() {
    const container = document.getElementById('essay-display-area');
    if (!container) return;
    const titleEl = container.querySelector('h2.essay-title-for-seo');
    const summaryEl = container.querySelector('p.essay-summary-for-seo');
    const dateEl = container.querySelector('h3.essay-date');
    const fallbackPara = container.querySelector('.essay-text p');
    let title = titleEl && titleEl.textContent.trim();
    let description = summaryEl && summaryEl.textContent.trim();
    if (!title && fallbackPara) title = fallbackPara.textContent.trim().substring(0, 60) + '...';
    if (!description && fallbackPara) description = fallbackPara.textContent.trim().substring(0, 160);
    const isoDate = parseDateToISO(dateEl ? dateEl.textContent.trim() : '');
    // Prefer canonical to loaded essay path if using essays.html?load=...
    let canonicalUrl = getCanonicalUrl();
    try {
        const params = new URLSearchParams(window.location.search);
        const load = params.get('load');
        if (load) {
            const abs = new URL(load, window.location.href);
            canonicalUrl = abs.origin + abs.pathname;
        }
    } catch (e) { }
    ensureCanonicalLink(canonicalUrl);
    setBasicSEOMeta({ title: title || document.title, description: description || '', type: 'article', url: canonicalUrl });
    injectArticleJSONLD({ headline: title || document.title, description, datePublished: isoDate });
}

// Global Theme Setting Function
function setTheme(theme) {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleButton && sunIcon) themeToggleButton.innerHTML = sunIcon;
        localStorage.setItem('theme', 'dark');
        // Avoid Vanta while in arcade-mode; otherwise init
        if (!document.body.classList.contains('arcade-mode')) {
            if (typeof initializeVantaFog === 'function') initializeVantaFog();
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (themeToggleButton && moonIcon) themeToggleButton.innerHTML = moonIcon;
        localStorage.setItem('theme', 'light');
        if (typeof destroyVantaFog === 'function') destroyVantaFog();
    }
}

// Arcade Mode State
function setArcadeMode(enable, withIntro = true) {
    const arcadeToggleButton = document.getElementById('arcade-toggle-button');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (enable) {
        // Store current theme before entering arcade mode
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('previousTheme', currentTheme);

        document.body.classList.add('arcade-mode');
        // Remove classic theme classes to prevent conflicts
        document.body.classList.remove('dark-mode');
        localStorage.setItem('arcadeMode', 'on');
        if (arcadeToggleButton) arcadeToggleButton.innerHTML = arcadeExitIcon;

        // Destroy Vanta effect when entering arcade mode
        if (typeof destroyVantaFog === 'function') destroyVantaFog();

        if (withIntro && !prefersReducedMotion) {
            showArcadeIntroOverlay();
        }

        // Disable theme toggle interactions in Arcade mode
        const themeToggleButton = document.getElementById('theme-toggle-button');
        if (themeToggleButton) {
            themeToggleButton.setAttribute('aria-hidden', 'true');
            themeToggleButton.setAttribute('tabindex', '-1');
        }

        // Ensure proper arcade mode CSS initialization
        ensureArcadeModeCSS();

        // Add a small delay to ensure CSS transitions are properly applied
        setTimeout(() => {
            ensureArcadeModeCSS();
        }, 50);

        // Pac-Man feature removed
    } else {
        document.body.classList.remove('arcade-mode');
        localStorage.setItem('arcadeMode', 'off');
        if (arcadeToggleButton) arcadeToggleButton.innerHTML = arcadeIcon;

        // Restore user's previous theme fully (class + Vanta)
        const previousTheme = localStorage.getItem('previousTheme') || localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (typeof setTheme === 'function') setTheme(previousTheme);

        // Re-enable theme toggle
        const themeToggleButton = document.getElementById('theme-toggle-button');
        if (themeToggleButton) {
            themeToggleButton.removeAttribute('aria-hidden');
            themeToggleButton.removeAttribute('tabindex');
        }

        // Exit overlay
        if (withIntro && !prefersReducedMotion) {
            showArcadeExitOverlay();
        }

        // Pac-Man feature removed
    }
}

function showArcadeIntroOverlay() {
    // Prevent multiple overlays
    if (document.getElementById('arcade-intro-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'arcade-intro-overlay';
    overlay.innerHTML = `
        <div class="intro-scanlines"></div>
        <div class="intro-content">
            <div class="intro-title">ENTERING ARCADE</div>
            <div class="intro-sub">initializing neon engine...</div>
            <div class="intro-progress"><div class="bar"></div></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const remove = () => {
        if (!overlay.parentNode) return;
        overlay.style.transition = 'opacity 300ms ease';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 320);
    };
    // Remove after progress completes
    setTimeout(remove, 1950);
}

// Ensure proper arcade mode CSS variable initialization
function ensureArcadeModeCSS() {
    // Force a reflow to ensure CSS variables are properly applied
    document.body.offsetHeight;

    // Ensure arcade mode specific styles are loaded
    const style = document.createElement('style');
    style.id = 'arcade-mode-css-ensure';
    style.textContent = `
        body.arcade-mode {
            background-color: var(--arcade-bg-deep) !important;
            color: var(--arcade-neon-primary) !important;
        }
        body.arcade-mode .content-box,
        body.arcade-mode .essay-container {
            background: var(--arcade-panel) !important;
        }
        body.arcade-mode .essay-text p {
            color: var(--arcade-neon-primary) !important;
            text-shadow: 0 0 4px rgba(57,255,20,0.6);
        }
        body.arcade-mode .essay-text h3 {
            color: var(--arcade-neon-secondary) !important;
            text-shadow: 0 0 6px rgba(255,43,214,0.7);
        }
        body.arcade-mode .essay-date {
            color: var(--arcade-neon-accent) !important;
            text-shadow: 0 0 5px rgba(0,229,255,0.7);
        }
        body.arcade-mode .essay-title-main,
        body.arcade-mode .essay-title-section {
            color: var(--arcade-neon-secondary) !important;
            text-shadow: 0 0 8px rgba(255,43,214,0.8);
        }
        body.arcade-mode .custom-text {
            color: var(--arcade-neon-accent) !important;
            text-shadow: 0 0 5px rgba(0,229,255,0.7);
        }
        body.arcade-mode .binary-shoes-link {
            color: var(--arcade-neon-accent) !important;
            text-decoration-color: var(--arcade-neon-secondary) !important;
            text-shadow: 0 0 6px rgba(0,229,255,0.8), 0 0 16px rgba(0,229,255,0.45) !important;
        }
    `;

    // Remove any existing style to prevent duplicates
    const existingStyle = document.getElementById('arcade-mode-css-ensure');
    if (existingStyle) {
        existingStyle.remove();
    }

    document.head.appendChild(style);
}

function showArcadeExitOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'arcade-exit-overlay';
    overlay.innerHTML = `
        <div class="intro-content">
            <div class="intro-title">LEAVING ARCADE</div>
            <div class="intro-sub">restoring your theme...</div>
            <div class="intro-progress"><div class="bar"></div></div>
        </div>
    `;
    document.body.appendChild(overlay);
    const remove = () => {
        if (!overlay.parentNode) return;
        overlay.style.transition = 'opacity 240ms ease';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 260);
    };
    setTimeout(remove, 1250);
}

// Pac-Man logic removed per request

function insertArcadeToggleButton() {
    if (document.getElementById('arcade-toggle-button')) return;
    const btn = document.createElement('button');
    btn.id = 'arcade-toggle-button';
    btn.type = 'button';
    btn.title = 'Toggle Arcade Mode';
    btn.setAttribute('aria-label', 'Toggle Arcade Mode');
    btn.innerHTML = arcadeIcon;
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        const isArcade = document.body.classList.contains('arcade-mode');
        setArcadeMode(!isArcade, true);
    });
}

// Essay Search State (remains specific to script.js context, not directly theme related)
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
            // Pac-Man feature removed
        }
    }, 20);
}

function getPageFromHash() {
    const hash = window.location.hash.replace('#', '');
    return hash && document.getElementById('page-' + hash) ? hash : 'home';
}

document.addEventListener('DOMContentLoaded', () => {
    // This listener is primarily for index.html specific setup now

    // Check if we are on index.html (e.g., by checking for a unique element)
    // For simplicity, we assume script.js is mainly for index.html context for these initializations.
    // If an element specific to index.html exists, then run these.
    if (document.getElementById('home-link')) { // home-link is in index.html sidebar
        showPage(getPageFromHash());
        setupEssaySearch();

        document.querySelectorAll('.sidebar .link').forEach(link => {
            link.addEventListener('click', function (event) {
                const pageName = this.getAttribute('data-page');
                if (pageName) {
                    event.preventDefault();
                    window.location.hash = pageName;
                    showPage(pageName);
                } else {
                    // If it's an external link or no data-page, let it behave normally or go home
                    // For now, let's assume direct external links don't call showPage
                    if (!this.href.startsWith('http')) showPage('home');
                }
            });
        });

        const homeLink = document.getElementById('home-link');
        if (homeLink) {
            homeLink.style.cursor = 'pointer';
            homeLink.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.hash = '';
                showPage('home');
            });
        }
        window.addEventListener('hashchange', () => {
            showPage(getPageFromHash());
        });

        const preferredTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (typeof setTheme === 'function') {
            setTheme(preferredTheme); // Set initial theme for index.html
        }

        const themeToggleButton = document.getElementById('theme-toggle-button');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', () => {
                const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                if (typeof setTheme === 'function') {
                    setTheme(newTheme);
                }
            });
        }
    }
    // Essays views (static or dynamic) -> mark and hide arcade toggle via CSS
    const inEssaysView = !!document.querySelector('.essay-container');
    if (inEssaysView) {
        document.body.classList.add('has-essays-view');
    } else {
        document.body.classList.remove('has-essays-view');
    }

    // Global canonical + base OG/Twitter tags + Person JSON-LD
    ensureCanonicalLink();
    const defaultDescription = (document.querySelector('meta[name="description"]')?.getAttribute('content')) || 'Personal website and essays by Om Kharche.';
    const pageType = document.getElementById('home-link') ? 'website' : (inEssaysView ? 'article' : 'website');
    const urlNow = getCanonicalUrl();
    setBasicSEOMeta({ title: document.title, description: defaultDescription, type: pageType, url: urlNow });
    injectPersonJSONLD();
    injectWebsiteJSONLD();

    // If a static essay page already has its content in DOM, inject Article JSON-LD and tighten meta
    if (inEssaysView) {
        extractAndApplyEssaySEO();
        // Observe dynamic content loads and re-apply SEO
        const essayDisplayArea = document.getElementById('essay-display-area');
        if (essayDisplayArea && 'MutationObserver' in window) {
            const observer = new MutationObserver(() => {
                extractAndApplyEssaySEO();
            });
            observer.observe(essayDisplayArea, { childList: true, subtree: true });
        }
    }

    // Insert Arcade toggle and initialize state
    insertArcadeToggleButton();
    const savedArcade = localStorage.getItem('arcadeMode') === 'on';
    setArcadeMode(savedArcade, false);

    // Ensure arcade mode CSS is properly initialized if already active
    if (savedArcade) {
        ensureArcadeModeCSS();
    }

    // Pac-Man feature removed

    // ===== Minimal Custom Cursor Initialization =====
    initCustomCursor();
});

// ===== Custom Cursor Logic =====
function initCustomCursor() {
    if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;
    // Avoid duplicate
    if (document.querySelector('.cursor-dot') || document.querySelector('.cursor-ring')) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    document.body.classList.add('has-custom-cursor');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    const ringLerp = 0.18; // smoothness for ring

    function onMouseMove(e) {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        document.body.classList.add('cursor-visible');
    }

    function animate() {
        ringX += (mouseX - ringX) * ringLerp;
        ringY += (mouseY - ringY) * ringLerp;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animate);
    }

    function onMouseEnter() {
        document.body.classList.add('cursor-visible');
    }
    function onMouseLeave() {
        document.body.classList.remove('cursor-visible');
    }
    function onMouseDown() {
        document.body.classList.add('cursor-active');
    }
    function onMouseUp() {
        document.body.classList.remove('cursor-active');
    }

    // Hover state over interactive elements
    function updateHoverState(target) {
        const isInteractive = !!target && (
            target.closest('a, button, [role="button"], input, textarea, select, summary, label, .link, .contact-link')
        );
        const isText = !!target && (
            target.closest('input[type="text"], input[type="search"], textarea, [contenteditable="true"]')
        );
        if (isInteractive) document.body.classList.add('cursor-hover'); else document.body.classList.remove('cursor-hover');
        if (isText) document.body.classList.add('cursor-text'); else document.body.classList.remove('cursor-text');
    }

    window.addEventListener('mousemove', (e) => { onMouseMove(e); updateHoverState(e.target); }, { passive: true });
    window.addEventListener('mouseenter', onMouseEnter, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    // When theme or arcade mode toggles, nothing extra is needed; CSS handles colors.
    // However, ensure cursor remains above transient overlays by re-appending to body on visibility changes.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (dot.parentNode !== document.body) document.body.appendChild(dot);
            if (ring.parentNode !== document.body) document.body.appendChild(ring);
        }
    });

    // Kick animation loop
    animate();
}
