const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const doc = new jsPDF();
const summary = {
    summary_content: {
        quantitative_pulse: { insight: "Test Insight" },
        intelligence_priority: [{ tag: "TEST", title: "Test Title", value: "Test Value" }],
        curated_top_10: [{ rank: 1, title: "Test Signal", core_insight: "Test Core", tag: "TEST" }]
    }
};

try {
    const width = doc.internal.pageSize.getWidth();
    doc.text("Test PDF", 20, 20);
    const pdfOutput = doc.output('arraybuffer');
    console.log("PDF Generation Success. Buffer length:", pdfOutput.byteLength);
} catch (e) {
    console.error("PDF Generation Failed:", e);
}
