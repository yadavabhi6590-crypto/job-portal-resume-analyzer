/**
 * Role Recommendation Logic
 * Recommends top 2 job roles based on skill match
 */
const { matchSkills } = require('./skillMatcher');

const recommendRoles = (extractedSkills, jobRoles, experienceLevel = 'Fresher') => {
    let roleScores = jobRoles.map(role => {
        const { matchPercent } = matchSkills(extractedSkills, role.requiredSkills);
        let adjustedMatchPercent = matchPercent;

        // Basic heuristic: penalize or boost match percent based on title keywords and experience level
        const titleLower = role.title.toLowerCase();
        const isSeniorRole = titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('manager') || titleLower.includes('principal') || titleLower.includes('architect');
        const isJuniorRole = titleLower.includes('junior') || titleLower.includes('trainee') || titleLower.includes('associate') || titleLower.includes('intern');

        if (experienceLevel === 'Fresher') {
            if (isSeniorRole) adjustedMatchPercent *= 0.7; // Penalize senior roles for freshers
            if (isJuniorRole) adjustedMatchPercent *= 1.2; // Boost entry level roles
        } else if (experienceLevel === 'Experienced') {
            if (isJuniorRole) adjustedMatchPercent *= 0.7; // Penalize junior roles for experienced
            if (isSeniorRole) adjustedMatchPercent *= 1.2; // Boost senior roles for experienced
        }

        return { role: role.title, matchPercent: Math.min(Math.round(adjustedMatchPercent), 100) }; // Cap at 100
    });

    roleScores.sort((a, b) => b.matchPercent - a.matchPercent);
    return roleScores.slice(0, 2);
};

module.exports = { recommendRoles };
