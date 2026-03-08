const API_URL = "http://localhost:3000/api/ext-capture";

// Create Context Menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "save-to-nexusmind",
        title: "Save to NexusMind",
        contexts: ["selection", "image", "link", "page"]
    });
});

// Handle Context Menu Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-to-nexusmind") {

        let content = "";
        let type = "text";
        let sourceUrl = info.pageUrl;

        if (info.selectionText) {
            content = info.selectionText;
            type = "text";
        } else if (info.srcUrl) {
            // Image or Media
            content = info.srcUrl;
            type = "image";
        } else if (info.linkUrl) {
            content = info.linkUrl;
            type = "link";
        } else {
            // Just the page
            content = tab.title;
            type = "link";
        }

        // Send to API
        fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: content,
                url: sourceUrl,
                type: type,
                project_anchor: "" // Default to Global Capture
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Saved to NexusMind!", data);
                } else {
                    console.error("Failed to save:", data.error);
                }
            })
            .catch(error => {
                console.error("Network error:", error);
            });
    }
});

// Handle Messages (Region Capture Coordination)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureRegion") {
        // CONTENT SCRIPT sent us the coordinates.
        // We capture the visible tab here in background
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            // Send the full image BACK to the content script (tab that sent request) to crop it
            chrome.tabs.sendMessage(sender.tab.id, {
                action: "cropImage",
                dataUrl: dataUrl,
                area: request.area,
                title: request.title,
                url: request.url,
                project: request.project // Pass it back
            });
        });
    }
    else if (request.action === "uploadSnippet") {
        // Content script finished cropping and wants us to upload
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request.data)
        })
            .then(res => res.json())
            .then(data => console.log("Region Upload Start:", data))
            .catch(err => console.error("Region Upload Error:", err));
    }
});
