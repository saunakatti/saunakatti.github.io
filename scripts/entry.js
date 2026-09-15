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
});

// toggle data header section
// ...

// Render BLOG metadata
function fetchBlogMeta(filePath, container) {
    fetch('../data/blogData.json')
        .then(res => res.json())
        .then(data => {
            const post = data.posts.find(p => p.filePath === filePath);
            if (!post) return;

            // render header
            container.innerHTML = `
            <div class="blogMetaHeader">
                <div class="metaDetails">
                    <span class="postDate"><span class="nf-md-calendar"></span>&nbsp; ${post.date} at ${post.time}</span>
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

        // Generate toc here when WIP
    })
    .catch (err => {
        console.error("Md fetch error:", err);
        document.getElementById('entryBody').innerHTML = `<p>Error loading entry: ${err.message}</p>`
    });
}

// Sidebar (hidden by default)
// ---------------------------

// Toggle sidebar

// generate toc from h2 and h3 in entryBody

// populate sidebar with blog or wb links only + setup search targets (we can use global filterDirectory() for searching, might need fixing)


