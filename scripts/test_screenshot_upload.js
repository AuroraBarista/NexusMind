// Mock a small red dot image (Base64 PNG)
// data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
const mockImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

async function testUpload() {
    try {
        console.log("Testing Screenshot Upload to API...");

        const response = await fetch("http://localhost:3000/api/ext-capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: "Test Screenshot Upload",
                url: "http://example.com/test",
                image: mockImageBase64,
                type: "image",
                project_anchor: "academic"
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log("✅ Upload Successful!");
            console.log("Snippet ID:", data.id);
        } else {
            console.error("❌ Upload Failed!");
            console.error("Status:", response.status);
            console.error("Error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ Network or Script Error:", error);
    }
}

testUpload();
