// get file param from url
const urlParams = new URLSearchParams(window.location.search);
const filePath = urlParams.get('file');

const container = document.getElementById('entryContainer');

if (filePath) {
    fetch(filePath)
    .then(response => {
        if (!response.ok) throw new Error("Entry not found");
        return response.text();
    })
    .then(markdownText => {
        const htmlContent = marked.parse(markdownText);
        container.innerHTML = `<div class="entryBody">${htmlContent}</div>`;

        // Finds links in the parsed file & changes them to usable format
        container.querySelectorAll('.entryBody a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.md') && !href.startsWith('http')) {
                const dummyBase = 'https://wiki.local/';
                const resolvedUrl = new URL(href, dummyBase + filePath);        // use url resolver to clean relative paths

                // remove dummy origin and leading slash)
                const targetPath = resolvedUrl.pathname.substring(1);

                // Redirect to entry.html with new filepath
                link.href = `entry.html?file=${encodeURIComponent(targetPath)}`;
            }
        });
    })
    .catch(error => {
        console.error(error);
        container.innerHTML = `<h2>Error</h2><p>Could not load the requested entry.</p>`;
    });
} else {
    container.innerHTML = `<h2>No entry specified</h2>`
} 