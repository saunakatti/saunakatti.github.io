// ======================
// Entry readed script
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
function fetchBlogMeta(filePath, content) {
    fetch('../data/blogData.json')
        .then(res => res.json())
        .then(data => {
            const post = data.posts.find(p => p.filePath === filePath);
            if (!post) return;

            container.innerHTML = `
            `;
        })
}

// Render WB ENTRY metadata
function fetchWikiMeta(filePath, content) {

}

// Fetch md file and convert to HTML

// Sidebar (hidden by default)
// ---------------------------

// Toggle sidebar

// generate toc from h2 and h3 in entryBody

// populate sidebar with blog or wb links only + setup search targets (we can use global filterDirectory() for searching, might need fixing)


