
export async function sendTelegramMessage(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn("Telegram Token or Chat ID missing. Skipping notification.");
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        if (!data.ok) {
            console.error("Telegram Error:", data.description);
        }
        return data;
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
    }
}

export async function sendTelegramDocument(caption: string, buffer: Buffer, filename: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn("Telegram Token or Chat ID missing. Skipping document upload.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', caption);

        // Fix for Node/Edge environment Blob constructor
        const blob = new Blob([buffer as any], { type: 'application/pdf' });
        formData.append('document', blob, filename);

        const url = `https://api.telegram.org/bot${token}/sendDocument`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (!data.ok) {
            console.error("Telegram Document Error:", data.description);
        }
        return data;
    } catch (error) {
        console.error("Failed to send Telegram document:", error);
    }
}
