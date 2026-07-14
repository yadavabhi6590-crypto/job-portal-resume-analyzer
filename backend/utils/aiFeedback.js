/**
 * AI Resume Feedback Engine
 * Analyzes resume text and returns actionable feedback
 */

const generateAIFeedback = (text, extractedSkills, experienceLevel = 'Fresher') => {
    const feedback = [];
    const lowerText = text.toLowerCase();

    // 1. Check summary length
    const summaryMatch = text.match(/summary|objective/i);
    if (summaryMatch) {
        const summaryIndex = lowerText.indexOf(summaryMatch[0].toLowerCase());
        const summarySection = text.slice(summaryIndex, summaryIndex + 500);
        const wordCount = summarySection.split(/\s+/).filter(Boolean).length;
        if (wordCount < 50) {
            feedback.push('Your professional summary is too short (< 50 words). Expand it to highlight your key value proposition.');
        }
    } else {
        feedback.push('No Summary/Objective section detected. Add a compelling 2-3 sentence professional summary at the top.');
    }

    // 2. Check for measurable achievements
    const hasMetrics = /\d+%|\d+ (users|clients|projects|teams|million|k\b|revenue|months|years)/i.test(text);
    if (!hasMetrics) {
        if (experienceLevel === 'Experienced') {
            feedback.push('CRITICAL: No measurable achievements found. Experienced professionals must quantify results (e.g., "Increased revenue by 40%", "Led a 5-person team").');
        } else {
            feedback.push('Consider adding measurable achievements, even for academic projects (e.g., "Improved performance by 20%", "Collaborated with 4 students").');
        }
    }

    // 3. Check for weak phrases
    if (lowerText.includes('responsible for')) {
        feedback.push('Avoid weak phrases like "Responsible for". Replace with strong action verbs like "Led", "Built", "Implemented", "Delivered".');
    }
    if (lowerText.includes('helped with')) {
        feedback.push('Avoid vague phrases like "Helped with". Use specific verbs like "Contributed to", "Developed", "Engineered".');
    }
    if (lowerText.includes('worked on')) {
        feedback.push('Replace "Worked on" with specific action verbs like "Architected", "Implemented", or "Deployed".');
    }

    // 4. Check for action verbs
    const actionVerbs = ['developed', 'built', 'implemented', 'designed', 'created', 'led', 'managed', 'optimized', 'deployed', 'architected', 'launched', 'delivered', 'engineered'];
    const foundVerbs = actionVerbs.filter(v => lowerText.includes(v));
    if (foundVerbs.length < 3) {
        feedback.push(`Use more strong action verbs. Only ${foundVerbs.length} found. Add verbs like: Developed, Architected, Launched, Delivered, Optimized.`);
    }

    // 5. Skills section
    if (extractedSkills.length < 5) {
        feedback.push('Only a few technical skills were detected. Add a dedicated "Skills" section with your programming languages, frameworks, and tools.');
    }

    // 6. Contact info check
    if (!/@/.test(text)) {
        feedback.push('No email address detected. Ensure your contact information is clearly listed at the top of your resume.');
    }

    // 7. Experience Level Specific Checks
    if (experienceLevel === 'Experienced') {
        const hasLeadership = /led|managed|mentored|architected|directed/i.test(lowerText);
        if (!hasLeadership) {
            feedback.push('For experienced roles, highlight leadership or mentorship experience using verbs like "Led", "Mentored", or "Architected".');
        }
    } else {
        const hasEducation = /education|university|college|bachelor|degree|coursework/i.test(lowerText);
        if (!hasEducation) {
            feedback.push('As a fresher, ensure your Education section is prominent and includes relevant coursework or academic achievements.');
        }
        const hasProjects = /projects|portfolio/i.test(lowerText);
        if (!hasProjects) {
            feedback.push('Add a dedicated "Projects" section to showcase your practical skills through academic or personal projects.');
        }
    }

    // 8. Positive feedback
    if (feedback.length === 0) {
        feedback.push('Great resume! It is well-structured with strong action verbs and measurable achievements.');
    } else {
        feedback.push('Address the points above to improve your resume score and increase your chances of ATS success.');
    }

    return feedback;
};

module.exports = { generateAIFeedback };
