/**
 * Database Seed Script
 * Run: npm run seed
 * Seeds job roles, industry trends, and sample MCQ test questions
 */
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const JobRole = require('../models/JobRole');
const IndustryTrend = require('../models/IndustryTrend');
const RoleTest = require('../models/RoleTest');

const seed = async () => {
    await connectDB();
    console.log('🌱 Starting seed...');

    // Clear existing data
    await JobRole.deleteMany({});
    await IndustryTrend.deleteMany({});
    await RoleTest.deleteMany({});

    // ── JOB ROLES ─────────────────────────────────────────────────────────────
    const roles = await JobRole.insertMany([
        {
            title: 'Full Stack Developer',
            description: 'Build complete web applications from frontend UI to backend API and database.',
            category: 'Software Engineering',
            requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST API', 'HTML', 'CSS', 'Git']
        },
        {
            title: 'Data Scientist',
            description: 'Analyze large datasets, build ML models, and derive actionable insights.',
            category: 'Data Science',
            requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'SQL', 'NLP', 'Deep Learning']
        },
        {
            title: 'DevOps Engineer',
            description: 'Automate infrastructure, manage CI/CD pipelines and cloud deployments.',
            category: 'DevOps',
            requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git', 'Linux', 'Terraform', 'Jenkins', 'Python']
        },
        {
            title: 'Frontend Developer',
            description: 'Build responsive, high-performance user interfaces using modern frameworks.',
            category: 'Software Engineering',
            requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue.js', 'Git', 'REST API', 'Figma']
        },
        {
            title: 'Backend Developer',
            description: 'Design and build scalable APIs, microservices, and database systems.',
            category: 'Software Engineering',
            requiredSkills: ['Node.js', 'Python', 'Java', 'Express.js', 'MongoDB', 'PostgreSQL', 'REST API', 'Docker', 'AWS']
        },
        {
            title: 'Machine Learning Engineer',
            description: 'Design, deploy and scale machine learning models in production.',
            category: 'AI/ML',
            requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Docker', 'AWS', 'Scikit-learn', 'NLP']
        }
    ]);
    console.log(`✅ Seeded ${roles.length} job roles`);

    // ── INDUSTRY TRENDS ───────────────────────────────────────────────────────
    await IndustryTrend.create({
        category: 'Tech Industry 2025',
        trendingSkills: [
            'React', 'TypeScript', 'Python', 'AWS', 'Docker', 'Kubernetes',
            'Machine Learning', 'Next.js', 'GraphQL', 'Rust', 'Node.js', 'CI/CD',
            'TensorFlow', 'PyTorch', 'Terraform', 'Go'
        ],
        highDemandRoles: ['Full Stack Developer', 'ML Engineer', 'DevOps Engineer', 'Cloud Architect']
    });
    console.log('✅ Seeded industry trends');

    // ── SKILL TESTS ───────────────────────────────────────────────────────────
    const fullStackRole = roles.find(r => r.title === 'Full Stack Developer');
    const dataSciRole = roles.find(r => r.title === 'Data Scientist');
    const devOpsRole = roles.find(r => r.title === 'DevOps Engineer');
    const frontendRole = roles.find(r => r.title === 'Frontend Developer');
    const backendRole = roles.find(r => r.title === 'Backend Developer');
    const mlRole = roles.find(r => r.title === 'Machine Learning Engineer');

    await RoleTest.create({
        jobRole: fullStackRole._id,
        questions: [
            { questionText: 'Which hook is used to manage state in React functional components?', options: ['useEffect', 'useState', 'useRef', 'useContext'], correctAnswer: 1, topic: 'React' },
            { questionText: 'What does REST stand for in REST API?', options: ['Remote Execution State Transfer', 'Representational State Transfer', 'Request Entity Support Type', 'Resource Entity Structure Type'], correctAnswer: 1, topic: 'API Design' },
            { questionText: 'Which MongoDB method finds a single document by ID?', options: ['findOne()', 'findById()', 'find()', 'findByPk()'], correctAnswer: 1, topic: 'MongoDB' },
            { questionText: 'What is the purpose of middleware in Express.js?', options: ['To serve static files', 'To connect to the database', 'To process requests between receiving and responding', 'To define the database schema'], correctAnswer: 2, topic: 'Node.js' },
            { questionText: 'Which of the following is a JavaScript superset that adds static typing?', options: ['CoffeeScript', 'Dart', 'TypeScript', 'Kotlin'], correctAnswer: 2, topic: 'JavaScript' },
            { questionText: 'In CSS, which property is used to create a flexible box layout?', options: ['grid', 'float', 'display: flex', 'position: relative'], correctAnswer: 2, topic: 'CSS' },
            { questionText: 'What is the main purpose of Git branches?', options: ['To backup files to the cloud', 'To work on features independently without affecting the main code', 'To deploy code to production', 'To run automated tests'], correctAnswer: 1, topic: 'Git' },
            { questionText: 'Which HTTP method is used to update an existing resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: 2, topic: 'API Design' },
            { questionText: 'What does async/await do in JavaScript?', options: ['Runs code synchronously in parallel', 'Handles asynchronous operations with cleaner syntax', 'Creates new threads', 'Prevents event loop blocking permanently'], correctAnswer: 1, topic: 'JavaScript' },
            { questionText: 'In MongoDB, what is the default name of the unique identifier field for schemas?', options: ['id', 'uuid', '_id', 'documentId'], correctAnswer: 2, topic: 'MongoDB' }
        ]
    });

    await RoleTest.create({
        jobRole: dataSciRole._id,
        questions: [
            { questionText: 'Which Python library is primarily used for data manipulation?', options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'], correctAnswer: 1, topic: 'Python Libraries' },
            { questionText: 'What does overfitting in machine learning mean?', options: ['The model performs well on all data', 'The model performs well on training data but poorly on unseen data', 'The model trains too slowly', 'The model has too few parameters'], correctAnswer: 1, topic: 'Machine Learning' },
            { questionText: 'Which algorithm is commonly used for classification problems?', options: ['Linear Regression', 'K-Means', 'Random Forest', 'PCA'], correctAnswer: 2, topic: 'Machine Learning' },
            { questionText: 'What is the purpose of train-test split in ML?', options: ['To speed up training', 'To evaluate model performance on unseen data', 'To clean the dataset', 'To balance classes'], correctAnswer: 1, topic: 'Machine Learning' },
            { questionText: 'Which neural network type is best suited for image recognition?', options: ['RNN', 'LSTM', 'CNN', 'GAN'], correctAnswer: 2, topic: 'Deep Learning' },
            { questionText: 'What does NLP stand for?', options: ['Natural Language Processing', 'Neural Layer Processing', 'Node Learning Protocol', 'Network Logic Programming'], correctAnswer: 0, topic: 'NLP' },
            { questionText: 'Which metric is used to evaluate classification models on imbalanced datasets?', options: ['Accuracy', 'Mean Squared Error', 'F1 Score', 'R-Squared'], correctAnswer: 2, topic: 'Machine Learning' },
            { questionText: 'What is the role of pandas DataFrame?', options: ['Neural network layer', '2D labeled data structure for data analysis', 'Database connector', 'Visualization tool'], correctAnswer: 1, topic: 'Python Libraries' },
            { questionText: 'Which technique is used to reduce dimensionality of data?', options: ['Normalization', 'One-hot encoding', 'PCA', 'Dropout'], correctAnswer: 2, topic: 'Machine Learning' },
            { questionText: 'What does the term "epoch" mean in deep learning?', options: ['A batch of training samples', 'One complete pass through the training dataset', 'A type of activation function', 'A neural network layer'], correctAnswer: 1, topic: 'Deep Learning' }
        ]
    });

    await RoleTest.create({
        jobRole: devOpsRole._id,
        questions: [
            { questionText: 'What is the primary purpose of Docker?', options: ['To compile code', 'To create, deploy, and run applications using containers', 'To manage user database', 'To design web interfaces'], correctAnswer: 1, topic: 'Docker' },
            { questionText: 'What does CI/CD stand for?', options: ['Code Integration/Code Development', 'Continuous Integration/Continuous Deployment', 'Connected Interfaces/Centralized Databases', 'Cloud Integration/Container Deployment'], correctAnswer: 1, topic: 'DevOps' },
            { questionText: 'Which tool is used for infrastructure as code (IaC)?', options: ['Jenkins', 'Terraform', 'Postman', 'Sentry'], correctAnswer: 1, topic: 'Terraform' },
            { questionText: 'What is Kubernetes primarily used for?', options: ['Writing code', 'Container orchestration', 'Version control', 'Designing databases'], correctAnswer: 1, topic: 'Kubernetes' },
            { questionText: 'In AWS, what does EC2 stand for?', options: ['Elastic Cloud Compute', 'Essential Cloud Cluster', 'Execution Center v2', 'Enterprise Cloud Console'], correctAnswer: 0, topic: 'AWS' },
            { questionText: 'Which file is used to define a Docker image?', options: ['docker.config', 'package.json', 'Dockerfile', 'image.yaml'], correctAnswer: 2, topic: 'Docker' },
            { questionText: 'What is Jenkins used for?', options: ['Automation of software development processes (CI/CD)', 'Graphics design', 'Database management', 'Style sheets'], correctAnswer: 0, topic: 'Jenkins' },
            { questionText: 'What is the purpose of Gits "pull" command?', options: ['To send changes to another branch', 'To fetch and merge changes from a remote repository', 'To delete a repository', 'To create a backup'], correctAnswer: 1, topic: 'Git' },
            { questionText: 'Which Linux command is used to change file permissions?', options: ['chmod', 'chown', 'pwd', 'mkdir'], correctAnswer: 0, topic: 'Linux' },
            { questionText: 'What is a load balancer used for?', options: ['To speed up coding', 'To distribute network traffic across multiple servers', 'To backup databases', 'To compile code faster'], correctAnswer: 1, topic: 'Infrastructure' }
        ]
    });

    await RoleTest.create({
        jobRole: frontendRole._id,
        questions: [
            { questionText: 'What is the purpose of Virtual DOM in React?', options: ['To directly manipulate the browser HTML', 'To improve performance by minimizing direct DOM updates', 'To store user session data', 'To handle database connections'], correctAnswer: 1, topic: 'React' },
            { questionText: 'Which CSS property is used to change the text color?', options: ['text-color', 'font-color', 'color', 'style-color'], correctAnswer: 2, topic: 'CSS' },
            { questionText: 'What does the "useCallback" hook do in React?', options: ['Creates a new component', 'Returns a memoized version of a callback function', 'Handles API requests', 'Manages state changes'], correctAnswer: 1, topic: 'React' },
            { questionText: 'What is TypeScript primarily used for?', options: ['Designing logos', 'Adding static types to JavaScript', 'Managing server-side databases', 'Writing documentation'], correctAnswer: 1, topic: 'TypeScript' },
            { questionText: 'Which HTML tag is used to link an external CSS file?', options: ['<css>', '<script>', '<link>', '<style>'], correctAnswer: 2, topic: 'HTML' },
            { questionText: 'What is the purpose of "props" in React?', options: ['To store local component state', 'To pass data from parent to child components', 'To define the route of the application', 'To connect to the backend'], correctAnswer: 1, topic: 'React' },
            { questionText: 'In CSS, what does "z-index" control?', options: ['Front-to-back sizing', 'Stacking order of elements', 'Zoom level', 'Horizontal alignment'], correctAnswer: 1, topic: 'CSS' },
            { questionText: 'What is a "Higher-Order Component" (HOC) in React?', options: ['A component rendered on the server', 'A function that takes a component and returns a new component', 'A component with many imports', 'The main component of an app'], correctAnswer: 1, topic: 'React' },
            { questionText: 'What is the purpose of "Flexbox"?', options: ['To create flexible 3D animations', 'To provide a efficient way to lay out, align, and distribute space', 'To store files locally', 'To manage user logins'], correctAnswer: 1, topic: 'CSS' },
            { questionText: 'Which tool is used for UI/UX design collaboration?', options: ['Postman', 'Figma', 'Terminal', 'Azure'], correctAnswer: 1, topic: 'Design' }
        ]
    });

    await RoleTest.create({
        jobRole: backendRole._id,
        questions: [
            { questionText: 'What is the purpose of a "Join" in SQL?', options: ['To connect to a server', 'To combine rows from two or more tables based on a related column', 'To delete duplicate records', 'To create a backup'], correctAnswer: 1, topic: 'SQL' },
            { questionText: 'Which Node.js module is used for handling file paths?', options: ['fs', 'url', 'path', 'http'], correctAnswer: 2, topic: 'Node.js' },
            { questionText: 'What is the purpose of "Hashing" passwords?', options: ['To compress data', 'To convert passwords into a fixed-length string for secure storage', 'To search for passwords faster', 'To design better databases'], correctAnswer: 1, topic: 'Security' },
            { questionText: 'Which HTTP status code represents "Internal Server Error"?', options: ['404', '200', '500', '403'], correctAnswer: 2, topic: 'API' },
            { questionText: 'What is the purpose of a "Schema" in Mongoose?', options: ['To define the structure of documents in a MongoDB collection', 'To write CSS styles', 'To handle routing', 'To manage API tokens'], correctAnswer: 0, topic: 'MongoDB' },
            { questionText: 'In a microservices architecture, what is a "Sidecar" pattern?', options: ['A way to design icons', 'A helper service that runs alongside the main service', 'A type of database indexing', 'A method for fast deployments'], correctAnswer: 1, topic: 'Microservices' },
            { questionText: 'What is the difference between "Authentication" and "Authorization"?', options: ['They are the same', 'Authn is identity; Authz is permissions', 'Authn is for users; Authz is for admins only', 'Authn is local; Authz is cloud'], correctAnswer: 1, topic: 'Security' },
            { questionText: 'Which protocol is used for real-time bi-directional communication?', options: ['HTTP', 'FTP', 'WebSockets', 'SMTP'], correctAnswer: 2, topic: 'Networking' },
            { questionText: 'What is a "Buffer" in Node.js?', options: ['A way to speed up the CPU', 'A class for handling binary data', 'A type of variable', 'A database plugin'], correctAnswer: 1, topic: 'Node.js' },
            { questionText: 'What does "Idempotency" mean in the context of REST APIs?', options: ['The request is very fast', 'Making multiple identical requests has the same effect as making a single request', 'The API is secure', 'The API returns JSON only'], correctAnswer: 1, topic: 'API Design' }
        ]
    });

    await RoleTest.create({
        jobRole: mlRole._id,
        questions: [
            { questionText: 'What is the purpose of an "Activation Function" in a neural network?', options: ['To initialize weights', 'To introduce non-linearity into the network', 'To clean the input data', 'To speed up training only'], correctAnswer: 1, topic: 'Neural Networks' },
            { questionText: 'Which library is developed by Google for machine learning?', options: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas'], correctAnswer: 1, topic: 'Libraries' },
            { questionText: 'What is "Reinforcement Learning"?', options: ['Training a model on labeled data', 'Learning from actions and rewards to achieve a goal', 'Grouping similar data points', 'Reducing dimensionality'], correctAnswer: 1, topic: 'Machine Learning' },
            { questionText: 'What is the purpose of "Dropout" in deep learning?', options: ['To remove outdated code', 'To prevent overfitting by randomly setting outgoing edges to zero during training', 'To increase the learning rate', 'To delete a dataset'], correctAnswer: 1, topic: 'Deep Learning' },
            { questionText: 'Which metric is used to evaluate the performance of a regression model?', options: ['Accuracy', 'Mean Squared Error (MSE)', 'F1 Score', 'Precision'], correctAnswer: 1, topic: 'ML Metrics' },
            { questionText: 'What is "One-Hot Encoding" used for?', options: ['To represent numerical data', 'To convert categorical data into numerical format', 'To compress images', 'To design better neural layers'], correctAnswer: 1, topic: 'Data Preprocessing' },
            { questionText: 'What is a "Gradient Descent"?', options: ['An optimization algorithm for finding the minimum of a function', 'A way to design charts', 'A type of neural network', 'A tool for cleaning data'], correctAnswer: 0, topic: 'ML Fundamentals' },
            { questionText: 'What is "Transfer Learning"?', options: ['Sharing code with other developers', 'Reusing a pre-trained model on a new related task', 'Encrypting data', 'Moving data between servers'], correctAnswer: 1, topic: 'Machine Learning' },
            { questionText: 'Which neural network layer is responsible for feature extraction from images?', options: ['Dense layer', 'Convolutional layer', 'Softmax layer', 'Input layer'], correctAnswer: 1, topic: 'CNN' },
            { questionText: 'What is the purpose of "Cross-Validation"?', options: ['To speed up the computer', 'To assess how the results of a statistical analysis will generalize to an independent dataset', 'To check for errors in code', 'To authorize users'], correctAnswer: 1, topic: 'Machine Learning' }
        ]
    });

    console.log('✅ Seeded 6 role tests (Full Stack, Data Scientist, DevOps, Frontend, Backend, ML)');
    console.log('🎉 Seed complete!');
    process.exit(0);
};

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
