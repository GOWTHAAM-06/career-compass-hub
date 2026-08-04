import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import "./SkillGapPage.css";

// Curated learning resources for common missing skills
const LEARNING_RESOURCES = {
  python: {
    docs: "https://docs.python.org/3/tutorial/",
    course: "Python for Everybody (Coursera)",
    topics: ["Syntax & Data Types", "Functions & Modules", "OOP", "File I/O"],
    project: "Build a CLI task manager or web scraper",
  },
  javascript: {
    docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    course: "The Complete JavaScript Guide (Udemy)",
    topics: ["ES6+ Syntax", "Async/Await", "DOM Manipulation", "Closures"],
    project: "Build an interactive to-do app or browser extension",
  },
  typescript: {
    docs: "https://www.typescriptlang.org/docs/",
    course: "Understanding TypeScript (Udemy)",
    topics: ["Type Annotations", "Interfaces", "Generics", "Type Narrowing"],
    project: "Convert a JS project to TypeScript",
  },
  react: {
    docs: "https://react.dev/learn",
    course: "React - The Complete Guide (Udemy)",
    topics: ["Components & Props", "Hooks", "State Management", "Routing"],
    project: "Build a portfolio site or dashboard UI",
  },
  "node.js": {
    docs: "https://nodejs.org/en/docs",
    course: "Node.js, Express, MongoDB (freeCodeCamp)",
    topics: ["Event Loop", "Express Routing", "Middleware", "REST APIs"],
    project: "Build a REST API with Express",
  },
  express: {
    docs: "https://expressjs.com/",
    course: "Node.js and Express (freeCodeCamp)",
    topics: ["Routing", "Middleware", "Error Handling", "Authentication"],
    project: "Build a REST API with JWT auth",
  },
  django: {
    docs: "https://docs.djangoproject.com/",
    course: "Django for Beginners (William Vincent)",
    topics: ["Models & ORM", "Views & Templates", "Admin", "Authentication"],
    project: "Build a blog or CRUD web app",
  },
  flask: {
    docs: "https://flask.palletsprojects.com/",
    course: "Flask Tutorial (Flask Mega-Tutorial)",
    topics: ["Routes", "Templates", "Forms", "Databases"],
    project: "Build a microservice or API",
  },
  fastapi: {
    docs: "https://fastapi.tiangolo.com/",
    course: "FastAPI Course (freeCodeCamp)",
    topics: ["Path Operations", "Pydantic Models", "Dependency Injection", "Async"],
    project: "Build a high-performance API",
  },
  sql: {
    docs: "https://www.w3schools.com/sql/",
    course: "SQL for Data Science (Coursera)",
    topics: ["SELECT Queries", "Joins", "Aggregations", "Subqueries"],
    project: "Analyze a public dataset with SQL",
  },
  postgresql: {
    docs: "https://www.postgresql.org/docs/",
    course: "PostgreSQL Bootcamp (Udemy)",
    topics: ["Tables & Constraints", "Indexes", "Transactions", "Window Functions"],
    project: "Design a normalized database schema",
  },
  mysql: {
    docs: "https://dev.mysql.com/doc/",
    course: "MySQL for Beginners (Udemy)",
    topics: ["CRUD Operations", "Joins", "Indexing", "Stored Procedures"],
    project: "Build a database for an e-commerce app",
  },
  mongodb: {
    docs: "https://www.mongodb.com/docs/",
    course: "MongoDB University (M001)",
    topics: ["Documents & Collections", "CRUD", "Aggregation Pipeline", "Indexes"],
    project: "Build a NoSQL-backed API",
  },
  docker: {
    docs: "https://docs.docker.com/",
    course: "Docker Mastery (Udemy)",
    topics: ["Images & Containers", "Dockerfile", "Compose", "Volumes"],
    project: "Containerize a web app with Docker Compose",
  },
  kubernetes: {
    docs: "https://kubernetes.io/docs/",
    course: "Kubernetes for Beginners (KodeKloud)",
    topics: ["Pods & Deployments", "Services", "ConfigMaps", "Helm"],
    project: "Deploy a microservice to a local k8s cluster",
  },
  aws: {
    docs: "https://docs.aws.amazon.com/",
    course: "AWS Certified Solutions Architect (Udemy)",
    topics: ["EC2", "S3", "Lambda", "IAM"],
    project: "Deploy a serverless app with Lambda + S3",
  },
  azure: {
    docs: "https://learn.microsoft.com/azure/",
    course: "AZ-900 Azure Fundamentals (Microsoft Learn)",
    topics: ["Azure Functions", "App Service", "Blob Storage", "AKS"],
    project: "Deploy a web app to Azure App Service",
  },
  gcp: {
    docs: "https://cloud.google.com/docs",
    course: "Google Cloud Digital Leader (Coursera)",
    topics: ["Compute Engine", "Cloud Storage", "BigQuery", "Cloud Functions"],
    project: "Build a data pipeline with BigQuery",
  },
  git: {
    docs: "https://git-scm.com/doc",
    course: "Git & GitHub Crash Course (freeCodeCamp)",
    topics: ["Branches", "Merging", "Rebasing", "Pull Requests"],
    project: "Contribute to an open-source project",
  },
  github: {
    docs: "https://docs.github.com/",
    course: "GitHub Actions (GitHub Docs)",
    topics: ["Repositories", "Actions", "Pages", "Projects"],
    project: "Set up CI/CD with GitHub Actions",
  },
  "machine learning": {
    docs: "https://scikit-learn.org/stable/",
    course: "Machine Learning Specialization (Andrew Ng, Coursera)",
    topics: ["Supervised Learning", "Model Evaluation", "Feature Engineering", "Overfitting"],
    project: "Build a classification model on a real dataset",
  },
  "deep learning": {
    docs: "https://www.tensorflow.org/tutorials",
    course: "Deep Learning Specialization (Andrew Ng, Coursera)",
    topics: ["Neural Networks", "CNNs", "RNNs", "Transfer Learning"],
    project: "Train an image classifier with PyTorch",
  },
  tensorflow: {
    docs: "https://www.tensorflow.org/learn",
    course: "TensorFlow Developer Certificate (Coursera)",
    topics: ["Keras API", "Models", "Training", "Serving"],
    project: "Build and deploy a TF model",
  },
  pytorch: {
    docs: "https://pytorch.org/tutorials/",
    course: "PyTorch for Deep Learning (freeCodeCamp)",
    topics: ["Tensors", "Autograd", "Neural Networks", "Training Loops"],
    project: "Train a CNN on CIFAR-10",
  },
  pandas: {
    docs: "https://pandas.pydata.org/docs/",
    course: "Pandas for Data Science (Kaggle)",
    topics: ["DataFrames", "Filtering", "GroupBy", "Merging"],
    project: "Analyze a Kaggle dataset with pandas",
  },
  numpy: {
    docs: "https://numpy.org/doc/",
    course: "NumPy Tutorial (freeCodeCamp)",
    topics: ["Arrays", "Broadcasting", "Vectorization", "Linear Algebra"],
    project: "Implement matrix operations from scratch",
  },
  "scikit-learn": {
    docs: "https://scikit-learn.org/stable/",
    course: "Machine Learning with scikit-learn (Kaggle)",
    topics: ["Pipelines", "Cross-Validation", "Classification", "Regression"],
    project: "Build an ML pipeline for a tabular dataset",
  },
  tableau: {
    docs: "https://www.tableau.com/learn",
    course: "Tableau for Beginners (Udemy)",
    topics: ["Dashboards", "Calculations", "Filters", "Storytelling"],
    project: "Create an interactive sales dashboard",
  },
  "power bi": {
    docs: "https://learn.microsoft.com/power-bi/",
    course: "Power BI for Beginners (Microsoft Learn)",
    topics: ["Data Modeling", "DAX", "Visualizations", "Reports"],
    project: "Build a business intelligence report",
  },
  excel: {
    docs: "https://support.microsoft.com/excel",
    course: "Excel Skills for Business (Coursera)",
    topics: ["Formulas", "Pivot Tables", "Charts", "Data Analysis"],
    project: "Build a financial model in Excel",
  },
  linux: {
    docs: "https://linuxjourney.com/",
    course: "Linux Command Line (freeCodeCamp)",
    topics: ["File System", "Permissions", "Processes", "Shell Scripting"],
    project: "Automate tasks with bash scripts",
  },
  bash: {
    docs: "https://www.gnu.org/software/bash/manual/",
    course: "Bash Scripting (freeCodeCamp)",
    topics: ["Variables", "Loops", "Functions", "Pipelines"],
    project: "Write a deployment automation script",
  },
  java: {
    docs: "https://docs.oracle.com/en/java/",
    course: "Java Programming Masterclass (Udemy)",
    topics: ["OOP", "Collections", "Streams", "Concurrency"],
    project: "Build a Spring Boot REST API",
  },
  spring: {
    docs: "https://spring.io/guides",
    course: "Spring Boot Tutorial (freeCodeCamp)",
    topics: ["Dependency Injection", "REST Controllers", "JPA", "Security"],
    project: "Build a CRUD API with Spring Boot",
  },
  "spring boot": {
    docs: "https://spring.io/projects/spring-boot",
    course: "Spring Boot for Beginners (Udemy)",
    topics: ["Auto-Configuration", "REST APIs", "Data JPA", "Actuator"],
    project: "Build a production-ready REST service",
  },
  c: {
    docs: "https://en.cppreference.com/w/c",
    course: "C Programming (freeCodeCamp)",
    topics: ["Pointers", "Memory Management", "Structs", "File I/O"],
    project: "Implement a data structure library",
  },
  "c++": {
    docs: "https://en.cppreference.com/w/",
    course: "C++ for Beginners (freeCodeCamp)",
    topics: ["Classes", "STL", "Smart Pointers", "Templates"],
    project: "Build a game or system utility",
  },
  "c#": {
    docs: "https://learn.microsoft.com/dotnet/csharp/",
    course: "C# for Beginners (Microsoft Learn)",
    topics: ["OOP", "LINQ", "Async/Await", "ASP.NET Core"],
    project: "Build a .NET web API",
  },
  go: {
    docs: "https://go.dev/doc/",
    course: "Go: The Complete Developer's Guide (Udemy)",
    topics: ["Goroutines", "Channels", "Interfaces", "HTTP Servers"],
    project: "Build a concurrent web service",
  },
  rust: {
    docs: "https://doc.rust-lang.org/book/",
    course: "Rust Programming (freeCodeCamp)",
    topics: ["Ownership", "Borrowing", "Traits", "Error Handling"],
    project: "Build a CLI tool in Rust",
  },
  php: {
    docs: "https://www.php.net/docs.php",
    course: "PHP for Beginners (Laracasts)",
    topics: ["Syntax", "OOP", "PDO", "Composer"],
    project: "Build a CRUD web app with Laravel",
  },
  laravel: {
    docs: "https://laravel.com/docs",
    course: "Laravel 11 (Laracasts)",
    topics: ["Routing", "Eloquent ORM", "Blade", "Authentication"],
    project: "Build a full-stack Laravel app",
  },
  ruby: {
    docs: "https://www.ruby-lang.org/en/documentation/",
    course: "Ruby Programming (freeCodeCamp)",
    topics: ["Syntax", "OOP", "Blocks", "Gems"],
    project: "Build a Ruby script or Rails app",
  },
  rails: {
    docs: "https://guides.rubyonrails.org/",
    course: "Ruby on Rails Tutorial (Michael Hartl)",
    topics: ["MVC", "ActiveRecord", "Migrations", "Testing"],
    project: "Build a Rails blog or marketplace",
  },
  swift: {
    docs: "https://developer.apple.com/documentation/swift",
    course: "iOS Development (Stanford CS193p)",
    topics: ["SwiftUI", "UIKit", "Auto Layout", "Networking"],
    project: "Build an iOS app",
  },
  kotlin: {
    docs: "https://kotlinlang.org/docs/",
    course: "Kotlin for Android (Google Codelabs)",
    topics: ["Coroutines", "Android Views", "Jetpack Compose", "Room"],
    project: "Build an Android app",
  },
  flutter: {
    docs: "https://docs.flutter.dev/",
    course: "Flutter & Dart (freeCodeCamp)",
    topics: ["Widgets", "State Management", "Navigation", "Animations"],
    project: "Build a cross-platform mobile app",
  },
  "react native": {
    docs: "https://reactnative.dev/docs/getting-started",
    course: "React Native (Udemy)",
    topics: ["Components", "Navigation", "AsyncStorage", "APIs"],
    project: "Build a mobile app with React Native",
  },
  angular: {
    docs: "https://angular.dev/",
    course: "Angular - The Complete Guide (Udemy)",
    topics: ["Components", "Services", "RxJS", "Routing"],
    project: "Build a single-page app with Angular",
  },
  vue: {
    docs: "https://vuejs.org/guide/",
    course: "Vue - The Complete Guide (Udemy)",
    topics: ["Composition API", "Components", "Vuex/Pinia", "Router"],
    project: "Build a Vue SPA",
  },
  "next.js": {
    docs: "https://nextjs.org/docs",
    course: "Next.js 14 (freeCodeCamp)",
    topics: ["App Router", "Server Components", "API Routes", "SSR/SSG"],
    project: "Build a full-stack Next.js app",
  },
  redis: {
    docs: "https://redis.io/docs/",
    course: "Redis for Beginners (Udemy)",
    topics: ["Data Types", "Caching", "Pub/Sub", "Persistence"],
    project: "Add caching to an existing API",
  },
  kafka: {
    docs: "https://kafka.apache.org/documentation/",
    course: "Apache Kafka Series (Udemy)",
    topics: ["Topics", "Producers", "Consumers", "Streams"],
    project: "Build a real-time event pipeline",
  },
  spark: {
    docs: "https://spark.apache.org/docs/latest/",
    course: "Spark with Python (Udemy)",
    topics: ["RDDs", "DataFrames", "Spark SQL", "Streaming"],
    project: "Process a large dataset with Spark",
  },
  airflow: {
    docs: "https://airflow.apache.org/docs/",
    course: "Airflow Fundamentals (Astronomer)",
    topics: ["DAGs", "Operators", "Scheduling", "XComs"],
    project: "Build a data pipeline with Airflow",
  },
  terraform: {
    docs: "https://developer.hashicorp.com/terraform/docs",
    course: "Terraform for Beginners (freeCodeCamp)",
    topics: ["Providers", "Resources", "State", "Modules"],
    project: "Provision cloud infrastructure as code",
  },
  ansible: {
    docs: "https://docs.ansible.com/",
    course: "Ansible for DevOps (Udemy)",
    topics: ["Playbooks", "Inventory", "Roles", "Handlers"],
    project: "Automate server configuration",
  },
  jenkins: {
    docs: "https://www.jenkins.io/doc/",
    course: "Jenkins CI/CD (Udemy)",
    topics: ["Pipelines", "Jobs", "Plugins", "Integration"],
    project: "Set up a CI/CD pipeline",
  },
  "github actions": {
    docs: "https://docs.github.com/actions",
    course: "GitHub Actions (GitHub Docs)",
    topics: ["Workflows", "Jobs", "Secrets", "Artifacts"],
    project: "Automate build & deploy with Actions",
  },
  selenium: {
    docs: "https://www.selenium.dev/documentation/",
    course: "Selenium WebDriver (freeCodeCamp)",
    topics: ["Locators", "Waits", "Page Objects", "Test Runners"],
    project: "Write automated browser tests",
  },
  cypress: {
    docs: "https://docs.cypress.io/",
    course: "Cypress Testing (freeCodeCamp)",
    topics: ["Test Structure", "Assertions", "Fixtures", "CI Integration"],
    project: "Write E2E tests for a web app",
  },
  jest: {
    docs: "https://jestjs.io/docs/getting-started",
    course: "Testing React with Jest (Udemy)",
    topics: ["Test Structure", "Matchers", "Mocking", "Coverage"],
    project: "Add unit tests to a React app",
  },
  pytest: {
    docs: "https://docs.pytest.org/",
    course: "Pytest Masterclass (Udemy)",
    topics: ["Fixtures", "Parametrization", "Mocking", "Plugins"],
    project: "Write tests for a Python project",
  },
  communication: {
    docs: "https://www.coursera.org/learn/communication-skills",
    course: "Improving Communication Skills (Coursera)",
    topics: ["Active Listening", "Clear Writing", "Presentations", "Feedback"],
    project: "Lead a team presentation or write technical docs",
  },
  teamwork: {
    docs: "https://www.coursera.org/learn/teamwork-skills",
    course: "Teamwork & Collaboration (Coursera)",
    topics: ["Collaboration", "Conflict Resolution", "Remote Work", "Agile Teams"],
    project: "Contribute to a group open-source project",
  },
  leadership: {
    docs: "https://www.coursera.org/learn/leadership-skills",
    course: "Leadership & Management (Coursera)",
    topics: ["Vision Setting", "Delegation", "Mentoring", "Decision Making"],
    project: "Lead a student club or project team",
  },
  "problem solving": {
    docs: "https://www.coursera.org/learn/problem-solving",
    course: "Creative Problem Solving (Coursera)",
    topics: ["Root Cause Analysis", "Brainstorming", "Decision Matrices", "Prototyping"],
    project: "Solve a real-world problem with a hackathon project",
  },
  "critical thinking": {
    docs: "https://www.coursera.org/learn/critical-thinking-skills",
    course: "Critical Thinking & Logic (Coursera)",
    topics: ["Logical Reasoning", "Argument Analysis", "Bias Awareness", "Evidence Evaluation"],
    project: "Write a research paper or case study",
  },
  agile: {
    docs: "https://www.atlassian.com/agile",
    course: "Agile Fundamentals (Coursera)",
    topics: ["Scrum", "Sprints", "User Stories", "Retrospectives"],
    project: "Run a Scrum team for a class project",
  },
  scrum: {
    docs: "https://www.scrum.org/resources",
    course: "Professional Scrum Master (Scrum.org)",
    topics: ["Scrum Roles", "Events", "Artifacts", "Sprint Planning"],
    project: "Facilitate Scrum ceremonies for a team",
  },
  "project management": {
    docs: "https://www.pmi.org/",
    course: "Google Project Management (Coursera)",
    topics: ["Planning", "Scheduling", "Risk Management", "Stakeholders"],
    project: "Manage a capstone project end-to-end",
  },
  "data analysis": {
    docs: "https://www.kaggle.com/learn/data-analysis",
    course: "Data Analysis with Python (freeCodeCamp)",
    topics: ["Data Cleaning", "Exploration", "Visualization", "Reporting"],
    project: "Analyze a public dataset and present findings",
  },
  "data science": {
    docs: "https://www.kaggle.com/learn",
    course: "Data Science Specialization (Coursera)",
    topics: ["Statistics", "ML Basics", "Data Viz", "Storytelling"],
    project: "Complete a Kaggle competition",
  },
  "data engineering": {
    docs: "https://www.coursera.org/learn/data-engineering",
    course: "Data Engineering Foundations (Coursera)",
    topics: ["ETL", "Data Warehousing", "Pipelines", "Orchestration"],
    project: "Build an end-to-end data pipeline",
  },
  etl: {
    docs: "https://www.ibm.com/topics/etl",
    course: "ETL & Data Pipelines (Coursera)",
    topics: ["Extraction", "Transformation", "Loading", "Scheduling"],
    project: "Build an ETL pipeline with Python",
  },
  "big data": {
    docs: "https://www.coursera.org/learn/big-data",
    course: "Big Data Essentials (Coursera)",
    topics: ["Hadoop", "Spark", "Distributed Systems", "Data Lakes"],
    project: "Process TB-scale data with Spark",
  },
  statistics: {
    docs: "https://www.khanacademy.org/math/statistics-probability",
    course: "Statistics with Python (Coursera)",
    topics: ["Distributions", "Hypothesis Testing", "Confidence Intervals", "Regression"],
    project: "Perform statistical analysis on a dataset",
  },
  "time series": {
    docs: "https://otexts.com/fpp3/",
    course: "Time Series Forecasting (Coursera)",
    topics: ["Trend/Seasonality", "ARIMA", "Exponential Smoothing", "Forecast Evaluation"],
    project: "Forecast sales or stock prices",
  },
  nlp: {
    docs: "https://www.nltk.org/",
    course: "NLP Specialization (Coursera)",
    topics: ["Tokenization", "Embeddings", "Transformers", "Sentiment Analysis"],
    project: "Build a text classification model",
  },
  "computer vision": {
    docs: "https://opencv.org/",
    course: "Computer Vision Specialization (Coursera)",
    topics: ["Image Processing", "CNNs", "Object Detection", "Segmentation"],
    project: "Build an image classifier or detector",
  },
  llm: {
    docs: "https://platform.openai.com/docs",
    course: "LLM Engineering (DeepLearning.AI)",
    topics: ["Prompting", "RAG", "Fine-tuning", "Evaluation"],
    project: "Build a RAG chatbot",
  },
  rag: {
    docs: "https://python.langchain.com/docs",
    course: "LangChain for LLM Apps (DeepLearning.AI)",
    topics: ["Vector Stores", "Embeddings", "Retrieval", "Generation"],
    project: "Build a document Q&A bot",
  },
  mlops: {
    docs: "https://mlflow.org/docs/",
    course: "MLOps Specialization (Coursera)",
    topics: ["Model Registry", "CI/CD for ML", "Monitoring", "Deployment"],
    project: "Deploy an ML model to production",
  },
  dockerfile: {
    docs: "https://docs.docker.com/engine/reference/builder/",
    course: "Dockerfile Best Practices (Docker Docs)",
    topics: ["Layers", "Multi-stage Builds", "Healthchecks", "Optimization"],
    project: "Optimize a Docker image",
  },
  nginx: {
    docs: "https://nginx.org/en/docs/",
    course: "Nginx Fundamentals (Udemy)",
    topics: ["Server Blocks", "Reverse Proxy", "Load Balancing", "SSL"],
    project: "Deploy a web app behind Nginx",
  },
  "rest api": {
    docs: "https://restfulapi.net/",
    course: "REST API Design (Coursera)",
    topics: ["HTTP Methods", "Status Codes", "Versioning", "Security"],
    project: "Design and document a REST API",
  },
  graphql: {
    docs: "https://graphql.org/learn/",
    course: "GraphQL with Apollo (freeCodeCamp)",
    topics: ["Queries", "Mutations", "Resolvers", "Schema Design"],
    project: "Build a GraphQL API",
  },
  microservices: {
    docs: "https://microservices.io/",
    course: "Microservices Architecture (Coursera)",
    topics: ["Service Decomposition", "API Gateway", "Service Discovery", "Resilience"],
    project: "Break a monolith into microservices",
  },
  "system design": {
    docs: "https://github.com/donnemartin/system-design-primer",
    course: "System Design Primer (GitHub)",
    topics: ["Load Balancing", "Caching", "Database Scaling", "Message Queues"],
    project: "Design a scalable social media app",
  },
  "data structures": {
    docs: "https://www.geeksforgeeks.org/data-structures/",
    course: "Data Structures & Algorithms (Coursera)",
    topics: ["Arrays", "Linked Lists", "Trees", "Hash Tables"],
    project: "Implement common data structures",
  },
  algorithms: {
    docs: "https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
    course: "Algorithms Specialization (Coursera)",
    topics: ["Sorting", "Searching", "Dynamic Programming", "Graph Algorithms"],
    project: "Solve LeetCode problems systematically",
  },
  oop: {
    docs: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/",
    course: "OOP Fundamentals (Coursera)",
    topics: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
    project: "Refactor a project using OOP principles",
  },
  "design patterns": {
    docs: "https://refactoring.guru/design-patterns",
    course: "Design Patterns (refactoring.guru)",
    topics: ["Creational", "Structural", "Behavioral", "SOLID"],
    project: "Apply patterns to a real codebase",
  },
  security: {
    docs: "https://owasp.org/www-project-top-ten/",
    course: "Cybersecurity Fundamentals (Coursera)",
    topics: ["OWASP Top 10", "Authentication", "Encryption", "Secure Coding"],
    project: "Perform a security audit on a web app",
  },
  "ci/cd": {
    docs: "https://www.atlassian.com/continuous-delivery/ci-vs-ci-vs-cd",
    course: "CI/CD Pipeline (Coursera)",
    topics: ["Build Automation", "Testing", "Deployment", "Rollbacks"],
    project: "Set up a full CI/CD pipeline",
  },
};

