// ======================
// DOMAIN WIDE FUNCTIONS
// ======================

// Function for capitalicing 1. letter
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
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