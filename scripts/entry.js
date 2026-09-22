// ======================
// Entry renderer script
// ======================

// Data header & Entry rendering
// -----------------------------

// For loading content to entry.html, it's important that this happens in the right order (at least some of it I think)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filePath = urlParams.get('file');

    if (!filePath) {
        document.getElementById('entryBody').innerHTML = '<p>No entry specified.<p>';
        return;
    }

    const backLink = document.getElementById('backLink');
    const headerContainer = document.getElementById('entryHeader');

    // detect type of entry
    const isBlog = filePath.startsWith('blog/')
    const isWorldbuilding = filePath.startsWith('worldbuilding/');

    // adjust back link accordingly
    if (isBlog) {
        backLink.href = 'blog.html';
        backLink.innerHTML = '<span class="nf-fa-arrow_left"></span>&nbsp; Back to Blog';
    } else if (isWorldbuilding) {
        backLink.href = 'worldbuilding.html';
        backLink.innerHTML = '<span class="nf-fa-arrow_left"></span>&nbsp; Back to Worldbuilding';
    } else {
        backLink.href = 'index.html'
        backLink.innerHTML = '<span class="nf-fa-arrow_left"></span>&nbsp; Back to Home'
    }

    // fetch metadata according to type
    if (isBlog) {
        fetchBlogMeta(filePath, headerContainer); 
    } else if (isWorldbuilding) {
        fetchWikiMeta(filePath, headerContainer);
    }

    // fetch and render md content
    fetchMarkdownContent(filePath);

    // populate sidebar dir
    populateSidebarDirectory(isBlog)
});

// toggle data header section
function toggleHeader() {
    const header = document.getElementById('entryHeader');
    if (header) header.classList.toggle('headerHidden');
}


// Render BLOG metadata
function fetchBlogMeta(filePath, container) {
    fetch('../data/blogData.json')
        .then(res => res.json())
        .then(data => {
            const post = data.posts.find(p => p.filePath === filePath);
            if (!post) return;

            const postDate = formatDate(post.pubDate, true)

            // render header
            container.innerHTML = `
            <div class="blogMetaHeader">
                <div class="metaDetails">
                    <span class="postDate"><span class="nf-md-calendar"></span>&nbsp;${postDate}</span>
                    <span class="postAuthor"><span class="nf-fa-user_pen"></span>&nbsp;${post.author}</span>
                    <span class="postLang lang-${post.language.toLowerCase()}">${post.language}</span>
                </div>
                <hr>
                <div class="blogTags">
                    <strong>Tags:</strong>
                    ${post.tags.map(t => `<span class="blogTag">${t}</span>`).join('')}
                </div>
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

            // set up attr variable
            //let attributesHtml = '';
            //if (entry.attributes) {
            //    attributesHtml = `<div class="attributeGrid>"` +
            //        Object.entries(entry.attributes)
            //            .map(([k, v]) => `<div class="attributeBlock"><span class="attrVal">${k}:</span> ${v}</div>`)
            //            .join('') +
            //        `</div>`;
            //}

            // render attributes if present
                let attributesHtml = ''
                if (entry.attributes) {
                    attributesHtml = `
                    <hr>
                    <div class="attributeBox">
                        <strong>Attributes:</strong>
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
                            <span class="metaValue">${entry.type}</span>
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
function fetchMarkdownContent(filePath) {

    fetch(filePath)
    .then(res => {
        if (!res.ok) throw new Error(`File not found (${res.status})`);
        return res.text();
    })
    .then(markdownText => {
        const htmlContent = parseMarkdown(markdownText, filePath)

        if (htmlContent === undefined) {
            throw new Error("parseMarkdown returned undefined.")
        }

        document.getElementById('entryBody').innerHTML = htmlContent

        // Generate toc
        generateToc();
    })
    .catch (err => {
        console.error("Md fetch error:", err);
        document.getElementById('entryBody').innerHTML = `<h3><strong>Error loading entry: ${err.message}</strong></h3>`
    });
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

// populate sidebar with blog or wb links only + setup search targets (we can use global filterDirectory() for searching
function populateSidebarDirectory(isBlog) {
    const dirTitle = document.getElementById('sidebarDirectoryTitle');
    const container = document.getElementById('sidebarList');
    if (!container) return;

    if (isBlog) {
        if (dirTitle) dirTitle.textContent = "All Blog Posts";
        fetch('../data/blogData.json')
            .then(res => res.json())
            .then(data => {
                
                const postsByYear = data.posts.reduce((acc, post) => {
                    const year = new Date(post.pubDate).getFullYear() || 'Other';
                    if (!acc[year]) acc[year] = [];
                    acc[year].push(post);
                    return acc;
                }, {});

                const sortedYears = Object.keys(postsByYear).sort((a, b) => b - a);

                container.innerHTML = sortedYears.map(year => {
                    const postItems = postsByYear[year].map(post => {
                        const postDate = formatDate(post.pubDate, true);
                        const postDateN = formatDate(post.pubDate);
                        const searchableText = `${post.title} ${post.language} ${post.author} ${postDate} ${(post.tags || []).join(' ')}`.toLowerCase();

                        return `
                            <li class="directoryItem" data-search="${searchableText}">
                                <a href="entry.html?file=${encodeURIComponent(post.filePath)}">
                                    <strong>${post.title}</strong>
                                </a>
                                - ${postDateN}
                            </li>
                        `;
                    }).join('');

                    return `
                        <li class="directoryYearGroup">
                            <h4 class="directoryYearTitle">${year}</h4>
                            <ul class="directoryYearList">
                                ${postItems}
                            </ul>
                        </li>
                    `;
                }).join('');
            });

    } else {
        // Almost re-utilized from map.js 
        if (dirTitle) dirTitle.textContent = "Worldbuilding Entries";    
        
        fetch('../data/wikiData.json')
            .then(res => res.json())
            .then(data => {
                let html = '';

                for (const [category, entries] of Object.entries(data)) {
                    html += `<li class="categoryGroup">
                        <h4 class="categoryHeader">${capitalizeFirstLetter(category)}</h4>
                        <ul>`;

                    for (const [key, entry] of Object.entries(entries)) {
                        const entryUrl = `entry.html?file=${encodeURIComponent(entry.entryPath)}`;

                        let attributeString = '';
                        if (entry.attributes) {
                            attributeString = Object.entries(entry.attributes)
                                .map(([k, v]) => `${k} ${v}`)
                                .join(' ');
                        }

                        const aliasesString = Array.isArray(entry.aliases) 
                            ? entry.aliases.join(' ') 
                            : (entry.aliases || '');

                        const searchableText = `${entry.title} ${aliasesString} ${entry.type} ${attributeString} ${entry.description || ''}`.toLowerCase();

                        // Simplified link
                        html += `
                            <li class="directoryItem" data-search="${searchableText}">
                                <a href="${entryUrl}">
                                    <strong>${entry.title}</strong>
                                </a>
                                <small>(${entry.type})</small>
                            </li>`;
                    }

                    html += `</ul></li>`;
                }

                container.innerHTML = html;
            })
            .catch(err => console.error("Error loading directory:", err));
    }
}



