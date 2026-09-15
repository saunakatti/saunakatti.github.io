// ======================
// DOMAIN WIDE FUNCTIONS
// ======================

// Function for capitalicing 1. letter
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

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
function filterDirectory() {
    const query = document.getElementById('directorySearch').value.toLowerCase().trim();
    const items = document.querySelectorAll('.directoryItem');

    items.forEach(item => {
        const searchTarget = item.getAttribute('data-search') || '';
        if (searchTarget.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // hide empty categories
    document.querySelectorAll('#directoryList ul').forEach(ul => {
        const hasVisible = Array.from(ul.children).some(li => li.style.display !== 'none');
        const header = ul.previousElementSibling;
        if (header && header.classList.contains('categoryHeader')) {
            header.style.display = hasVisible ? '' : 'none';
        }
    });
}

// Switch tab
function switchTab(tabId) {
    document.querySelectorAll('.tabContent').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tabBtn').forEach(el => el.classList.remove('active'));

    document.getElementById(tabId).style.display = 'block';

    const activeBtn = Array.from(document.querySelectorAll('.tabBtn'))
        .find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) activeBtn.classList.add('active');

    if (tabId === 'directoryTab') {
        loadDirectory();
    }
}