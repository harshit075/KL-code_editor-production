import mongoose from 'mongoose';
import Problem from './src/lib/models/Problem';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-assessment';

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
    constraints: ['Result should contain all rows'],
    testCases: [{ input: '', expectedOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT', isHidden: false }],
    starterCode: { sql: '-- Write your query here\nSELECT * FROM Employees;' }
  },
  {
    title: 'High Salary Employees',
    slug: 'high-salary-employees',
    difficulty: 'easy',
    type: 'sql',
    description: 'Find employees with a salary greater than 55000.',
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice", 50000), (2, "Bob", 60000), (3, "Charlie", 58000);',
    sampleOutput: 'Bob\nCharlie',
    constraints: ['Return only names'],
    testCases: [{ input: '', expectedOutput: 'Bob\nCharlie', isHidden: false }],
    starterCode: { sql: 'SELECT name FROM Employees WHERE salary > 55000;' }
  },
  {
    title: 'Department Count',
    slug: 'department-count',
    difficulty: 'medium',
    type: 'sql',
    description: 'Count the number of employees in each department.',
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), department VARCHAR(50));',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "A", "HR"), (2, "B", "IT"), (3, "C", "IT"), (4, "D", "Sales");',
    sampleOutput: 'HR|1\nIT|2\nSales|1',
    testCases: [{ input: '', expectedOutput: 'HR|1\nIT|2\nSales|1', isHidden: false }],
    starterCode: { sql: 'SELECT department, COUNT(*) FROM Employees GROUP BY department ORDER BY department;' }
  },
  {
    title: 'Employees Without Projects',
    slug: 'employees-no-projects',
    difficulty: 'medium',
    type: 'sql',
    description: 'Find names of employees who are not assigned to any project.',
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50)); CREATE TABLE Projects (p_id INT, emp_id INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice"), (2, "Bob"), (3, "Charlie"); INSERT INTO Projects VALUES (101, 1), (102, 3);',
    sampleOutput: 'Bob',
    testCases: [{ input: '', expectedOutput: 'Bob', isHidden: false }],
    starterCode: { sql: 'SELECT name FROM Employees WHERE id NOT IN (SELECT emp_id FROM Projects);' }
  },
  {
      title: 'Average salary per department',
      slug: 'avg-salary-dept',
      difficulty: 'medium',
      type: 'sql',
      description: 'Find the average salary for each department.',
      databaseSchema: 'CREATE TABLE Salaries (id INT, dept VARCHAR(50), amount INT);',
      databaseSeed: 'INSERT INTO Salaries VALUES (1, "IT", 1000), (2, "IT", 2000), (3, "HR", 1500);',
      sampleOutput: 'HR|1500.0\nIT|1500.0',
      testCases: [{ input: '', expectedOutput: 'HR|1500.0\nIT|1500.0', isHidden: false }],
      starterCode: { sql: 'SELECT dept, AVG(amount) FROM Salaries GROUP BY dept ORDER BY dept;' }
  },
  {
    title: 'Top 3 Salaries',
    slug: 'top-3-salaries',
    difficulty: 'hard',
    type: 'sql',
    description: 'Find the top 3 highest unique salaries.',
    databaseSchema: 'CREATE TABLE Employees (id INT, salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, 100), (2, 200), (3, 300), (4, 400), (5, 400);',
    sampleOutput: '400\n300\n200',
    testCases: [{ input: '', expectedOutput: '400\n300\n200', isHidden: false }],
    starterCode: { sql: 'SELECT DISTINCT salary FROM Employees ORDER BY salary DESC LIMIT 3;' }
  },
  {
    title: 'Duplicate Emails',
    slug: 'duplicate-emails',
    difficulty: 'easy',
    type: 'sql',
    description: 'Find all duplicate emails in the Users table.',
    databaseSchema: 'CREATE TABLE Users (id INT, email VARCHAR(100));',
    databaseSeed: 'INSERT INTO Users VALUES (1, "a@b.com"), (2, "c@d.com"), (3, "a@b.com");',
    sampleOutput: 'a@b.com',
    testCases: [{ input: '', expectedOutput: 'a@b.com', isHidden: false }],
    starterCode: { sql: 'SELECT email FROM Users GROUP BY email HAVING COUNT(email) > 1;' }
  },
  {
    title: 'Managers with 5 Reports',
    slug: 'managers-5-reports',
    difficulty: 'medium',
    type: 'sql',
    description: 'Find names of managers who have at least 5 direct reports.',
    databaseSchema: 'CREATE TABLE Employee (id INT, name VARCHAR(50), managerId INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1, "John", NULL), (2, "Dan", 1), (3, "James", 1), (4, "Amy", 1), (5, "Anne", 1), (6, "Ron", 1);',
    sampleOutput: 'John',
    testCases: [{ input: '', expectedOutput: 'John', isHidden: false }],
    starterCode: { sql: 'SELECT name FROM Employee WHERE id IN (SELECT managerId FROM Employee GROUP BY managerId HAVING COUNT(*) >= 5);' }
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
    testCases: [{ input: '', expectedOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700', isHidden: false }],
    starterCode: { sql: 'SELECT employee_id, CASE WHEN employee_id % 2 != 0 AND name NOT LIKE "M%" THEN salary ELSE 0 END AS bonus FROM Employees ORDER BY employee_id;' }
  },
  {
    title: 'Swap Salary',
    slug: 'swap-salary',
    difficulty: 'easy',
    type: 'sql',
    description: 'Swap all "f" and "m" values in a single update statement.',
    databaseSchema: 'CREATE TABLE Salary (id INT, sex CHAR(1));',
    databaseSeed: 'INSERT INTO Salary VALUES (1, "m"), (2, "f"), (3, "m");',
    sampleOutput: '1|f\n2|m\n3|f',
    testCases: [{ input: '', expectedOutput: '1|f\n2|m\n3|f', isHidden: false }],
    starterCode: { sql: 'UPDATE Salary SET sex = CASE sex WHEN "m" THEN "f" ELSE "m" END; SELECT * FROM Salary;' }
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
    testCases: [{ input: '', expectedOutput: 'Henry\nMax', isHidden: false }],
    starterCode: { sql: 'SELECT name FROM Customers WHERE id NOT IN (SELECT customerId FROM Orders);' }
  },
  {
    title: 'Big Countries',
    slug: 'big-countries',
    difficulty: 'easy',
    type: 'sql',
    description: 'A country is big if it has an area > 3M or population > 25M.',
    databaseSchema: 'CREATE TABLE World (name VARCHAR(50), continent VARCHAR(50), area INT, population INT, gdp INT);',
    databaseSeed: 'INSERT INTO World VALUES ("Afghanistan", "Asia", 652230, 25500100, 20343000), ("Algeria", "Africa", 2381741, 37100000, 188681000);',
    sampleOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741',
    testCases: [{ input: '', expectedOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741', isHidden: false }],
    starterCode: { sql: 'SELECT name, population, area FROM World WHERE area > 3000000 OR population > 25000000;' }
  },
  {
    title: 'Delete Duplicate Emails',
    slug: 'delete-duplicate-emails',
    difficulty: 'easy',
    type: 'sql',
    description: 'Delete all duplicate emails, keeping only the unique email with the smallest ID.',
    databaseSchema: 'CREATE TABLE Person (id INT, email VARCHAR(100));',
    databaseSeed: 'INSERT INTO Person VALUES (1, "john@example.com"), (2, "bob@example.com"), (3, "john@example.com");',
    sampleOutput: '1|john@example.com\n2|bob@example.com',
    testCases: [{ input: '', expectedOutput: '1|john@example.com\n2|bob@example.com', isHidden: false }],
    starterCode: { sql: 'DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email); SELECT * FROM Person;' }
  },
  {
    title: 'Classes More Than 5 Students',
    slug: 'classes-5-students',
    difficulty: 'easy',
    type: 'sql',
    description: 'Find all classes that have at least 5 students.',
    databaseSchema: 'CREATE TABLE Courses (student VARCHAR(50), class VARCHAR(50));',
    databaseSeed: 'INSERT INTO Courses VALUES ("A", "Math"), ("B", "English"), ("C", "Math"), ("D", "Biology"), ("E", "Math"), ("F", "Math"), ("G", "Math");',
    sampleOutput: 'Math',
    testCases: [{ input: '', expectedOutput: 'Math', isHidden: false }],
    starterCode: { sql: 'SELECT class FROM Courses GROUP BY class HAVING COUNT(student) >= 5;' }
  },
  {
    title: 'Nth Highest Salary',
    slug: 'nth-highest-salary',
    difficulty: 'medium',
    type: 'sql',
    description: 'Find the 2nd highest salary (return NULL if not exists).',
    databaseSchema: 'CREATE TABLE Employee (id INT, salary INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300);',
    sampleOutput: '200',
    testCases: [
        { input: '', expectedOutput: '200', isHidden: false },
        { input: '', expectedOutput: 'null', isHidden: true }
    ],
    starterCode: { sql: 'SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1) AS SecondHighestSalary;' }
  }
];

async function runSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Inserting 15 SQL problems...');
    await Problem.insertMany(sqlProblems);
    console.log('Seeded 15 SQL problems successfully!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
