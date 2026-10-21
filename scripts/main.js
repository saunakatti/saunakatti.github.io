// hide noJs message
const noJsMessage = document.getElementById('noJsMessage');
if (noJsMessage) {
    noJsMessage.style.display = 'none';
}

// ======================
// THEME SWITCHER AND FONT SWITCHER
// ======================

const THEMES = ["catppuccin-mocha", "catppuccin-frappe", "catppuccin-latte", "legacy-light", "saunakatti"];

const savedTheme = localStorage.getItem('site-theme') || 'saunakatti';
const validTheme = THEMES.includes(savedTheme) ? savedTheme : 'saunakatti';

// Apply the theme to the root element immediately
document.documentElement.classList.remove(...THEMES);
document.documentElement.classList.add(validTheme);
document.documentElement.setAttribute('data-theme', validTheme);

// Apply a specific theme to the root element and Chattable
function applyTheme(themeName) {
    // Update the root element's theme
    document.documentElement.classList.remove(...THEMES);
    document.documentElement.classList.add(themeName);
    document.documentElement.setAttribute('data-theme', themeName);
}

// apply codeblock theme
function applyPrismTheme(themeName) {
    const prismLink = document.getElementById('prismTheme');
    if (prismLink) {
        // Points to your prism theme files directory
        prismLink.href = `../css/prism/${themeName}.css`;
    }
}

// Apply theme to Chattable (only if the iframe exists)
function applyChattableTheme(themeName) {
    if (window.chattable && document.getElementById('chattable')) {
        chattable.reinitialize({
            stylesheet: `../css/chattable/saunakatti.css`
            // stylesheet: `../css/chattable/${themeName}.css`
        });
    }
}

// Initialize Chattable on startup
function initTheme() {
    const savedTheme = localStorage.getItem('site-theme') || 'saunakatti';
    const validTheme = THEMES.includes(savedTheme) ? savedTheme : 'saunakatti';

    applyTheme(validTheme);
    applyPrismTheme(validTheme);

    // Initialize Chattable with the default theme first
    if (document.getElementById('chattable')) {
        chattable.initialize({
            stylesheet: `../css/chattable-${validTheme}.css`
        }).then(() => {
            // Apply the saved theme to Chattable after the iframe loads
            applyChattableTheme(validTheme);
        });
    }
}

// Run on startup
initTheme();

// Listen for theme changes
document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = document.documentElement.getAttribute('data-theme') || 'catppuccin-mocha';
        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            localStorage.setItem('site-theme', selectedTheme);
            
            applyTheme(selectedTheme);

            applyPrismTheme(selectedTheme);

            if (document.getElementById('chattable')) {
                applyChattableTheme(selectedTheme);
            }
        });
    }
});

const FONTS = ["notosans", "jetbrainsmono", "opendyslexic"];

// Apply on startup
function initFont() {
    const savedFont = localStorage.getItem('site-font') || 'notosans';
    const validFont = FONTS.includes(savedFont) ? savedFont : 'notosans';

    document.documentElement.setAttribute('data-font', validFont);
}

// run
initFont();

document.addEventListener('DOMContentLoaded', () => {
    const fontSelect = document.getElementById('fontSelect');
 
    if (fontSelect) {
        const currentFont = document.documentElement.getAttribute('data-font') || "notosans";
        fontSelect.value = currentFont;

        fontSelect.addEventListener('change', (e) => {
            const selectedFont = e.target.value;
            document.documentElement.setAttribute('data-font', selectedFont);
            localStorage.setItem('site-font', selectedFont);
        })
    }
});


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

    // load new HTML string into DOM parser
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
            link.rel = 'noopener noreferrer';         // it's good measure to add _blank as target and noopener noreferrer for external links
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

  // Match the class used in loadDirectory()!
  const categoryGroups = list.querySelectorAll('.sidebar-category');

  categoryGroups.forEach((group) => {
    const categoryItems = Array.from(group.querySelectorAll('.directoryItem'));
    let hasVisibleItems = false;

    categoryItems.forEach((item) => {
      const searchTarget = item.getAttribute('data-search') || item.textContent.toLowerCase();
      if (searchTarget.includes(query)) {
        item.style.display = '';
        hasVisibleItems = true;
      } else {
        item.style.display = 'none';
      }
    });

    if (query === '') {
      // Search cleared: show all categories, collapse them
      group.style.display = '';
      group.open = false;
    } else if (hasVisibleItems) {
      // Show and auto-expand categories with matches
      group.style.display = '';
      group.open = true;
    } else {
      // Hide categories with no matches
      group.style.display = 'none';
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

// Directory rendering
// populate sidebar with blog or wb links only + setup search targets (we can use global filterDirectory() for searching
async function populateSidebarDirectory(contentType) {
    const sidebarList = document.getElementById('directoryList');
    if (!sidebarList) return;

    const titleElement = document.getElementById('sidebarDirectoryTitle');
    
    // Auto-detect contentType from the URL path if not explicitly provided
    if (!contentType) {
        const path = window.location.pathname;
        if (path.includes('blog')) {
            contentType = 'blog';
        } else if (path.includes('worldbuilding')) {
            contentType = 'worldbuilding';
        } else {
            contentType = 'docs';
        }
    }
    
    if (titleElement) {
        if (contentType === 'blog') titleElement.textContent = 'Blog Directory';
        else if (contentType === 'worldbuilding') titleElement.textContent = 'Wiki Directory';
        else if (contentType === 'docs') titleElement.textContent = 'Digital Garden';
    }

    const dataFiles = {
        'blog': '../data/blogData.json',
        'worldbuilding': '../data/wikiData.json',
        'docs': '../data/docsData.json'
    };

    const targetUrl = dataFiles[contentType] || dataFiles['docs'];

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        // Renders Blog, Wiki, and Docs with zero duplicate code
        renderKeyedSidebar(data, sidebarList);

    } catch (err) {
        console.error(`Error loading directory for ${contentType}:`, err);
    }
}

function renderKeyedSidebar(data, sidebarList) {
    if (!sidebarList) return;

    sidebarList.innerHTML = '';

    Object.entries(data).forEach(([categoryKey, itemsMap]) => {
        const categoryItem = Object.values(itemsMap);

        // Format the title for display
        const formattedTitle = categoryKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());

        // Create a details element for each category
        const detailsElement = document.createElement('details');
        detailsElement.className = 'sidebar-category';

        // Create a summary element for the category header
        const summaryElement = document.createElement('summary');
        summaryElement.className = 'category-toggle';
        summaryElement.textContent = formattedTitle;

        // Add Nerd Fonts icons for open/closed states
        summaryElement.innerHTML = `
            <span class="icon closed-icon"></span>
            <span class="icon open-icon"></span>
            <span class="title">${formattedTitle}</span>
        `;

        // Create a list for the category items
        const itemList = document.createElement('ul');
        itemList.className = 'category-items';

        // Add items to the list
        categoryItem.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.className = 'directoryItem';
            listItem.innerHTML = `
                <a href="entry.html?file=${encodeURIComponent(item.entryPath)}" class="directoryLink">
                    ${item.title}
                </a>
            `;
            itemList.appendChild(listItem);
        });

        // Append the summary and item list to the details element
        detailsElement.appendChild(summaryElement);
        detailsElement.appendChild(itemList);

        // Append the details element to the sidebar
        sidebarList.appendChild(detailsElement);

    });
}