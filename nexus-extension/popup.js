const API_URL = "http://localhost:3000/api/ext-capture";
const PROJECTS_URL = "http://localhost:3000/api/get-projects";

document.addEventListener('DOMContentLoaded', () => {
    const destSelect = document.getElementById('destinationSelect');
    const projWrapper = document.getElementById('projectWrapper');
    const projSelect = document.getElementById('projectSelect');

    destSelect.addEventListener('change', (e) => {
        projWrapper.style.display = e.target.value === 'project' ? 'block' : 'none';
    });

    // 1. Fetch Projects
    fetch(PROJECTS_URL)
        .then(res => res.json())
        .then(data => {
            projSelect.innerHTML = ''; // Clear loading
            if (data.projects && data.projects.length > 0) {
                data.projects.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.name;
                    opt.textContent = p.name; // capitalized in CSS if needed
                    projSelect.appendChild(opt);
                });
            } else {
                const opt = document.createElement('option');
                opt.value = "";
                opt.textContent = "No projects found";
                projSelect.appendChild(opt);
            }
        })
        .catch(err => {
            console.error("Failed to load projects", err);
            projSelect.innerHTML = '<option value="">Offline</option>';
        });

    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab) {
            document.getElementById('title').value = currentTab.title || "";
            document.getElementById('url').value = currentTab.url || "";
        }
    });

    // Handle Save Link (Primary)
    document.getElementById('saveLinkBtn').addEventListener('click', async () => {
        const title = document.getElementById('title').value;
        const url = document.getElementById('url').value;
        const note = document.getElementById('note').value;
        const project = document.getElementById('destinationSelect').value === 'global' ? '' : document.getElementById('projectSelect').value;
        const statusEl = document.getElementById('status');
        const saveBtn = document.getElementById('saveLinkBtn');

        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
        statusEl.textContent = "";

        // Prepare content
        let content = note || title;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content,
                    url: url,
                    type: "link",
                    project_anchor: project
                })
            });

            const data = await response.json();

            if (data.success) {
                statusEl.textContent = project ? `Link saved to ${project}!` : "Link saved to Global Inbox!";
                statusEl.style.color = "#4ade80";
                setTimeout(() => window.close(), 1000);
            } else {
                throw new Error(data.error || "Unknown error");
            }

        } catch (error) {
            console.error(error);
            statusEl.textContent = "Error: " + error.message;
            statusEl.style.color = "#f87171";
            saveBtn.disabled = false;
            saveBtn.innerHTML = "<span>🔗</span> Save Link";
        }
    });

    // Handle Screenshot
    document.getElementById('screenshotBtn').addEventListener('click', async () => {
        const title = document.getElementById('title').value;
        const url = document.getElementById('url').value;
        const note = document.getElementById('note').value;
        const project = document.getElementById('destinationSelect').value === 'global' ? '' : document.getElementById('projectSelect').value;
        const statusEl = document.getElementById('status');
        const screenshotBtn = document.getElementById('screenshotBtn');

        screenshotBtn.disabled = true;
        screenshotBtn.textContent = "Capturing...";
        statusEl.textContent = "";

        try {
            // Capture visible tab
            const dataUrl = await new Promise((resolve, reject) => {
                chrome.tabs.captureVisibleTab(null, { format: 'png' }, (image) => {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }
                    resolve(image);
                });
            });

            // Send to API
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: note || title || "Screenshot",
                    url: url,
                    image: dataUrl,
                    type: "image",
                    project_anchor: project
                })
            });

            const data = await response.json();

            if (data.success) {
                statusEl.textContent = "Screenshot saved!";
                statusEl.style.color = "#4ade80";
                setTimeout(() => window.close(), 1000);
            } else {
                throw new Error(data.error || "Unknown error");
            }

        } catch (error) {
            console.error(error);
            statusEl.textContent = "Error: " + error.message;
            statusEl.style.color = "#f87171";
            screenshotBtn.disabled = false;
            screenshotBtn.innerHTML = "<span>📸</span> Screenshot";
        }
    });

    // Handle Region Capture
    document.getElementById('regionBtn').addEventListener('click', async () => {
        const statusEl = document.getElementById('status');
        const regionBtn = document.getElementById('regionBtn');
        const project = document.getElementById('destinationSelect').value === 'global' ? '' : document.getElementById('projectSelect').value;

        regionBtn.disabled = true;
        regionBtn.textContent = "Select Area...";

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                // Pass project context to content script if needed, or just specific coordinates
                // Here we just trigger start.
                chrome.tabs.sendMessage(tabs[0].id, { action: "startRegionCapture", project: project }, (response) => {
                    if (chrome.runtime.lastError) {
                        statusEl.textContent = "Error: Refresh page first.";
                        statusEl.style.color = "#f87171";
                        regionBtn.disabled = false;
                        regionBtn.innerHTML = "<span>✂️</span> Capture Region";
                    } else {
                        window.close();
                    }
                });
            }
        });
    });
});
