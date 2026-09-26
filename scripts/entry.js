// ======================
// Entry renderer script
// ======================

// Data header & Entry rendering
// -----------------------------

// For loading content to entry.html, it's important that this happens in the right order (at least some of it I think)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filePath = urlParams.get('file') || '';
    const headerContainer = document.getElementById('entryHeader');

    if (!filePath || !headerContainer) return;

    // Route classifications
    const isBlog = filePath.startsWith('blog/');
    const isWiki = filePath.startsWith('worldbuilding/');
    const isDocs = filePath.startsWith('docs/');

    // Dynamic Back-Link update
    const backLink = document.getElementById('backLink');
    if (backLink) {
        if (isBlog) {
            backLink.href = 'blog.html';
            backLink.innerHTML = '<span class="nf-fa-arrow_left"></span>&nbsp; Back to Blog';
        } else if (isWiki) {
            backLink.href = 'worldbuilding.html';
            backLink.innerHTML = '<span class="nf-fa-arrow_left"></span>&nbsp; Back to Worldbuilding';
        } else if (isDocs) {
            backLink.href = 'docs.html';
            backLink.innerHTML = '<span class="nf-fa-arrow_left"></span>&nbsp; Back to Documentation';
        }
    }

    // Populate directory sidebar based on section
    if (isBlog) {
        populateSidebarDirectory('blog');
        fetchBlogMeta(filePath, headerContainer);
    }
    else if (isWiki) {
        populateSidebarDirectory('worldbuilding');
        fetchWikiMeta(filePath, headerContainer);
    } 
    else populateSidebarDirectory('docs');

    // Fetch and render the content file
    if (filePath) {
        fetchMarkdownContent(filePath);
    }

    if (document.getElementById('blogPreviews')) {
        loadBlogPreviews();
    }

});

function toggleEntryHeader() {
    const header = document.getElementById('entryHeader');
    if (!header) return; // Prevents the null error if the element isn't rendered yet
    
    header.classList.toggle('headerHidden');
}


// Render BLOG metadata
function fetchBlogMeta(filePath, container) {
    fetch('../data/blogData.json')
        .then(res => res.json())
        .then(data => {
            // Flatten nested year/category objects to search for the post
            const posts = Object.values(data).flatMap(category => Object.values(category));
            const post = posts.find(p => p.entryPath === filePath);
            if (!post) return;

            const postDate = typeof formatDate === 'function' ? formatDate(post.pubDate || post.date, true) : (post.pubDate || post.date || '');

            container.innerHTML = `
                <div class="blogMetaHeader">
                    <div class="metaDetails">
                        <span class="postDate"><span class="nf-md-calendar"></span>&nbsp;${postDate}</span>
                        ${post.author ? `<span class="postAuthor"><span class="nf-fa-user_pen"></span>&nbsp;${post.author}</span>` : ''}
                        ${post.language ? `<span class="postLang lang-${post.language.toLowerCase()}">${post.language}</span>` : ''}
                    </div>
                    <hr>
                    <strong>Tags: </strong>
                    ${post.tags ? `
                        <div class="blogTags">
                            ${post.tags.map(t => `<span class="blogTag">${t}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
}

// Render WB ENTRY metadata
function fetchWikiMeta(filePath, container) {
    fetch('../data/wikiData.json')
        .then(res => res.json())
        .then(data => {
            let entry = null;

            // search categories for the right meta
            for (const category in data) {
                for (const id in data[category]) {
                    if (data[category][id].entryPath === filePath) {
                        entry = data[category][id];
                        break;
                    }
                }
            }
            if (!entry) return;

            // render attributes if present
                let attributesHtml = ''
                if (entry.attributes) {
                    attributesHtml = `
                    <hr>
                    <strong>Attributes:</strong>
                    <div class="attributeBox">
                        <div class="attributeGrid">
                    `;

                    for (const [key, value] of Object.entries(entry.attributes)) {
                        attributesHtml += `
                        <div class="attributeBlock">
                            <span class="attrKey">${key}:</span>
                            <span class="attrVal" data-val="${value}">${value}</span>
                        </div>
                        `;
                    }
                    attributesHtml += `
                        </div>
                    </div>
                    `;
                }

            // format aliases
            let formattedAliases = 'None';
                if (entry.aliases) {
                    formattedAliases = Array.isArray(entry.aliases)
                        ? entry.aliases.join(', ')
                        : entry.aliases;
                }
        
            // render header
            container.innerHTML = `
                <div class="wikiMetaHeader">
                    <div class="metaRow">
                        <span class="metaLabel">Type:</span>
                        <span class="metaValue">${entry.type || 'N/A'}</span>
                    </div>
                    <div class="metaRow">
                        <span class="metaLabel">Aliases:</span>
                        <span class="metaValue">${formattedAliases}</span>
                    </div>
                    ${attributesHtml}
                </div>
            `;
        })
}

// Fetch md file and convert to HTML using marked.js
async function fetchMarkdownContent(filePath) {
    const entryBody = document.getElementById('entryBody');
    if (!entryBody) return;

    try {
        const response = await fetch(`${filePath}`);
        if (!response.ok) throw new Error('File not found');

        const markdownText = await response.text();

        // 1. Convert Markdown to HTML (using your parser, e.g., marked)
        entryBody.innerHTML = marked.parse(markdownText);

        // 2. Trigger Prism to highlight code blocks in entryBody
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(entryBody);
        }

        generateToc();

    } catch (err) {
        console.error('Error loading entry content:', err);
        entryBody.innerHTML = '<p>Error loading entry content.</p>';
    }
}

// Sidebar (hidden by default)
// ---------------------------

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('entrySidebar');
    if (sidebar) sidebar.classList.toggle('closed');
}

// generate toc from h2 and h3 in entryBody
function generateToc() {
    const entryBody = document.getElementById('entryBody');
    const tocList = document.getElementById('tocList');
    if (!tocList || !entryBody) return;

    tocList.innerHTML = '';
    const headings = entryBody.querySelectorAll('h2, h3');

    if (headings.length === 0) {
        tocList.innerHTML = '<li><em>No subheadings<em><li>';
        return; 
    };

    let currentH2List = null;

    headings.forEach((heading, idx) => {
        if (!heading.id) {
            heading.id = `heading-${idx}`;
        }
        const tag = heading.tagName.toLowerCase();
        const link = `<a href="#${heading.id}">${heading.textContent}</a>`

        if (tag === 'h2') {
            const h2Item = document.createElement('li');
            h2Item.className = 'toc-h2';
            h2Item.innerHTML = link;
            tocList.appendChild(h2Item);

            currentH2List = document.createElement('ul');
            currentH2List.className = 'toc-sublist';
            h2Item.appendChild(currentH2List)
        } else if (tag === 'h3') {
            const h3Item = document.createElement('li');
            h3Item.className = 'toc-h3'
            h3Item.innerHTML = link;

            if (currentH2List) {
                currentH2List.appendChild(h3Item);
            } else {
                tocList.appendChild(h3Item);
            }
        }
    })
}


