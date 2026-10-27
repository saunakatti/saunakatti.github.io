// ======================
// Entry renderer script
// ======================

// Register marked-alert once at startup
marked.use(markedAlert());

// Data header & Entry rendering
// -----------------------------

const dataCache = {};
// Fetching data and saving it to cache
function getData(file) {
    if (!dataCache[file]) {
        dataCache[file] = fetch(file)
            .then(response => {
                if (!response.ok) throw new Error("Failed fetching database: " + file);
                return response.json();
            })
            .catch(err => {
                console.error(err);
                delete dataCache[file]; // allow retry on failure
                throw err;
            });
    }
    return dataCache[file];
}

// Pass data-file path from filepath
function getDataFileForPath(filePath) {
    if (filePath.includes('blog/')) return '../data/blogData.json';
    if (filePath.includes('docs/')) return '../data/docsData.json';
    return '../data/wikiData.json'; // default fallback
}

// Resolve relative links to entryPath found in datafiles
function resolveRelativePath(currentPath, relativePath) {
    if (!relativePath.startsWith('.')) return relativePath;

    const stack = currentPath.split('/');
    stack.pop(); // remove current filename from path stack

    for (const part of relativePath.split('/')) {
        if (part === '..') {
            stack.pop();
        } else if (part !== '.') {
            stack.push(part);
        }
    }
    return stack.join('/');
}

// Add the class wiki-missing to links with no entry in datafile of currently active group (blog, wb, docs)
async function markMissingMdLinks(html, currentFilePath) {
    const dataFile = getDataFileForPath(currentFilePath);
    const data = await getData(dataFile);

    // Collect all valid entry paths into a Set
    const validPaths = new Set();
    Object.values(data).forEach(category => {
        Object.values(category || {}).forEach(entry => {
            if (entry && entry.entryPath) {
                validPaths.add(entry.entryPath);
            }
        });
    });

    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;

        // Extract target path if it's routed through your universal reader (entry.html?file=...)
        let targetPath = href;
        if (href.includes('file=')) {
            try {
                const urlParams = new URLSearchParams(href.split('?')[1]);
                targetPath = urlParams.get('file') || href;
            } catch (e) {
                // fallback
            }
        }

        targetPath = targetPath.split(/[?#]/)[0];

        // If it's an internal entry link and not found in the valid paths, add your red CSS class
        if (!href.startsWith('http') && !href.startsWith('#') && !validPaths.has(targetPath)) {
            a.classList.add('wiki-missing');
        }
    });

    return doc.body.innerHTML;
}

// For LOADING CONTENT to entry.html
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
            backLink.innerHTML = '<span class="nf-fa-arrow_left"></span>&nbsp; Back to Digital Garden';
        }
    }

    // Populate directory sidebar and meta header based on group
    if (isBlog) {
        populateSidebarDirectory('blog');
        fetchBlogMeta(filePath, headerContainer);
    }
    else if (isDocs) {
        populateSidebarDirectory('docs');
        fetchDocsMeta(filePath, headerContainer);
    } 
    else {
        populateSidebarDirectory('worldbuilding');
        fetchWikiMeta(filePath, headerContainer);
    }

    // Render MD as HTML in page's #entryBody (see the function)
    if (filePath) {
        fetchMarkdownContent(filePath)
    } 

});

// Toggle meta header for entry
function toggleEntryHeader() {
    const header = document.getElementById('entryHeader');
    if (!header) return; // Prevents the null error if the element isn't rendered yet
    
    header.classList.toggle('headerHidden');
}

// Render DOCS metadata header
// bit scuffed since it just uses most of the blog meta features
function fetchDocsMeta(filePath, container) {
    getData('../data/docsData.json')
        .then(data => {
            // Flatten nested year/category objects to search for the post
            const posts = Object.values(data).flatMap(category => Object.values(category));
            const post = posts.find(p => p.entryPath === filePath);
            if (!post) return;

            const postDate = typeof formatDate === 'function' ? formatDate(post.pubDate || post.date, true) : (post.pubDate || post.date || '');

            container.innerHTML = `
                <div class="blogMetaHeader">
                    <div class="metaDetails">
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

// Render BLOG metadata header
function fetchBlogMeta(filePath, container) {
    getData('../data/blogData.json')
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

// Render WB ENTRY metadata header
function fetchWikiMeta(filePath, container) {
    getData('../data/wikiData.json')
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

        // Convert Markdown to HTML (using own parser function with marked and some link handling)
        let renderedHtml = (parseMarkdown(markdownText, filePath));
        // Add class wiki-missing to links in question
        renderedHtml = await markMissingMdLinks(renderedHtml, filePath);
        // Render the html in #entryBody
        entryBody.innerHTML = renderedHtml

        // Trigger Prism to highlight code blocks in entryBody
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(entryBody);
        }

        addHeadingIds();
        generateToc();

        if (!window._hashHandled && location.hash) {
            window._hashHandled = true;
            const target = document.getElementById(location.hash.slice(1));
            if (target) target.scrollIntoView();
        }

    } catch (err) {
        console.error('Error loading entry content:', err);
        entryBody.innerHTML = '<p>Error loading entry content. The entry might be work in progress.</p>';
    }
}

// Markdown parser (marked.js)
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

// Heading Handling
// --------------------

// github style heading handling
function slugify(text) {
  return text.trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // ä->a, ö->o
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Give nice heading IDs to headings so they can easily be linked to from files
function addHeadingIds() {
  const usedCount = new Map();
  document.querySelectorAll('#entryBody h1, #entryBody h2, #entryBody h3, #entryBody h4, #entryBody h5, #entryBody h6')
    .forEach(h => {
      let slug = slugify(h.textContent);
      const n = usedCount.get(slug) || 0;
      usedCount.set(slug, n + 1);
      h.id = n === 0 ? slug : `${slug}-${n}`;
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
    const headings = entryBody.querySelectorAll('h1, h2, h3');

    if (headings.length === 0) {
        tocList.innerHTML = '<li><em>No subheadings<em><li>';
        return; 
    };

    let currentH2List = null;

    headings.forEach((heading) => {
        
        const tag = heading.tagName.toLowerCase();
        const link = `<a href="#${heading.id}">${heading.textContent}</a>`
        
        // The h1 part usually not added since it's entry title but I wanted it
        if (tag === 'h1') {
            const h1Item = document.createElement('li');
            h1Item.className = 'toc-h1';
            h1Item.innerHTML = link;
            tocList.appendChild(h1Item)

            currentH1List = document.createElement('ul')
            currentH1List.className = 'toc-list';
            h1Item.appendChild(currentH1List);
        } else if (tag === 'h2') {
            const h2Item = document.createElement('li');
            h2Item.className = 'toc-h2';
            h2Item.innerHTML = link;
            tocList.appendChild(h2Item);

            currentH2List = document.createElement('ul');
            currentH2List.className = 'toc-sublist';
            h2Item.appendChild(currentH2List)

            if (currentH1List) {
                currentH1List.appendChild(h2Item)
            }

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




