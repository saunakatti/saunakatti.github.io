/* function to render rss feeds */
async function renderRssFeed(feedUrl, containerId, maxItems = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(feedUrl);
        if (!response.ok) throw new Error(`HTTP error. status: ${response.status}`);

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        if (items.length === 0) {
            container.innerHTML = "<p>No recent updates</p>"
            return;
        }

        let html = '<ul class="rss-list">';

        items.forEach((item, index) => {
            if (index >= maxItems) return;

            const title = item.querySelector("title")?.textContent || "Update";
            const link = item.querySelector("link")?.textContent || "#";
            const desc = item.querySelector("description")?.textContent || "";
            const pubDate = item.querySelector("pubDate")?.textContent || "";

            const formattedDate = formatDate(pubDate, true)

            html += `
                <li class="rss-item">
                    <div class="rss-item-header">
                        <a href="${link}" class="rss-title">${title}</a>
                        ${formattedDate ? `<span class="rss-date">${formattedDate}</span>` : ''}
                    </div>
                    ${desc ? `<p class="rss-desc">${desc}</p>` : ''}
                </li>
            `;
        });

        html += '</ul>';
        container.innerHTML = html;
    } catch (err) {
        console.error(`Failed to load feed from ${feedUrl}:`, err);
        container.innerHTML = `<p>Unable to load update feed.</p>`;
    }
}

// Init all feeds when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Encyclopedia updates
    renderRssFeed('../rss/wiki-feed.xml', 'wikiRssContainer', 5);

    // Page updates
    renderRssFeed('../rss/rss.xml', 'siteRssContainer', 5);
})