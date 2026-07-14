const PDFDocument = require('pdfkit');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const TestResult = require('../models/TestResult');
const { getUserRank } = require('../utils/rankingEngine');

// Helper to remove emojis and special characters that PDFKit can't handle
const cleanText = (text) => {
    if (!text) return '';
    // Removes emojis and other non-standard characters (keeps ASCII only)
    return text.toString().replace(/[^\x00-\x7F]/g, "").trim();
};

/**
 * GET /api/v1/pdf/report
 */
const generatePDFReport = async (req, res) => {
    try {
        const resume = await ResumeAnalysis.findOne({ userId: req.userId }).sort({ analysedAt: -1 });
        const testResult = await TestResult.findOne({ userId: req.userId }).sort({ takenAt: -1 }).populate('jobRole', 'title');
        const rankInfo = await getUserRank(req.userId);

        if (!resume) return res.status(404).json({ error: 'No resume analysis found. Please upload your resume first.' });

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="CareerReport_${Date.now()}.pdf"`);
        doc.pipe(res);

        const colors = {
            primary: '#1a1a2e',
            accent: '#6c63ff',
            text: '#2d3436',
            light: '#f5f5f5',
            success: '#00b894',
            warning: '#fdcb6e',
            danger: '#d63031'
        };

        // ── HEADER ──────────────────────────────────────────────────────────
        doc.rect(0, 0, doc.page.width, 100).fill(colors.primary);
        doc.fillColor('white')
            .fontSize(24).font('Helvetica-Bold').text('CAREER READINESS REPORT', 50, 30, { align: 'center' })
            .fontSize(11).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 50, 62, { align: 'center' });

        doc.fillColor(colors.text);
        let y = 120;

        const section = (title) => {
            y += 20; // Space before section
            if (y > doc.page.height - 150) { doc.addPage(); y = 50; }
            doc.fillColor(colors.accent).fontSize(13).font('Helvetica-Bold').text(cleanText(title), 50, y);
            y += 18; // Space after title text
            doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(colors.accent).lineWidth(1).stroke();
            y += 10; // Space after line
            doc.fillColor(colors.text).font('Helvetica').fontSize(10);
        };

        const row = (label, value, emphasize = false) => {
            if (y > doc.page.height - 50) { doc.addPage(); y = 50; }
            doc.font('Helvetica-Bold').fillColor(colors.text).text(`${cleanText(label)}:`, 60, y, { continued: true, width: 180 });
            doc.font('Helvetica').fillColor(emphasize ? colors.accent : colors.text).text(` ${cleanText(value)}`, { lineBreak: false });
            y += 20; // Increased row spacing
        };

        // ── RESUME SCORES ───────────────────────────────────────────────────
        section('Resume Analysis Scores');
        row('Resume Score', `${resume.resumeScore} / 100`, true);
        row('Industry Match', `${resume.industryMatchPercent}%`, true);
        row('Skills Detected', resume.extractedSkills.length.toString());
        row('Your Rank', rankInfo.rank ? `#${rankInfo.rank} of ${rankInfo.totalUsers} users` : 'N/A');
        row('Average Score', `${rankInfo.averageScore} / 100`);
        row('Top Score', `${rankInfo.topScore} / 100`);

        // ── TEST SCORES ─────────────────────────────────────────────────────
        if (testResult) {
            section('Skill Assessment Result');
            row('Role Tested', testResult.jobRole?.title || 'N/A', true);
            row('Test Score', `${testResult.testScore} / 10`);
            row('Test Percentage', `${testResult.testPercent}%`);
            row('Knowledge Level', testResult.knowledgeLevel, true);
            row('Career Readiness Score', `${testResult.careerReadinessScore} / 100`, true);
            if (testResult.weakAreas.length > 0) {
                row('Weak Areas', testResult.weakAreas.join(', '));
            }
        }

        // ── ROLE RECOMMENDATIONS ─────────────────────────────────────────────
        if (resume.recommendedRoles && resume.recommendedRoles.length > 0) {
            section('Role Recommendations');
            resume.recommendedRoles.forEach(r => {
                row(r.role, `${r.matchPercent}% match`, true);
            });
        }

        // ── SKILL GAP ────────────────────────────────────────────────────────
        if (resume.missingSkills && resume.missingSkills.length > 0) {
            section('Skill Gap Analysis');
            const skillsText = resume.missingSkills.join('  |  ');
            doc.font('Helvetica').fontSize(10).fillColor(colors.text).text(
                cleanText(skillsText), 60, y, { width: doc.page.width - 110, align: 'left' }
            );
            y = doc.y + 20;
        }

        // ── AI FEEDBACK ───────────────────────────────────────────────────────
        if (resume.aiFeedback && resume.aiFeedback.length > 0) {
            section('AI Resume Feedback');
            resume.aiFeedback.forEach(fb => {
                if (y > doc.page.height - 60) { doc.addPage(); y = 50; }
                doc.font('Helvetica').fontSize(10).fillColor(colors.text).text(`- ${cleanText(fb)}`, 60, y, { width: doc.page.width - 110 });
                y = doc.y + 10;
            });
        }

        // ── 30-DAY PLAN ───────────────────────────────────────────────────────
        if (resume.improvementPlan && resume.improvementPlan.length > 0) {
            section('30-Day Improvement Plan');
            resume.improvementPlan.forEach(week => {
                if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
                doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.accent).text(`Week ${week.week}: ${cleanText(week.title)}`, 60, y);
                y = doc.y + 8;
                week.tasks.forEach(task => {
                    if (y > doc.page.height - 50) { doc.addPage(); y = 50; }
                    doc.font('Helvetica').fontSize(10).fillColor(colors.text).text(`  * ${cleanText(task)}`, 70, y, { width: doc.page.width - 120 });
                    y = doc.y + 6;
                });
                y += 12;
            });
        }

        // ── FOOTER ───────────────────────────────────────────────────────────
        doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(colors.primary);
        doc.fillColor('white').fontSize(9).font('Helvetica')
            .text('Powered by HireVision AI | Career readiness through data intelligence', 50, doc.page.height - 35, { align: 'center' });

        doc.end();
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ error: 'PDF generation failed: ' + err.message });
    }
};

module.exports = { generatePDFReport };
