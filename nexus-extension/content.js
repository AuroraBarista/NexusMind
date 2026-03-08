// Listen for messages from Popup
let currentProject = "academic"; // Default

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startRegionCapture") {
        if (request.project) currentProject = request.project;
        createOverlay();
        sendResponse({ success: true });
    } else if (request.action === "cropImage") {
        // request.project comes back from background
        cropImage(request.dataUrl, request.area, request.title, request.url, request.project);
    }
});

let overlay = null;
let startX, startY, endX, endY;
let isDragging = false;
let selectionBox = null;

function createOverlay() {
    if (overlay) return; // Already exists

    // Create full screen overlay
    overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Slightly dark background
    overlay.style.zIndex = '999999';
    overlay.style.cursor = 'crosshair';
    overlay.style.userSelect = 'none';

    // Selection Box
    selectionBox = document.createElement('div');
    selectionBox.style.position = 'absolute';
    selectionBox.style.border = '2px solid #22d3ee'; // Cyan
    selectionBox.style.backgroundColor = 'rgba(34, 211, 238, 0.1)';
    selectionBox.style.display = 'none';
    overlay.appendChild(selectionBox);

    // Hints
    const hint = document.createElement('div');
    hint.textContent = "Drag to select area. Press ESC to cancel.";
    hint.style.position = 'absolute';
    hint.style.top = '20px';
    hint.style.left = '50%';
    hint.style.transform = 'translateX(-50%)';
    hint.style.color = 'white';
    hint.style.backgroundColor = 'rgba(0,0,0,0.7)';
    hint.style.padding = '8px 16px';
    hint.style.borderRadius = '20px';
    hint.style.fontFamily = 'sans-serif';
    hint.style.fontSize = '14px';
    hint.style.pointerEvents = 'none';
    overlay.appendChild(hint);

    document.body.appendChild(overlay);

    // Events
    overlay.addEventListener('mousedown', onMouseDown);
    overlay.addEventListener('mousemove', onMouseMove);
    overlay.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
}

function removeOverlay() {
    if (overlay) {
        overlay.remove();
        overlay = null;
        selectionBox = null;
        document.removeEventListener('keydown', onKeyDown);
    }
}

function onKeyDown(e) {
    if (e.key === 'Escape') {
        removeOverlay();
    }
}

function onMouseDown(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';
}

function onMouseMove(e) {
    if (!isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';

    endX = currentX;
    endY = currentY;
}

function onMouseUp(e) {
    isDragging = false;

    // Calculate final coordinates
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width < 10 || height < 10) {
        // Too small, just ignore or treat as cancel
        removeOverlay();
        return;
    }

    // Capture area
    const area = {
        x: left * window.devicePixelRatio,
        y: top * window.devicePixelRatio,
        width: width * window.devicePixelRatio,
        height: height * window.devicePixelRatio
    };

    // Get page title/url context before removing overlay
    const title = document.title;
    const url = window.location.href;

    removeOverlay();

    // Send to background to capture visible tab
    // We send the area we want cropped AND the project
    chrome.runtime.sendMessage({
        action: "captureRegion",
        area: area,
        title: title,
        url: url,
        project: currentProject
    });
}

function cropImage(fullDataUrl, area, title, url, project) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = area.width;
        canvas.height = area.height;

        ctx.drawImage(
            img,
            area.x, area.y, area.width, area.height, // Source
            0, 0, area.width, area.height            // Destination
        );

        const croppedDataUrl = canvas.toDataURL('image/png');

        // Send to API via Background as Content Scripts often have restricted network in some policies
        // But usually it's fine. Safer to send back to background for consistent API handling
        chrome.runtime.sendMessage({
            action: "uploadSnippet",
            data: {
                content: title + " (Region Capture)",
                url: url,
                image: croppedDataUrl,
                type: "image",
                project_anchor: project || "academic"
            }
        });
    };

    img.src = fullDataUrl;
}
