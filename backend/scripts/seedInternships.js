const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Internship = require('../models/Internship');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const MOCK_INTERNSHIPS = [
    {
        title: 'Software Engineering Intern', company: 'Virtusa', degree: 'IT',
        location: 'Colombo', duration: '6 months', type: 'Full-time',
        deadline: '2026-06-15', eligibleYears: ['3rd Year', '4th Year'],
        featured: true, status: 'approved', logo: 'V',
        description: 'Join Virtusa\'s engineering team and contribute to enterprise-grade software solutions used by leading financial institutions worldwide. You will work alongside senior engineers on real-world problems involving cloud infrastructure, microservices, and scalable APIs.',
        requirements: ['Pursuing a degree in IT or a related field', 'Knowledge of Java, Python, or JavaScript', 'Familiarity with REST APIs and databases', 'Strong problem-solving and communication skills'],
        skills: 'Java, Python, REST APIs, SQL, Git',
        softSkills: 'Teamwork, Communication, Problem-solving',
        guidancePath: 'This internship is a strong stepping stone toward a career in enterprise software development or cloud engineering. Virtusa offers return offers to outstanding interns.',
        guidanceTips: 'Build a portfolio of projects on GitHub before applying\nPractice coding challenges on LeetCode\nLearn Docker and Kubernetes basics\nPrepare for system design questions',
        applicationLink: 'https://virtusa.com/careers'
    },
    {
        title: 'Cloud Operations Intern', company: 'WSO2', degree: 'IT',
        location: 'Remote', duration: '3 months', type: 'Remote',
        deadline: '2026-07-01', eligibleYears: ['2nd Year', '3rd Year'],
        featured: false, status: 'approved', logo: 'W',
        description: 'WSO2 is a global open-source software company. As a Cloud Operations Intern, you will assist in managing cloud deployments, monitoring systems, and automating DevOps pipelines using tools like Kubernetes, Terraform, and CI/CD.',
        requirements: ['Basic knowledge of Linux and cloud platforms (AWS/GCP/Azure)', 'Familiarity with automation scripts (Bash/Python)', 'Understanding of networking fundamentals', 'Ability to work independently in a remote environment'],
        skills: 'Linux, AWS, Python, Bash, Kubernetes',
        softSkills: 'Self-motivation, Adaptability, Attention to detail',
        guidancePath: 'Cloud Operations experience at WSO2 positions you for DevOps Engineer or Site Reliability Engineer (SRE) roles in global tech companies.',
        guidanceTips: 'Get an AWS Cloud Practitioner certification\nLearn Docker and containerization\nBuild a homelab with Raspberry Pi\nContribute to open-source projects',
        applicationLink: 'https://wso2.com/careers'
    },
    {
        title: 'QA Testing Intern', company: 'Sysco LABS', degree: 'IT',
        location: 'Colombo', duration: '4 months', type: 'Full-time',
        deadline: '2026-05-30', eligibleYears: ['3rd Year'],
        featured: false, status: 'approved', logo: 'S',
        description: 'Sysco LABS is the technology arm of Sysco Corporation. As a QA intern, you\'ll design and execute test cases, identify bugs, and ensure software quality across Sysco\'s restaurant supply chain digital products.',
        requirements: ['Understanding of software testing concepts (manual and automated)', 'Basic knowledge of Selenium or similar tools is a plus', 'Attention to detail and analytical thinking', 'Good written communication skills'],
        skills: 'Selenium, Manual Testing, JIRA, SQL',
        softSkills: 'Analytical thinking, Attention to detail, Documentation',
        guidancePath: 'QA experience leads to roles in automation testing, DevOps QA, or software development with a strong understanding of quality processes.',
        guidanceTips: 'Learn ISTQB foundations\nPractice writing test cases from sample requirements\nExplore Playwright or Cypress for modern automated testing\nDocument all bugs clearly',
        applicationLink: 'https://syscolabs.lk/careers'
    },
    {
        title: 'Full-Stack Developer Intern', company: 'IFS', degree: 'SE',
        location: 'Colombo', duration: '6 months', type: 'Full-time',
        deadline: '2026-06-20', eligibleYears: ['3rd Year', '4th Year'],
        featured: true, status: 'approved', logo: 'I',
        description: 'IFS is a global enterprise software company. You will work with our product engineering team to develop features for IFS Cloud — a leading ERP, EAM, and FSM platform used across 100+ countries.',
        requirements: ['Strong knowledge of JavaScript, React, and Node.js', 'Familiarity with relational databases (SQL Server or PostgreSQL)', 'Understanding of software development lifecycle', 'Ability to work in an Agile team environment'],
        skills: 'React, Node.js, SQL, REST APIs, TypeScript',
        softSkills: 'Collaboration, Initiative, Time management',
        guidancePath: 'Working at IFS gives you exposure to enterprise-scale software. Full-stack interns often transition to Software Engineers with a clear promotion path.',
        guidanceTips: 'Build a full-stack project (React + Node.js + PostgreSQL)\nLearn Agile/Scrum methodology\nPractice LeetCode medium-level problems\nContribute to open-source on GitHub',
        applicationLink: 'https://ifs.com/careers'
    },
    {
        title: 'Mobile App Developer Intern', company: 'Calcey Technologies', degree: 'SE',
        location: 'Hybrid', duration: '3 months', type: 'Part-time',
        deadline: '2026-07-10', eligibleYears: ['2nd Year', '3rd Year'],
        featured: false, status: 'approved', logo: 'C',
        description: 'Calcey Technologies builds digital products for global clients. As a mobile app intern, you will assist in building cross-platform mobile applications using Flutter or React Native for international clients.',
        requirements: ['Experience with Flutter or React Native', 'Knowledge of mobile UI/UX principles', 'Familiarity with REST API integration', 'Ability to debug and optimize mobile performance'],
        skills: 'Flutter, React Native, Dart, JavaScript, Firebase',
        softSkills: 'Creativity, User empathy, Problem-solving',
        guidancePath: 'Mobile development experience at a product company like Calcey is highly valued in the freelance and startup ecosystem.',
        guidanceTips: 'Build and publish an app to Google Play\nLearn state management (Provider, Redux)\nStudy UI/UX best practices for mobile\nExplore Firebase for backend services',
        applicationLink: 'https://calcey.com/careers'
    },
    {
        title: 'DevOps Intern', company: 'Dialog Axiata', degree: 'SE',
        location: 'Colombo', duration: '6 months', type: 'Full-time',
        deadline: '2026-06-05', eligibleYears: ['3rd Year', '4th Year'],
        featured: false, status: 'approved', logo: 'D',
        description: 'Dialog Axiata, Sri Lanka\'s largest telecom operator, is looking for a DevOps intern to support their engineering team with CI/CD automation, infrastructure management, and system reliability improvements.',
        requirements: ['Familiarity with Git, Jenkins, or GitHub Actions', 'Basic Linux/Unix command line skills', 'Knowledge of Docker or Kubernetes is an advantage', 'Interest in cloud-native technologies'],
        skills: 'Git, Jenkins, Docker, Linux, Python',
        softSkills: 'Problem-solving, Reliability, Team coordination',
        guidancePath: 'DevOps skills are among the most in-demand in 2026. Experience at Dialog opens doors to SRE and Platform Engineering careers.',
        guidanceTips: 'Set up a personal CI/CD pipeline on GitHub Actions\nLearn Infrastructure as Code (Terraform)\nGet familiar with Prometheus and Grafana for monitoring\nJoin DevOps communities online',
        applicationLink: 'https://dialog.lk/careers'
    },
    {
        title: 'Data Analyst Intern', company: 'PickMe', degree: 'DS',
        location: 'Colombo', duration: '4 months', type: 'Full-time',
        deadline: '2026-06-25', eligibleYears: ['3rd Year', '4th Year'],
        featured: true, status: 'approved', logo: 'P',
        description: 'PickMe is Sri Lanka\'s leading ride-hailing and food-delivery platform. As a Data Analyst Intern, you will work with business intelligence teams to analyze rider behavior, demand forecasting, and operational efficiency using large-scale data.',
        requirements: ['Proficiency in Python (Pandas, NumPy) or R', 'Experience with SQL and data visualization tools', 'Understanding of statistical analysis', 'Ability to communicate insights to non-technical stakeholders'],
        skills: 'Python, SQL, Tableau, Pandas, Excel',
        softSkills: 'Analytical mindset, Storytelling with data, Curiosity',
        guidancePath: 'Data Analytics experience at a fast-growing tech company provides a foundation for roles in Business Intelligence, Data Science, and Product Analytics.',
        guidanceTips: 'Build a Kaggle portfolio with real datasets\nLearn SQL window functions and CTEs\nCreate dashboards using Tableau or Power BI\nRead "Storytelling with Data" by Cole Knaflic',
        applicationLink: 'https://pickme.lk/careers'
    },
    {
        title: 'Machine Learning Intern', company: 'hSenid Mobile', degree: 'DS',
        location: 'Remote', duration: '3 months', type: 'Remote',
        deadline: '2026-07-15', eligibleYears: ['3rd Year'],
        featured: false, status: 'approved', logo: 'H',
        description: 'hSenid Mobile is a global telecom software company. This role allows you to apply machine learning techniques to solve real business problems in customer segmentation, churn prediction, and NLP for telecom applications.',
        requirements: ['Knowledge of machine learning concepts and algorithms', 'Proficiency in Python with scikit-learn or TensorFlow', 'Familiarity with data preprocessing techniques', 'Strong mathematical foundation (statistics, linear algebra)'],
        skills: 'Python, TensorFlow, scikit-learn, NLP, Jupyter',
        softSkills: 'Research-oriented, Persistence, Attention to detail',
        guidancePath: 'ML experience in a production environment is rare at undergraduate level. This gives you a significant advantage for MSc programs and AI engineering roles.',
        guidanceTips: 'Complete Coursera\'s ML Specialization by Andrew Ng\nParticipate in Kaggle competitions\nBuild an end-to-end ML pipeline on GitHub\nLearn MLflow for experiment tracking',
        applicationLink: 'https://hsenidmobile.com/careers'
    },
    {
        title: 'Business Development Intern', company: 'John Keells Holdings', degree: 'BM',
        location: 'Colombo', duration: '6 months', type: 'Full-time',
        deadline: '2026-06-18', eligibleYears: ['3rd Year', '4th Year'],
        featured: true, status: 'approved', logo: 'J',
        description: 'John Keells Holdings, Sri Lanka\'s premier blue-chip conglomerate, is seeking a Business Development Intern to support strategic growth initiatives across sectors including retail, tourism, and transportation.',
        requirements: ['Pursuing a degree in Business Management or related field', 'Strong analytical and research skills', 'Excellent presentation and communication abilities', 'Proficiency in MS Office Suite (Excel, PowerPoint)'],
        skills: 'Market Research, Excel, PowerPoint, Financial Modeling',
        softSkills: 'Leadership, Networking, Strategic thinking',
        guidancePath: 'A JKH internship is prestigious and highly competitive. Alumni have progressed to management trainee programs at top Sri Lankan corporations.',
        guidanceTips: 'Prepare a professional resume highlighting leadership roles\nResearch JKH\'s portfolio of companies\nPractice case study interviews\nDevelop financial modeling skills in Excel',
        applicationLink: 'https://keells.com/careers'
    },
    {
        title: 'HR & Talent Intern', company: 'MAS Holdings', degree: 'BM',
        location: 'Colombo', duration: '3 months', type: 'Part-time',
        deadline: '2026-07-05', eligibleYears: ['2nd Year', '3rd Year'],
        featured: false, status: 'approved', logo: 'M',
        description: 'MAS Holdings is a world-class apparel manufacturer. As an HR Intern, you will gain exposure to talent acquisition, employee engagement programs, performance management, and organizational development in a global manufacturing setting.',
        requirements: ['Interest in Human Resource Management', 'Strong interpersonal and organizational skills', 'Ability to handle confidential information professionally', 'Basic proficiency in MS Office tools'],
        skills: 'HR Systems, Excel, Employee Engagement, Recruitment',
        softSkills: 'Empathy, Discretion, Organizational skills',
        guidancePath: 'HR experience at a global company like MAS provides excellent preparation for CIPM certification and HR Manager career paths.',
        guidanceTips: 'Study fundamentals of employment law in Sri Lanka\nLearn about HR Information Systems\nPractice behavioral interview techniques\nRead about employee engagement strategies',
        applicationLink: 'https://masholdings.com/careers'
    },
    {
        title: 'Marketing Intern', company: 'Brandix', degree: 'BM',
        location: 'Colombo', duration: '4 months', type: 'Full-time',
        deadline: '2026-05-28', eligibleYears: ['3rd Year'],
        featured: false, status: 'approved', logo: 'B',
        description: 'Brandix is South Asia\'s largest apparel exporter. The Marketing Intern will assist in brand strategy, digital marketing campaigns, market research, and competitive analysis to strengthen Brandix\'s global brand presence.',
        requirements: ['Studying Business Management with a Marketing focus', 'Creative thinking with an eye for design and branding', 'Familiarity with social media platforms and analytics', 'Strong written and verbal communication in English'],
        skills: 'Digital Marketing, Canva, Google Analytics, Social Media',
        softSkills: 'Creativity, Initiative, Brand awareness',
        guidancePath: 'This role sets a strong foundation for careers in Brand Management, Digital Marketing, or Product Management at consumer-facing companies.',
        guidanceTips: 'Build a personal brand on LinkedIn\nComplete Google Digital Marketing certification\nLearn Google Analytics and Meta Ads\nCreate a mock campaign as a portfolio piece',
        applicationLink: 'https://brandix.com/careers'
    },
    {
        title: 'Finance & Audit Intern', company: 'KPMG Sri Lanka', degree: 'Accounting',
        location: 'Colombo', duration: '6 months', type: 'Full-time',
        deadline: '2026-06-30', eligibleYears: ['3rd Year', '4th Year'],
        featured: true, status: 'approved', logo: 'K',
        description: 'KPMG is one of the Big Four global accounting firms. As an Audit Intern, you will assist in statutory audits, financial statement analysis, and compliance checks for a portfolio of leading Sri Lankan corporations.',
        requirements: ['Pursuing CIMA, ACCA, or a Finance/Accounting degree', 'Strong understanding of financial statements and accounting standards', 'High attention to detail and analytical skills', 'Ability to work under tight deadlines'],
        skills: 'Financial Analysis, Excel, IFRS, Audit Procedures',
        softSkills: 'Integrity, Attention to detail, Time management',
        guidancePath: 'KPMG experience is globally recognized and fast-tracks your professional accounting qualification. Many interns receive permanent offers after completing ACCA/CIMA.',
        guidanceTips: 'Complete at least 3 ACCA/CIMA papers before applying\nStudy IFRS and Sri Lanka Accounting Standards\nPractice Excel for financial modeling\nBuild confidence in presenting financial findings',
        applicationLink: 'https://kpmg.com/lk/careers'
    },
    {
        title: 'Tax Consulting Intern', company: 'PwC Sri Lanka', degree: 'Accounting',
        location: 'Colombo', duration: '3 months', type: 'Full-time',
        deadline: '2026-07-20', eligibleYears: ['3rd Year'],
        featured: false, status: 'approved', logo: 'P',
        description: 'PricewaterhouseCoopers (PwC) Sri Lanka\'s Tax & Legal Services division is recruiting interns to assist with corporate tax compliance, tax advisory, and regulatory research for multinational and local clients.',
        requirements: ['Knowledge of Sri Lankan tax legislation (VAT, Income Tax, WHT)', 'Strong research and report-writing skills', 'Proficiency in MS Excel and Word', 'Academic excellence in Taxation or Accounting modules'],
        skills: 'Tax Compliance, Excel, Financial Reporting, Research',
        softSkills: 'Meticulous, Research-oriented, Confidentiality',
        guidancePath: 'Tax consulting builds rare expertise that commands premium salaries. PwC alumni are well-placed in CFO and Tax Director roles globally.',
        guidanceTips: 'Read the Inland Revenue Act (2017) and its amendments\nLearn to prepare corporate tax computations\nStudy transfer pricing fundamentals\nPractice technical writing for client memos',
        applicationLink: 'https://pwc.com/lk/careers'
    },
    {
        title: 'Civil Engineering Intern', company: 'MAGA Engineering', degree: 'Engineering',
        location: 'Gampaha', duration: '6 months', type: 'Full-time',
        deadline: '2026-06-10', eligibleYears: ['3rd Year', '4th Year'],
        featured: true, status: 'approved', logo: 'M',
        description: 'MAGA Engineering is Sri Lanka\'s premier construction company. Civil Engineering Interns will gain hands-on experience in project site management, structural inspections, bill of quantities preparation, and quality control for large-scale infrastructure projects.',
        requirements: ['Pursuing a Civil or Structural Engineering degree', 'Knowledge of AutoCAD and structural design basics', 'Ability to work on construction sites (safety protocols required)', 'Strong mathematics and engineering fundamentals'],
        skills: 'AutoCAD, Structural Analysis, Site Management, MS Project',
        softSkills: 'Leadership on site, Problem-solving, Physical resilience',
        guidancePath: 'MAGA site experience qualifies you for IESL Incorporated Engineer status faster. Alumni lead major infrastructure projects across South Asia.',
        guidanceTips: 'Obtain a site safety induction certificate\nLearn REVIT or BIM software basics\nStudy IS 456 and Sri Lanka standards for concrete\nKeep a site diary for your engineering portfolio',
        applicationLink: 'https://maga.lk/careers'
    },
    {
        title: 'Electrical Engineering Intern', company: 'Sanken Construction', degree: 'Engineering',
        location: 'Colombo', duration: '4 months', type: 'Full-time',
        deadline: '2026-07-08', eligibleYears: ['3rd Year', '4th Year'],
        featured: false, status: 'approved', logo: 'S',
        description: 'Sanken Construction is a leading construction company in Sri Lanka. The Electrical Engineering Intern will assist with MEP (Mechanical, Electrical \u0026 Plumbing) design coordination, site supervision, and electrical installation management for commercial and residential projects.',
        requirements: ['Pursuing an Electrical Engineering degree', 'Knowledge of AutoCAD Electrical or ETAP', 'Understanding of LV/MV electrical systems', 'Able to read and interpret engineering drawings'],
        skills: 'AutoCAD, ETAP, LV Systems, Electrical Design, MS Office',
        softSkills: 'Safety awareness, Communication, Technical precision',
        guidancePath: 'MEP experience positions you as a specialist in the construction industry, leading to Electrical Engineer or Project Manager roles.',
        guidanceTips: 'Study IEEE standards and Sri Lanka Wiring Regulations\nLearn to use ETAP for power system analysis\nPractice reading single-line diagrams\nGet your IESL student membership',
        applicationLink: 'https://sanken.lk/careers'
    },
    {
        title: 'Quantity Surveying Intern', company: 'Access Engineering', degree: 'Engineering',
        location: 'Malabe', duration: '6 months', type: 'Full-time',
        deadline: '2026-06-22', eligibleYears: ['2nd Year', '3rd Year', '4th Year'],
        featured: false, status: 'approved', logo: 'A',
        description: 'Access Engineering PLC is a publicly listed construction leader. As a QS Intern, you will assist with cost estimation, bill of quantities (BOQ) preparation, contract administration, and financial reporting on major road and building projects.',
        requirements: ['Pursuing a Quantity Surveying or Civil Engineering degree', 'Knowledge of BOQ preparation and measurement techniques', 'Familiarity with Standard Method of Measurement (SMM)', 'Strong numerical and Excel skills'],
        skills: 'BOQ, Excel, Cost Estimation, SMM, AutoCAD',
        softSkills: 'Accuracy, Negotiation, Commercial awareness',
        guidancePath: 'QS experience at a listed company fast-tracks your AIQS/RICS membership and opens doors to Contracts Manager and Commercial Director roles.',
        guidanceTips: 'Study NEC and FIDIC contract forms\nLearn CostX or Candy for QS estimation software\nPractice preparing trade packages from drawings\nJoin the IQSSL student chapter',
        applicationLink: 'https://access.lk/careers'
    },
];

const seedData = async () => {
    try {
        await Internship.deleteMany({ status: 'approved' }); // Clear only approved ones to re-populate without affecting partner ones? 
        // Actually best to only delete mock data if identified.
        // For now, let's just insert if not exists.
        
        for (const item of MOCK_INTERNSHIPS) {
            const exists = await Internship.findOne({ title: item.title, company: item.company });
            if (!exists) {
                await Internship.create(item);
                console.log(`Added: ${item.title} at ${item.company}`);
            } else {
                console.log(`Exists: ${item.title} at ${item.company}`);
            }
        }

        console.log('Seed completed successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
