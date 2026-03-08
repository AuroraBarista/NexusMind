const { sendTelegramMessage } = require('./utils/telegram');
process.env.TELEGRAM_BOT_TOKEN = "TEST_TOKEN";
process.env.TELEGRAM_CHAT_ID = "TEST_ID";

console.log("Testing Telegram utility loading...");
if (typeof sendTelegramMessage === 'function') {
    console.log("Utility functions exported correctly.");
} else {
    console.error("Utility functions NOT found.");
}
