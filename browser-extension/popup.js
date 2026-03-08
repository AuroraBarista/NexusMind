
document.addEventListener('DOMContentLoaded', () => {
    const capturePageBtn = document.getElementById('capture-page');
    const captureSelectionBtn = document.getElementById('capture-selection');
    const noteInput = document.getElementById('note-input');
    const sendBtn = document.getElementById('send-btn');
    const statusMsg = document.getElementById('status-msg');

    let captureType = 'note';
    let captureData = null;

    const destSelect = document.getElementById('destinationSelect');
    const projWrapper = document.getElementById('projectWrapper');
    const projSelect = document.getElementById('projectSelect');

    // Handle Destination Toggle
    destSelect.addEventListener('change', (e) => {
        projWrapper.style.display = e.target.value === 'project' ? 'block' : 'none';
    });

    // Fetch Projects on Load
    fetch('http://localhost:3000/api/get-projects')
        .then(res => res.json())
        .then(data => {
            projSelect.innerHTML = ''; // Clear loading
            if (data.projects && data.projects.length > 0) {
                data.projects.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.name;
                    opt.textContent = p.name;
                    opt.style.background = '#030014'; // match theme
                    projSelect.appendChild(opt);
                });
            } else {
                const opt = document.createElement('option');
                opt.value = "";
                opt.textContent = "No projects found";
                opt.style.background = '#030014';
                projSelect.appendChild(opt);
            }
        })
        .catch(err => {
            console.error("Failed to load projects", err);
            projSelect.innerHTML = '<option value="">Offline</option>';
        });

    // Reset button states
    function resetBtns() {
        capturePageBtn.classList.remove('active');
        captureSelectionBtn.classList.remove('active');
        captureType = 'note';
        captureData = null;
    }

    capturePageBtn.addEventListener('click', async () => {
        resetBtns();
        capturePageBtn.classList.add('active');
        captureType = 'page';

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        captureData = {
            url: tab.url,
            title: tab.title
        };
        noteInput.focus();
    });

    captureSelectionBtn.addEventListener('click', async () => {
        resetBtns();
        captureSelectionBtn.classList.add('active');
        captureType = 'selection';

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        try {
            const [{ result }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.getSelection().toString()
            });

            if (result) {
                captureData = {
                    title: tab.title,
                    content: result
                };
                noteInput.value = `"${result}"`; // Preview
            } else {
                statusMsg.innerText = "No selection found.";
                statusMsg.classList.remove('hidden');
            }
        } catch (e) {
            console.error(e);
        }
    });

    sendBtn.addEventListener('click', async () => {
        const note = noteInput.value;
        statusMsg.innerText = "Transmitting to Nexus...";
        statusMsg.classList.remove('hidden');

        const project = destSelect.value === 'global' ? '' : projSelect.value;

        const payload = {
            type: captureType,
            content: note,
            project_anchor: project, // Pass the project
            ...captureData
        };

        try {
            const response = await fetch('http://localhost:3000/api/extension-capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                statusMsg.innerText = "Data Uplink Successful.";
                setTimeout(() => window.close(), 1000);
            } else {
                statusMsg.innerText = "Error: Connection Failed.";
            }
        } catch (e) {
            console.error("Extension Error:", e);
            statusMsg.innerText = "Error: " + e.message;
        }
    });
});
