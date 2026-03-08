import { Resend } from 'resend';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { NextResponse } from 'next/server';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : { emails: { send: async () => ({ error: "Resend API Key missing" }) } } as any;

export async function POST(req: Request) {
    try {
        const { summary, email } = await req.json();

        if (!summary || !email) {
            return NextResponse.json({ error: "Missing summary data or email" }, { status: 400 });
        }

        // 1. Generate PDF
        const doc = new jsPDF() as any;
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();

        // Helper for colors (Nexus Branding)
        const BLACK = [0, 0, 0];
        const GRAY = [100, 100, 100];
        const LIGHT_GRAY = [245, 245, 247];

        // --- BACKGROUND / BORDER ---
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(10, 10, width - 10, 10); // Top line

        // --- HEADER ---
        doc.setFontSize(28);
        doc.setFont("serif", "bold");
        doc.setTextColor(...BLACK);
        doc.text("NEXUS", 20, 30);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("INTELLIGENCE REPORT", 20, 38);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(`VOL. ${new Date().getFullYear()}.${new Date().getMonth() + 1} | REF: 8821`, width - 20, 30, { align: "right" });
        doc.text(`GENERATED: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, width - 20, 35, { align: "right" });

        doc.setDrawColor(200);
        doc.line(20, 45, width - 20, 45); // Divider

        let currentY = 60;

        // --- THE PULSE ---
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BLACK);
        doc.text("NEURAL PULSE", 20, currentY);
        currentY += 8;

        doc.setFontSize(14);
        doc.setFont("serif", "italic");
        const pulseText = `"${summary.summary_content.quantitative_pulse.insight}"`;
        const pulseLines = doc.splitTextToSize(pulseText, width - 40);
        doc.text(pulseLines, 20, currentY);
        currentY += (pulseLines.length * 8) + 15;

        // --- PRIORITY INTELLIGENCE ---
        if (summary.summary_content.intelligence_priority && summary.summary_content.intelligence_priority.length > 0) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("PRIORITY SIGNALS", 20, currentY);
            currentY += 10;

            summary.summary_content.intelligence_priority.forEach((p: any) => {
                // Background for tag
                doc.setFillColor(...LIGHT_GRAY);
                const tagWidth = doc.getTextWidth(p.tag) + 4;
                doc.rect(20, currentY - 4, tagWidth, 6, 'F');

                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...BLACK);
                doc.text(p.tag, 22, currentY);

                currentY += 8;
                doc.setFontSize(13);
                doc.setFont("serif", "bold");
                doc.text(p.title, 20, currentY);

                currentY += 6;
                doc.setFontSize(10);
                doc.setFont("serif", "normal");
                doc.setTextColor(...GRAY);
                const valLines = doc.splitTextToSize(p.value, width - 40);
                doc.text(valLines, 20, currentY);

                currentY += (valLines.length * 5) + 10;

                // Check for page break
                if (currentY > height - 40) {
                    doc.addPage();
                    currentY = 20;
                }
            });
        }

        // --- HIGH-VALUE CURATION ---
        if (currentY > height - 60) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BLACK);
        doc.text("KNOWLEDGE CURATION", 20, currentY);
        currentY += 5;

        const tableData = summary.summary_content.curated_top_10.map((item: any) => [
            item.rank,
            item.title,
            item.core_insight,
            item.tag
        ]);

        doc.autoTable({
            startY: currentY,
            head: [['#', 'Signal Headline', 'Core Intelligence', 'Domain']],
            body: tableData,
            theme: 'plain',
            headStyles: {
                fillColor: BLACK,
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                cellPadding: 4
            },
            bodyStyles: {
                fontSize: 9,
                font: 'serif',
                cellPadding: 4
            },
            alternateRowStyles: { fillColor: LIGHT_GRAY },
            margin: { left: 20, right: 20 },
            styles: { overflow: 'linebreak', cellWidth: 'wrap' },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 40 },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 30 }
            }
        });

        // --- FOOTER (On last page) ---
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...GRAY);
        doc.text("NexusMind | The Second Brain Curator", 105, height - 15, { align: "center" });

        // Convert PDF to Buffer
        const pdfOutput = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfOutput);

        // 2. Send Email
        console.log("Attempting to send email via Resend to:", email);
        const { data, error } = await resend.emails.send({
            from: 'NexusMind <onboarding@resend.dev>',
            to: email,
            subject: `Nexus Intelligence Report | ${new Date().toLocaleDateString()}`,
            text: `Your Nexus Intelligence Report is attached. \n\nInsight: ${summary.summary_content.quantitative_pulse.insight}\n\nGenerated by NexusMind.`,
            attachments: [
                {
                    filename: `Nexus_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        if (error) {
            console.error("Resend Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (e: any) {
        console.error("PDF/Email Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
