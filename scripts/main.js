// ======================
// DOMAIN WIDE FUNCTIONS
// ======================

// Function for capitalicing 1. letter
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// Register marked-alert once at startup
marked.use(markedAlert());

// markdown parser (marked.js)
function parseMarkdown(markdownText, filePath) {
    // Convert Markdown to HTML
    const htmlContent = marked.parse(markdownText);

    // load new HTML string into in-memory DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // re-route md links
    doc.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Internal md links
        if (href.endsWith('.md') && !href.startsWith('http') && !href.startsWith('/')) {
            const dummyBase = 'https://wiki.local/';
            
            // Resolve path relative to current markdown file
            const resolvedUrl = new URL(href, dummyBase + filePath);
            const targetPath = resolvedUrl.pathname.substring(1); // Strip leading slash

            // Route through universal reader
            link.href = `entry.html?file=${encodeURIComponent(targetPath)}`;
        }
        else if (href.startsWith('#')) {
            link.href = href;
        }
        // leave absolute and .html paths alone (handled by browser)
        else if (href.startsWith('/') || href.endsWith('.html')) {
        }
        // External links
        else if (href.startsWith('http://') || href.startsWith('https://')) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
    // IMPORTANT return processed string 
    return doc.body.innerHTML;
}

// Live search filter
function filterDirectory(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    if (!input || !list) return;

    const query = input.value.toLowerCase().trim();
    
    if (!list) return;

    const items = list.querySelectorAll('.directoryItem');
    items.forEach(item => {
        const searchTarget = item.getAttribute('data-search') || item.textContent.toLowerCase();
        if (searchTarget.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    })
    
    // hide empty categories
    const categoryGroups = list.querySelectorAll('.categoryGroup');
    categoryGroups.forEach(group => {
        const categoryItems = Array.from(group.querySelectorAll('.directoryItem'));
        const hasVisibleItems = categoryItems.some(item => item.style.display !== 'none');

        if (!hasVisibleItems && query !== '') {
            group.style.display = 'none';
        } else {
            group.style.display = '';
        }
    });
}

// Switch tab
function switchTab(tabId) {
    document.querySelectorAll('.tabContent').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });

    document.querySelectorAll('.tabBtn').forEach(el => el.classList.remove('active'));

    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.style.display = 'block';
        targetContent.classList.add('active'); // <-- Adds .active to tabContent
    }

    const activeBtn = Array.from(document.querySelectorAll('.tabBtn'))
    .find(btn => btn.getAttribute('onclick')?.includes(tabId));

    if (activeBtn) activeBtn.classList.add('active');

    if (tabId === 'directoryTab') {
        loadDirectory();
    }

    // Force Leaflet map to redraw and recalculate its container size
    if (window.map) {
        setTimeout(() => {
            window.map.invalidateSize();
        }, 100);
    }
}

// Simple date + time formatter
function formatDate(dateString, includeTime = false) {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return '';

    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return dateObj.toLocaleString(undefined, options);
}

// Toggle header
function toggleHeader() {
    const header = document.getElementById('siteHeader')
    const button = document.getElementById('headerToggle')

    const isExpanded = header.classList.toggle('is-expanded')

    button.setAttribute('aria-expanded', isExpanded);
    button.innerHTML = isExpanded ? '<span class="nf-fa-close"></span>' : '<span class="nf-md-menu"></span>';
}