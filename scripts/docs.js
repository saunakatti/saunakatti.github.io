// Docs page stuff

document.addEventListener('DOMContentLoaded', () => {

    populateSidebarDirectory('docs');
    loadDocsPreviews();
});

async function loadDocsPreviews() {
    const container = document.getElementById('docsPreviews');
    if (!container) return;

    fetch('../data/docsData.json')
        .then(res => res.json())
        .then(data => {

        // Extract all post objects from all category keys (e.g., "2026", "2025")
        const posts = Object.values(data).flatMap(category => Object.values(category));

        container.innerHTML = posts.map(post => `
            <article class="blog-card">
                <h2>
                    <a href="entry.html?file=${encodeURIComponent(post.entryPath)}">
                        ${post.title}
                    </a>
                </h2>
                <div class="metaDetails">
                    ${post.author ? `<span class="postAuthor"><span class="nf-fa-user_pen"></span>&nbsp;${post.author}</span>` : ''}
                    ${post.language ? `<span class="postLang lang-${post.language.toLowerCase()}">${post.language}</span>` : ''}
                </div>
                ${post.tags ? `
                    <div class="blogTags">
                        ${post.tags.map(t => `<span class="blogTag">${t}</span>`).join('')}
                    </div>
                ` : ''}
                <p class="summary">${post.summary || 'No summary provided.'}</p>
                <a class="read-more" href="entry.html?file=${encodeURIComponent(post.entryPath)}">
                    Read post&nbsp;<span class="nf-fa-arrow_right"></span>
                </a>
            </article>
        `).join('');
    })
    .catch(err => console.error("Error loading blog previews:", err));
}