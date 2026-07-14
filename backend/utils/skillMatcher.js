/**
 * Skill Matching Algorithm
 * Compares resume skills against a job role's required skills
 */

/**
 * Normalize a skill string for comparison
 */
const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9+#.]/g, '');

/**
 * Match extracted skills against a list of required skills
 * Returns matched skills, missing skills, and match percentage
 */
const matchSkills = (extractedSkills, requiredSkills) => {
    const normalizedExtracted = extractedSkills.map(normalize);
    const matched = [];
    const missing = [];

    for (const skill of requiredSkills) {
        const norm = normalize(skill);
        if (normalizedExtracted.some(s => s.includes(norm) || norm.includes(s))) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    }

    const matchPercent = requiredSkills.length > 0
        ? Math.round((matched.length / requiredSkills.length) * 100)
        : 0;

    return { matched, missing, matchPercent };
};

/**
 * Calculate overall resume score (0–100)
 * Based on skill match + resume length + structure
 */
const calculateResumeScore = (text, extractedSkills, allRolesSkills) => {
    let score = 0;

    // 1. Skill richness: up to 40 points
    const skillScore = Math.min(40, extractedSkills.length * 2);
    score += skillScore;

    // 2. Length/Content: up to 20 points (ideal: 300-1500 words)
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 300 && wordCount <= 1500) score += 20;
    else if (wordCount > 100) score += 10;

    // 3. Sections detected: up to 20 points
    const sections = ['education', 'experience', 'skills', 'projects', 'certifications', 'summary', 'objective'];
    const lowerText = text.toLowerCase();
    const sectionScore = sections.filter(s => lowerText.includes(s)).length * (20 / sections.length);
    score += Math.round(sectionScore);

    // 4. Action verbs: up to 10 points
    const actionVerbs = ['developed', 'built', 'implemented', 'designed', 'created', 'led', 'managed', 'optimized', 'deployed', 'architected'];
    const verbCount = actionVerbs.filter(v => lowerText.includes(v)).length;
    score += Math.min(10, verbCount * 2);

    // 5. Quantified achievements: up to 10 points
    const hasNumbers = /\d+%|\d+ (users|projects|clients|teams|million|k)/i.test(text);
    if (hasNumbers) score += 10;

    return Math.min(100, Math.round(score));
};

/**
 * Extract skills from raw text by matching against a master skills list
 */
const MASTER_SKILLS = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    // Web
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'HTML', 'CSS', 'REST API', 'GraphQL',
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'DynamoDB', 'SQLite',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'GitHub Actions',
    // Data Science / ML
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'NLP', 'Computer Vision',
    // Tools
    'Git', 'Linux', 'Agile', 'Scrum', 'Jira', 'Figma', 'Postman',
    // Soft Skills
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration'
];

const extractSkillsFromText = (text) => {
    const lowerText = text.toLowerCase();
    return MASTER_SKILLS.filter(skill => lowerText.includes(skill.toLowerCase()));
};

module.exports = { matchSkills, calculateResumeScore, extractSkillsFromText, MASTER_SKILLS };
