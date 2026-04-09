const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://kladminuser:klpassword@cluster0.hszmspe.mongodb.net/kadel-labs?appName=Cluster0";

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, default: 'none' },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
});

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard'],
    },
    constraints: [{ type: String }],
    sampleInput: { type: String, default: 'none' },
    sampleOutput: { type: String, required: true },
    testCases: [TestCaseSchema],
    starterCode: {
        c: { type: String, default: '' },
        cpp: { type: String, default: '' },
        java: { type: String, default: '' },
        javascript: { type: String, default: '' },
        python: { type: String, default: '' },
        sql: { type: String, default: '' },
    },
    tags: [{ type: String }],
    type: { type: String, enum: ['dsa', 'sql'], default: 'dsa' },
    databaseSchema: { type: String },
    databaseSeed: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

const sqlProblems = [
  {
    title: 'Select All Employees',
    slug: 'select-all-employees',
    difficulty: 'easy',
    type: 'sql',
    description: 'Write a query to select all columns from the Employees table.',
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), salary INT, department VARCHAR(50));',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice", 50000, "HR"), (2, "Bob", 60000, "IT"), (3, "Charlie", 55000, "IT");',
    sampleOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT',
    testCases: [
      { input: 'sql', expectedOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT', isHidden: false },
      { input: 'sql', expectedOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'High Salary Employees',
    slug: 'high-salary-employees',
    difficulty: 'easy',
    type: 'sql',
    description: 'Find employees with a salary greater than 55000.',
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice", 50000), (2, "Bob", 60000), (3, "Charlie", 58000), (4, "David", 62000);',
    sampleOutput: 'Bob\nCharlie\nDavid',
    testCases: [
      { input: 'sql', expectedOutput: 'Bob\nCharlie\nDavid', isHidden: false },
      { input: 'sql', expectedOutput: 'Bob\nCharlie\nDavid', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Department Count',
    slug: 'department-count',
    difficulty: 'medium',
    type: 'sql',
    description: 'Count the number of employees in each department. Result should have columns department and count.',
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), department VARCHAR(50));',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "A", "HR"), (2, "B", "IT"), (3, "C", "IT"), (4, "D", "Sales"), (5, "E", "Sales");',
    sampleOutput: 'HR|1\nIT|2\nSales|2',
    testCases: [
      { input: 'sql', expectedOutput: 'HR|1\nIT|2\nSales|2', isHidden: false },
      { input: 'sql', expectedOutput: 'HR|1\nIT|2\nSales|2', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Employees Without Projects',
    slug: 'employees-no-projects',
    difficulty: 'medium',
    type: 'sql',
    description: 'Find names of employees who are not assigned to any project.',
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50)); CREATE TABLE Projects (p_id INT, emp_id INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice"), (2, "Bob"), (3, "Charlie"), (4, "Diana"); INSERT INTO Projects VALUES (101, 1), (102, 3);',
    sampleOutput: 'Bob\nDiana',
    testCases: [
      { input: 'sql', expectedOutput: 'Bob\nDiana', isHidden: false },
      { input: 'sql', expectedOutput: 'Bob\nDiana', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
      title: 'Average salary per department',
      slug: 'avg-salary-dept',
      difficulty: 'medium',
      type: 'sql',
      description: 'Find the average salary for each department.',
      databaseSchema: 'CREATE TABLE Salaries (id INT, dept VARCHAR(50), amount INT);',
      databaseSeed: 'INSERT INTO Salaries VALUES (1, "IT", 1000), (2, "IT", 2000), (3, "HR", 1500), (4, "Sales", 3000);',
      sampleOutput: 'HR|1500.0\nIT|1500.0\nSales|3000.0',
      testCases: [
        { input: 'sql', expectedOutput: 'HR|1500.0\nIT|1500.0\nSales|3000.0', isHidden: false },
        { input: 'sql', expectedOutput: 'HR|1500.0\nIT|1500.0\nSales|3000.0', isHidden: true }
      ],
      starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Top 3 Salaries',
    slug: 'top-3-salaries',
    difficulty: 'hard',
    type: 'sql',
    description: 'Find the top 3 highest unique salaries.',
    databaseSchema: 'CREATE TABLE Employees (id INT, salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, 100), (2, 200), (3, 300), (4, 400), (5, 400), (6, 500);',
    sampleOutput: '500\n400\n300',
    testCases: [
      { input: 'sql', expectedOutput: '500\n400\n300', isHidden: false },
      { input: 'sql', expectedOutput: '500\n400\n300', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Duplicate Emails',
    slug: 'duplicate-emails',
    difficulty: 'easy',
    type: 'sql',
    description: 'Find all duplicate emails in the Users table.',
    databaseSchema: 'CREATE TABLE Users (id INT, email VARCHAR(100));',
    databaseSeed: 'INSERT INTO Users VALUES (1, "a@b.com"), (2, "c@d.com"), (3, "a@b.com"), (4, "c@d.com");',
    sampleOutput: 'a@b.com\nc@d.com',
    testCases: [
      { input: 'sql', expectedOutput: 'a@b.com\nc@d.com', isHidden: false },
      { input: 'sql', expectedOutput: 'a@b.com\nc@d.com', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Managers with 5 Reports',
    slug: 'managers-5-reports',
    difficulty: 'medium',
    type: 'sql',
    description: 'Find names of managers who have at least 5 direct reports.',
    databaseSchema: 'CREATE TABLE Employee (id INT, name VARCHAR(50), managerId INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1, "John", NULL), (2, "Dan", 1), (3, "James", 1), (4, "Amy", 1), (5, "Anne", 1), (6, "Ron", 1), (7, "Zoe", 2);',
    sampleOutput: 'John',
    testCases: [
      { input: 'sql', expectedOutput: 'John', isHidden: false },
      { input: 'sql', expectedOutput: 'John', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Calculate Special Bonus',
    slug: 'calculate-special-bonus',
    difficulty: 'easy',
    type: 'sql',
    description: 'Calculate bonus: 100% salary if ID is odd and name doesn\'t start with "M", else 0.',
    databaseSchema: 'CREATE TABLE Employees (employee_id INT, name VARCHAR(50), salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (2, "Meir", 3000), (3, "Michael", 3800), (7, "Addison", 7400), (8, "Juan", 6100), (9, "Kiki", 7700);',
    sampleOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700',
    testCases: [
      { input: 'sql', expectedOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700', isHidden: false },
      { input: 'sql', expectedOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Swap Salary',
    slug: 'swap-salary',
    difficulty: 'easy',
    type: 'sql',
    description: 'Swap all "f" and "m" values in a single update statement.',
    databaseSchema: 'CREATE TABLE Salary (id INT, sex CHAR(1));',
    databaseSeed: 'INSERT INTO Salary VALUES (1, "m"), (2, "f"), (3, "m"), (4, "f");',
    sampleOutput: '1|f\n2|m\n3|f\n4|m',
    testCases: [
      { input: 'sql', expectedOutput: '1|f\n2|m\n3|f\n4|m', isHidden: false },
      { input: 'sql', expectedOutput: '1|f\n2|m\n3|f\n4|m', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Customers Who Never Order',
    slug: 'customers-no-orders',
    difficulty: 'easy',
    type: 'sql',
    description: 'Find all customers who never ordered anything.',
    databaseSchema: 'CREATE TABLE Customers (id INT, name VARCHAR(50)); CREATE TABLE Orders (id INT, customerId INT);',
    databaseSeed: 'INSERT INTO Customers VALUES (1, "Joe"), (2, "Henry"), (3, "Sam"), (4, "Max"); INSERT INTO Orders VALUES (1, 3), (2, 1);',
    sampleOutput: 'Henry\nMax',
    testCases: [
      { input: 'sql', expectedOutput: 'Henry\nMax', isHidden: false },
      { input: 'sql', expectedOutput: 'Henry\nMax', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Big Countries',
    slug: 'big-countries',
    difficulty: 'easy',
    type: 'sql',
    description: 'A country is big if it has an area > 3M or population > 25M.',
    databaseSchema: 'CREATE TABLE World (name VARCHAR(50), continent VARCHAR(50), area INT, population INT, gdp INT);',
    databaseSeed: 'INSERT INTO World VALUES ("Afghanistan", "Asia", 652230, 25500100, 20343000), ("Algeria", "Africa", 2381741, 37100000, 188681000), ("Brazil", "South America", 8515767, 202790000, 2000000000);',
    sampleOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741\nBrazil|202790000|8515767',
    testCases: [
      { input: 'sql', expectedOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741\nBrazil|202790000|8515767', isHidden: false },
      { input: 'sql', expectedOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741\nBrazil|202790000|8515767', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Delete Duplicate Emails',
    slug: 'delete-duplicate-emails',
    difficulty: 'easy',
    type: 'sql',
    description: 'Delete all duplicate emails, keeping only the unique email with the smallest ID.',
    databaseSchema: 'CREATE TABLE Person (id INT, email VARCHAR(100));',
    databaseSeed: 'INSERT INTO Person VALUES (1, "john@example.com"), (2, "bob@example.com"), (3, "john@example.com"), (4, "alice@example.com"), (5, "bob@example.com");',
    sampleOutput: '1|john@example.com\n2|bob@example.com\n4|alice@example.com',
    testCases: [
      { input: 'sql', expectedOutput: '1|john@example.com\n2|bob@example.com\n4|alice@example.com', isHidden: false },
      { input: 'sql', expectedOutput: '1|john@example.com\n2|bob@example.com\n4|alice@example.com', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Classes More Than 5 Students',
    slug: 'classes-5-students',
    difficulty: 'easy',
    type: 'sql',
    description: 'Find all classes that have at least 5 students.',
    databaseSchema: 'CREATE TABLE Courses (student VARCHAR(50), class VARCHAR(50));',
    databaseSeed: 'INSERT INTO Courses VALUES ("A", "Math"), ("B", "English"), ("C", "Math"), ("D", "Biology"), ("E", "Math"), ("F", "Math"), ("G", "Math"), ("H", "English");',
    sampleOutput: 'Math',
    testCases: [
      { input: 'sql', expectedOutput: 'Math', isHidden: false },
      { input: 'sql', expectedOutput: 'Math', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  },
  {
    title: 'Nth Highest Salary',
    slug: 'nth-highest-salary',
    difficulty: 'medium',
    type: 'sql',
    description: 'Find the 2nd highest salary.',
    databaseSchema: 'CREATE TABLE Employee (id INT, salary INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300), (4, 400);',
    sampleOutput: '300',
    testCases: [
        { input: 'sql', expectedOutput: '300', isHidden: false },
        { input: 'sql', expectedOutput: '300', isHidden: true }
    ],
    starterCode: { sql: '-- Write your query here\n' }
  }
];

async function runSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Clearing and re-seeding SQL problems (removed solutions)...');
    
    for(const p of sqlProblems) {
        await Problem.findOneAndUpdate(
            { slug: p.slug },
            { ...p, type: 'sql' },
            { upsert: true, returnDocument: 'after' }
        );
        console.log('Updated:', p.title);
    }
    
    console.log('Successfully re-seeded 15 SQL problems without solutions!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