const DEFAULT_RESOURCE = {
  docs: "https://www.coursera.org/",
  course: "Search for a course on Coursera or Udemy",
  topics: ["Core fundamentals", "Hands-on practice", "Real-world projects"],
  project: "Build a small project to demonstrate this skill",
};

const SkillGapPage = () => {
  const { jobTitle } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobData, setJobData] = useState(null);

  const decodedTitle = decodeURIComponent(jobTitle || "");

  // Fetch recommendations and find the matching job
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/jobs/recommendations");
        const recs = res.data.recommendations || [];

        const match = recs.find(
          (r) => r.title.toLowerCase() === decodedTitle.toLowerCase()
        );

        if (match) {
          setJobData(match);
        } else {
          setError(`No match data found for "${decodedTitle}".`);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Failed to load skill gap data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (decodedTitle) {
      fetchJobData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedTitle]);

  const handleQuickApply = () => {
    navigate(`/apply/${encodeURIComponent(decodedTitle)}`);
  };

  // Group missing skills by severity
  const missingSkills = jobData?.missingSkills || [];
  const matchedSkills = jobData?.matchedSkills || [];
  const matchScore = jobData?.match || 0;
  const trustScore = jobData?.trust || 0;

  // Categorize missing skills into severity buckets
  const criticalSkills = missingSkills.slice(0, Math.ceil(missingSkills.length * 0.3));
  const importantSkills = missingSkills.slice(
    Math.ceil(missingSkills.length * 0.3),
    Math.ceil(missingSkills.length * 0.7)
  );
  const niceToHaveSkills = missingSkills.slice(Math.ceil(missingSkills.length * 0.7));

  const readinessColor =
    matchScore >= 70 ? "#34d399" : matchScore >= 45 ? "#fbbf24" : "#f87171";

  return (
    <div className="skill-gap-page">
      {/* Header */}
      <div className="skill-gap-header">
        <div>
          <button className="back-btn" onClick={() => navigate("/recommendations")}>
            ← Back to Matches
          </button>
          <h1>Skill Gap Insights</h1>
          <p className="skill-gap-subtitle">
            Learning path for <strong>{decodedTitle}</strong>
          </p>
        </div>
      </div>

      {error && <div className="skill-gap-error">{error}</div>}

      {loading && (
        <div className="skill-gap-loading glass-card">
          <div className="loading-spinner" />
          <p>Analyzing your skill gap…</p>
        </div>
      )}

      {jobData && !loading && (
        <>
          {/* Target Role Readiness Banner */}
          <section className="readiness-banner glass-card">
            <div className="readiness-score">
              <div
                className="readiness-ring"
                style={{
                  "--readiness-angle": `${Math.min(360, (matchScore / 100) * 360)}deg`,
                  "--readiness-color": readinessColor,
                }}
              >
                <div className="readiness-inner">
                  <span className="readiness-value">{matchScore}%</span>
                  <span className="readiness-label">Ready</span>
                </div>
              </div>
            </div>

            <div className="readiness-info">
              <h2>{decodedTitle}</h2>
              <p className="readiness-desc">
                Here's how prepared you are for this role based on your current
                skill profile.
              </p>

              <div className="readiness-stats">
                <div className="readiness-stat">
                  <span className="readiness-stat-value matched-count">
                    {matchedSkills.length}
                  </span>
                  <span className="readiness-stat-label">Matched Skills</span>
                </div>
                <div className="readiness-stat">
                  <span className="readiness-stat-value missing-count">
                    {missingSkills.length}
                  </span>
                  <span className="readiness-stat-label">Missing Skills</span>
                </div>
                <div className="readiness-stat">
                  <span className="readiness-stat-value trust-count">
                    {trustScore}%
                  </span>
                  <span className="readiness-stat-label">Trust Score</span>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Skill Breakdown */}
          <section className="gap-section">
            <h3 className="section-title">Skill Breakdown</h3>

            {criticalSkills.length > 0 && (
              <div className="gap-category">
                <div className="gap-category-header">
                  <span className="gap-severity critical">🔴 Critical</span>
                  <span className="gap-category-count">
                    {criticalSkills.length} skills
                  </span>
                </div>
                <div className="gap-skill-list">
                  {criticalSkills.map((skill, i) => (
                    <span key={i} className="gap-skill-pill critical">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {importantSkills.length > 0 && (
              <div className="gap-category">
                <div className="gap-category-header">
                  <span className="gap-severity important">🟠 Important</span>
                  <span className="gap-category-count">
                    {importantSkills.length} skills
                  </span>
                </div>
                <div className="gap-skill-list">
                  {importantSkills.map((skill, i) => (
                    <span key={i} className="gap-skill-pill important">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {niceToHaveSkills.length > 0 && (
              <div className="gap-category">
                <div className="gap-category-header">
                  <span className="gap-severity nice">🟡 Nice to Have</span>
                  <span className="gap-category-count">
                    {niceToHaveSkills.length} skills
                  </span>
                </div>
                <div className="gap-skill-list">
                  {niceToHaveSkills.map((skill, i) => (
                    <span key={i} className="gap-skill-pill nice">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Curated Learning Action Plan */}
          <section className="learning-section">
            <h3 className="section-title">Curated Learning Action Plan</h3>
            <p className="learning-intro">
              Focus on these resources to close your skill gaps for{" "}
              <strong>{decodedTitle}</strong>.
            </p>

            <div className="learning-grid">
              {missingSkills.slice(0, 6).map((skill, i) => {
                const resource =
                  LEARNING_RESOURCES[skill.toLowerCase()] || DEFAULT_RESOURCE;

                return (
                  <div key={i} className="learning-card glass-card">
                    <div className="learning-card-header">
                      <span className="learning-skill-icon">📚</span>
                      <h4>{skill}</h4>
                    </div>

                    <div className="learning-block">
                      <p className="learning-label">📖 Documentation</p>
                      <a
                        href={resource.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="learning-link"
                      >
                        {resource.docs.replace(/^https?:\/\//, "").split("/")[0]}
                      </a>
                    </div>

                    <div className="learning-block">
                      <p className="learning-label">🎓 Recommended Course</p>
                      <p className="learning-course">{resource.course}</p>
                    </div>

                    <div className="learning-block">
                      <p className="learning-label">🎯 Core Topics</p>
                      <div className="learning-topics">
                        {resource.topics.map((topic, j) => (
                          <span key={j} className="learning-topic">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="learning-block">
                      <p className="learning-label">🚀 Project Idea</p>
                      <p className="learning-project">{resource.project}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Apply CTA */}
          <section className="quick-apply-cta glass-card">
            <div>
              <h3>Ready to start applying?</h3>
              <p>
                Jump straight to live job boards and search for{" "}
                <strong>{decodedTitle}</strong> roles.
              </p>
            </div>
            <button className="gradient-btn" onClick={handleQuickApply}>
              Quick Apply to Role →
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default SkillGapPage;