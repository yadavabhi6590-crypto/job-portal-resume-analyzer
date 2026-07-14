/**
 * 30-Day Dynamic Improvement Plan Generator
 * Generates a weekly roadmap based on missing/weak skills
 */

const SKILL_RESOURCES = {
    default: ['Read documentation', 'Build a small project', 'Practice on LeetCode/HackerRank', 'Take an online course (Udemy/Coursera)'],
    'JavaScript': ['Complete javascript.info', 'Build a To-Do app', 'Practice ES6+ features', 'Solve 5 JS challenges on HackerRank'],
    'Python': ['Complete Python Crash Course on Coursera', 'Build a CLI tool', 'Explore Python standard libraries'],
    'React': ['Complete React docs (react.dev)', 'Build a weather/todo app', 'Explore hooks deeply', 'Deploy on Vercel'],
    'Node.js': ['Build a REST API from scratch', 'Learn Express.js routing', 'Study middleware patterns'],
    'MongoDB': ['MongoDB University free courses', 'Design and implement schemas', 'Practice aggregation pipelines'],
    'Docker': ['Docker official tutorial', 'Containerize a Node.js app', 'Learn docker-compose'],
    'AWS': ['AWS Free Tier exploration', 'Deploy app on EC2 or Lambda', 'Study S3 and IAM basics'],
    'Machine Learning': ['Andrew Ng ML course on Coursera', 'Implement linear regression from scratch', 'Kaggle beginner competitions'],
};

const generateImprovementPlan = (missingSkills, experienceLevel = 'Fresher') => {
    const skillsToLearn = missingSkills.slice(0, 8); // top 8 missing skills for 4 weeks
    const plan = [];

    const fresherWeeks = [
        { week: 1, title: 'Foundation Week - Core Concepts' },
        { week: 2, title: 'Deep Dive Week - Hands-on Practice' },
        { week: 3, title: 'Project Week - Build & Apply' },
        { week: 4, title: 'Polish Week - Review, Optimize & Deploy' },
    ];

    const experiencedWeeks = [
        { week: 1, title: 'Architecture & Patterns Week' },
        { week: 2, title: 'Advanced Implementation & Best Practices' },
        { week: 3, title: 'Performance, Scaling & Security' },
        { week: 4, title: 'Leadership & Strategic Impact' },
    ];

    const weeks = experienceLevel === 'Experienced' ? experiencedWeeks : fresherWeeks;

    for (let i = 0; i < 4; i++) {
        const skillsThisWeek = skillsToLearn.slice(i * 2, i * 2 + 2);
        const tasks = [];

        for (const skill of skillsThisWeek) {
            const resources = SKILL_RESOURCES[skill] || SKILL_RESOURCES.default;
            if (experienceLevel === 'Experienced') {
                tasks.push(`Master ${skill}: Focus on system design, architecture, and advanced use cases.`);
            } else {
                tasks.push(`Learn ${skill}: ${resources[i % resources.length]}`);
            }
        }

        if (tasks.length === 0) {
            tasks.push('Review all previously learned skills and refine your resume');
        }

        plan.push({ ...weeks[i], tasks });
    }

    return plan;
};

module.exports = { generateImprovementPlan };
