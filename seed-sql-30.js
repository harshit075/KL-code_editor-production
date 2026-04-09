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
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
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

  // ─────────────────────────────────────────────
  // 1. Select All Employees
  // ─────────────────────────────────────────────
  {
    title: 'Select All Employees',
    slug: 'select-all-employees',
    difficulty: 'easy',
    type: 'sql',
    tags: ['SELECT', 'basics'],
    description: `## Problem Statement
Write a SQL query to retrieve **all columns** from the \`Employees\` table.

### Table: Employees

| Column     | Type        |
|------------|-------------|
| id         | INT (PK)    |
| name       | VARCHAR(50) |
| salary     | INT         |
| department | VARCHAR(50) |

### Example Output
\`\`\`
1|Alice|50000|HR
2|Bob|60000|IT
3|Charlie|55000|IT
\`\`\`

### Hints
- Use \`SELECT *\` or list all columns explicitly.
- Return rows ordered by \`id\` ascending.`,
    constraints: [
      'Return all rows and all columns.',
      'Order results by id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), salary INT, department VARCHAR(50));',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice", 50000, "HR"), (2, "Bob", 60000, "IT"), (3, "Charlie", 55000, "IT");',
    sampleOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT',
    testCases: [
      { input: 'sql', expectedOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT', isHidden: false },
      { input: 'sql', expectedOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT', isHidden: true },
      { input: 'sql', expectedOutput: '1|Alice|50000|HR\n2|Bob|60000|IT\n3|Charlie|55000|IT', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT ...\n' },
  },

  // ─────────────────────────────────────────────
  // 2. High Salary Employees
  // ─────────────────────────────────────────────
  {
    title: 'High Salary Employees',
    slug: 'high-salary-employees',
    difficulty: 'easy',
    type: 'sql',
    tags: ['SELECT', 'WHERE', 'filtering'],
    description: `## Problem Statement
Find the **names** of employees whose salary is **greater than 55000**.

### Table: Employees

| Column | Type        |
|--------|-------------|
| id     | INT (PK)    |
| name   | VARCHAR(50) |
| salary | INT         |

### Example Input Data
| id | name    | salary |
|----|---------|--------|
| 1  | Alice   | 50000  |
| 2  | Bob     | 60000  |
| 3  | Charlie | 58000  |
| 4  | David   | 62000  |

### Expected Output
\`\`\`
Bob
Charlie
David
\`\`\`

### Hints
- Use a \`WHERE\` clause to filter by salary.
- Select only the \`name\` column.
- Order results by name alphabetically.`,
    constraints: [
      'Return only the name column.',
      'salary > 55000.',
      'Order results by name ASC.',
    ],
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice", 50000), (2, "Bob", 60000), (3, "Charlie", 58000), (4, "David", 62000);',
    sampleOutput: 'Bob\nCharlie\nDavid',
    testCases: [
      { input: 'sql', expectedOutput: 'Bob\nCharlie\nDavid', isHidden: false },
      { input: 'sql', expectedOutput: 'Bob\nCharlie\nDavid', isHidden: true },
      { input: 'sql', expectedOutput: 'Bob\nCharlie\nDavid', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT name\nFROM Employees\nWHERE ...\n' },
  },

  // ─────────────────────────────────────────────
  // 3. Department Employee Count
  // ─────────────────────────────────────────────
  {
    title: 'Department Employee Count',
    slug: 'department-count',
    difficulty: 'medium',
    type: 'sql',
    tags: ['GROUP BY', 'COUNT', 'aggregation'],
    description: `## Problem Statement
Count the number of employees in **each department**. Return two columns: \`department\` and \`count\`.

### Table: Employees

| Column     | Type        |
|------------|-------------|
| id         | INT (PK)    |
| name       | VARCHAR(50) |
| department | VARCHAR(50) |

### Example Input Data
| id | name | department |
|----|------|------------|
| 1  | A    | HR         |
| 2  | B    | IT         |
| 3  | C    | IT         |
| 4  | D    | Sales      |
| 5  | E    | Sales      |

### Expected Output
\`\`\`
HR|1
IT|2
Sales|2
\`\`\`

### Hints
- Use \`GROUP BY department\`.
- Use \`COUNT(*)\` or \`COUNT(id)\` to count employees.
- Order results by department name alphabetically.`,
    constraints: [
      'Group by department.',
      'Return columns: department, count.',
      'Order by department ASC.',
    ],
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50), department VARCHAR(50));',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "A", "HR"), (2, "B", "IT"), (3, "C", "IT"), (4, "D", "Sales"), (5, "E", "Sales");',
    sampleOutput: 'HR|1\nIT|2\nSales|2',
    testCases: [
      { input: 'sql', expectedOutput: 'HR|1\nIT|2\nSales|2', isHidden: false },
      { input: 'sql', expectedOutput: 'HR|1\nIT|2\nSales|2', isHidden: true },
      { input: 'sql', expectedOutput: 'HR|1\nIT|2\nSales|2', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT department, COUNT(*) AS count\nFROM Employees\nGROUP BY ...\n' },
  },

  // ─────────────────────────────────────────────
  // 4. Employees Without Projects
  // ─────────────────────────────────────────────
  {
    title: 'Employees Without Projects',
    slug: 'employees-no-projects',
    difficulty: 'medium',
    type: 'sql',
    tags: ['JOIN', 'LEFT JOIN', 'NULL', 'subquery'],
    description: `## Problem Statement
Find the **names** of employees who are **not assigned** to any project.

### Tables

**Employees**

| Column | Type        |
|--------|-------------|
| id     | INT (PK)    |
| name   | VARCHAR(50) |

**Projects**

| Column | Type |
|--------|------|
| p_id   | INT  |
| emp_id | INT  |

### Example Input Data

Employees: Alice(1), Bob(2), Charlie(3), Diana(4)
Projects: Project 101 → Alice(1), Project 102 → Charlie(3)

### Expected Output
\`\`\`
Bob
Diana
\`\`\`

### Hints
- Use a \`LEFT JOIN\` between Employees and Projects on \`id = emp_id\`.
- Filter where \`Projects.emp_id IS NULL\`.
- Alternatively, use \`NOT IN\` or \`NOT EXISTS\`.
- Order results by name alphabetically.`,
    constraints: [
      'Return only the name column.',
      'Order by name ASC.',
    ],
    databaseSchema: 'CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(50)); CREATE TABLE Projects (p_id INT, emp_id INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, "Alice"), (2, "Bob"), (3, "Charlie"), (4, "Diana"); INSERT INTO Projects VALUES (101, 1), (102, 3);',
    sampleOutput: 'Bob\nDiana',
    testCases: [
      { input: 'sql', expectedOutput: 'Bob\nDiana', isHidden: false },
      { input: 'sql', expectedOutput: 'Bob\nDiana', isHidden: true },
      { input: 'sql', expectedOutput: 'Bob\nDiana', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT e.name\nFROM Employees e\nLEFT JOIN Projects p ON ...\nWHERE ...\n' },
  },

  // ─────────────────────────────────────────────
  // 5. Average Salary Per Department
  // ─────────────────────────────────────────────
  {
    title: 'Average Salary Per Department',
    slug: 'avg-salary-dept',
    difficulty: 'medium',
    type: 'sql',
    tags: ['AVG', 'GROUP BY', 'aggregation'],
    description: `## Problem Statement
Find the **average salary** for each department. Return \`department\` and \`avg_salary\`.

### Table: Salaries

| Column | Type        |
|--------|-------------|
| id     | INT         |
| dept   | VARCHAR(50) |
| amount | INT         |

### Example Input Data
| id | dept  | amount |
|----|-------|--------|
| 1  | IT    | 1000   |
| 2  | IT    | 2000   |
| 3  | HR    | 1500   |
| 4  | Sales | 3000   |

### Expected Output
\`\`\`
HR|1500.0
IT|1500.0
Sales|3000.0
\`\`\`

### Hints
- Use \`AVG(amount)\` to compute average salary.
- Group by \`dept\`.
- Cast or ensure result is shown with one decimal place.
- Order by dept alphabetically.`,
    constraints: [
      'Return columns: dept, avg_salary (as decimal).',
      'Order by dept ASC.',
    ],
    databaseSchema: 'CREATE TABLE Salaries (id INT, dept VARCHAR(50), amount INT);',
    databaseSeed: 'INSERT INTO Salaries VALUES (1, "IT", 1000), (2, "IT", 2000), (3, "HR", 1500), (4, "Sales", 3000);',
    sampleOutput: 'HR|1500.0\nIT|1500.0\nSales|3000.0',
    testCases: [
      { input: 'sql', expectedOutput: 'HR|1500.0\nIT|1500.0\nSales|3000.0', isHidden: false },
      { input: 'sql', expectedOutput: 'HR|1500.0\nIT|1500.0\nSales|3000.0', isHidden: true },
      { input: 'sql', expectedOutput: 'HR|1500.0\nIT|1500.0\nSales|3000.0', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT dept, AVG(amount) AS avg_salary\nFROM Salaries\nGROUP BY ...\n' },
  },

  // ─────────────────────────────────────────────
  // 6. Top 3 Highest Salaries
  // ─────────────────────────────────────────────
  {
    title: 'Top 3 Highest Salaries',
    slug: 'top-3-salaries',
    difficulty: 'hard',
    type: 'sql',
    tags: ['DISTINCT', 'ORDER BY', 'LIMIT', 'subquery'],
    description: `## Problem Statement
Find the **top 3 unique highest salaries** from the Employees table.

### Table: Employees

| Column | Type |
|--------|------|
| id     | INT  |
| salary | INT  |

### Example Input Data
| id | salary |
|----|--------|
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
| 4  | 400    |
| 5  | 400    |
| 6  | 500    |

### Expected Output
\`\`\`
500
400
300
\`\`\`

### Hints
- Use \`DISTINCT\` to avoid duplicate salary values.
- Use \`ORDER BY salary DESC\`.
- Use \`LIMIT 3\` to get only the top 3.
- Each salary value should appear only once in the result.`,
    constraints: [
      'Return only unique salaries.',
      'Return top 3 salaries in descending order.',
      'Use LIMIT 3.',
    ],
    databaseSchema: 'CREATE TABLE Employees (id INT, salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (1, 100), (2, 200), (3, 300), (4, 400), (5, 400), (6, 500);',
    sampleOutput: '500\n400\n300',
    testCases: [
      { input: 'sql', expectedOutput: '500\n400\n300', isHidden: false },
      { input: 'sql', expectedOutput: '500\n400\n300', isHidden: true },
      { input: 'sql', expectedOutput: '500\n400\n300', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT DISTINCT salary\nFROM Employees\nORDER BY salary DESC\nLIMIT 3;\n' },
  },

  // ─────────────────────────────────────────────
  // 7. Duplicate Emails
  // ─────────────────────────────────────────────
  {
    title: 'Duplicate Emails',
    slug: 'duplicate-emails',
    difficulty: 'easy',
    type: 'sql',
    tags: ['GROUP BY', 'HAVING', 'duplicates'],
    description: `## Problem Statement
Find all **duplicate email addresses** in the \`Users\` table. An email is considered duplicate if it appears **more than once**.

### Table: Users

| Column | Type         |
|--------|--------------|
| id     | INT          |
| email  | VARCHAR(100) |

### Example Input Data
| id | email     |
|----|-----------|
| 1  | a@b.com   |
| 2  | c@d.com   |
| 3  | a@b.com   |
| 4  | c@d.com   |

### Expected Output
\`\`\`
a@b.com
c@d.com
\`\`\`

### Hints
- Group by \`email\` and use \`HAVING COUNT(email) > 1\`.
- Return only the \`email\` column.
- Order results alphabetically.`,
    constraints: [
      'Return emails that appear more than once.',
      'Return only the email column.',
      'Order by email ASC.',
    ],
    databaseSchema: 'CREATE TABLE Users (id INT, email VARCHAR(100));',
    databaseSeed: 'INSERT INTO Users VALUES (1, "a@b.com"), (2, "c@d.com"), (3, "a@b.com"), (4, "c@d.com");',
    sampleOutput: 'a@b.com\nc@d.com',
    testCases: [
      { input: 'sql', expectedOutput: 'a@b.com\nc@d.com', isHidden: false },
      { input: 'sql', expectedOutput: 'a@b.com\nc@d.com', isHidden: true },
      { input: 'sql', expectedOutput: 'a@b.com\nc@d.com', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT email\nFROM Users\nGROUP BY email\nHAVING ...\n' },
  },

  // ─────────────────────────────────────────────
  // 8. Managers with 5+ Direct Reports
  // ─────────────────────────────────────────────
  {
    title: 'Managers with 5+ Direct Reports',
    slug: 'managers-5-reports',
    difficulty: 'medium',
    type: 'sql',
    tags: ['self-join', 'GROUP BY', 'HAVING'],
    description: `## Problem Statement
Find the **names** of managers who have **at least 5 direct reports**.

### Table: Employee

| Column    | Type        |
|-----------|-------------|
| id        | INT (PK)    |
| name      | VARCHAR(50) |
| managerId | INT (nullable) |

A manager is an employee whose \`id\` appears in another row's \`managerId\` column.

### Example Input Data
| id | name  | managerId |
|----|-------|-----------|
| 1  | John  | NULL      |
| 2  | Dan   | 1         |
| 3  | James | 1         |
| 4  | Amy   | 1         |
| 5  | Anne  | 1         |
| 6  | Ron   | 1         |
| 7  | Zoe   | 2         |

### Expected Output
\`\`\`
John
\`\`\`

### Hints
- Join \`Employee\` to itself: one as employee, one as manager.
- Group the joined result by manager.
- Use \`HAVING COUNT(*) >= 5\`.`,
    constraints: [
      'Return only the manager name column.',
      'Count must be >= 5.',
    ],
    databaseSchema: 'CREATE TABLE Employee (id INT, name VARCHAR(50), managerId INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1, "John", NULL), (2, "Dan", 1), (3, "James", 1), (4, "Amy", 1), (5, "Anne", 1), (6, "Ron", 1), (7, "Zoe", 2);',
    sampleOutput: 'John',
    testCases: [
      { input: 'sql', expectedOutput: 'John', isHidden: false },
      { input: 'sql', expectedOutput: 'John', isHidden: true },
      { input: 'sql', expectedOutput: 'John', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT m.name\nFROM Employee e\nJOIN Employee m ON e.managerId = m.id\nGROUP BY m.id, m.name\nHAVING ...\n' },
  },

  // ─────────────────────────────────────────────
  // 9. Calculate Special Bonus
  // ─────────────────────────────────────────────
  {
    title: 'Calculate Special Bonus',
    slug: 'calculate-special-bonus',
    difficulty: 'easy',
    type: 'sql',
    tags: ['CASE WHEN', 'conditional', 'MOD'],
    description: `## Problem Statement
Calculate the bonus for each employee using this rule:
- Bonus = **100% of salary** if:
  - Employee ID is **odd**, AND
  - Employee name does **not** start with \`'M'\`
- Otherwise, bonus = **0**

Return \`employee_id\` and \`bonus\`, ordered by \`employee_id\`.

### Table: Employees

| Column      | Type        |
|-------------|-------------|
| employee_id | INT (PK)    |
| name        | VARCHAR(50) |
| salary      | INT         |

### Example Input Data
| employee_id | name    | salary |
|-------------|---------|--------|
| 2           | Meir    | 3000   |
| 3           | Michael | 3800   |
| 7           | Addison | 7400   |
| 8           | Juan    | 6100   |
| 9           | Kiki    | 7700   |

### Expected Output
\`\`\`
2|0
3|0
7|7400
8|0
9|7700
\`\`\`

### Hints
- Use \`CASE WHEN (employee_id % 2 = 1) AND (name NOT LIKE 'M%') THEN salary ELSE 0 END\`.
- Order by \`employee_id ASC\`.`,
    constraints: [
      'Odd ID: employee_id % 2 = 1.',
      'Name should NOT start with M.',
      'Order by employee_id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Employees (employee_id INT, name VARCHAR(50), salary INT);',
    databaseSeed: 'INSERT INTO Employees VALUES (2, "Meir", 3000), (3, "Michael", 3800), (7, "Addison", 7400), (8, "Juan", 6100), (9, "Kiki", 7700);',
    sampleOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700',
    testCases: [
      { input: 'sql', expectedOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700', isHidden: false },
      { input: 'sql', expectedOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700', isHidden: true },
      { input: 'sql', expectedOutput: '2|0\n3|0\n7|7400\n8|0\n9|7700', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT employee_id,\n  CASE WHEN ... THEN salary ELSE 0 END AS bonus\nFROM Employees\nORDER BY employee_id;\n' },
  },

  // ─────────────────────────────────────────────
  // 10. Swap Salary Gender
  // ─────────────────────────────────────────────
  {
    title: 'Swap Salary Gender',
    slug: 'swap-salary',
    difficulty: 'easy',
    type: 'sql',
    tags: ['UPDATE', 'CASE WHEN', 'DML'],
    description: `## Problem Statement
Write a **single UPDATE statement** to swap all \`'f'\` values to \`'m'\` and all \`'m'\` values to \`'f'\` in the \`sex\` column of the \`Salary\` table.

After the update, write a SELECT to verify: return \`id\` and \`sex\` ordered by \`id\`.

### Table: Salary

| Column | Type    |
|--------|---------|
| id     | INT     |
| sex    | CHAR(1) |

### Example Input Data
| id | sex |
|----|-----|
| 1  | m   |
| 2  | f   |
| 3  | m   |
| 4  | f   |

### Expected Output (after swap + SELECT)
\`\`\`
1|f
2|m
3|f
4|m
\`\`\`

### Hints
- Use \`UPDATE Salary SET sex = CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END;\`
- Then \`SELECT id, sex FROM Salary ORDER BY id;\``,
    constraints: [
      'Use a single UPDATE statement.',
      'After update, SELECT id, sex ORDER BY id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Salary (id INT, sex CHAR(1));',
    databaseSeed: 'INSERT INTO Salary VALUES (1, "m"), (2, "f"), (3, "m"), (4, "f");',
    sampleOutput: '1|f\n2|m\n3|f\n4|m',
    testCases: [
      { input: 'sql', expectedOutput: '1|f\n2|m\n3|f\n4|m', isHidden: false },
      { input: 'sql', expectedOutput: '1|f\n2|m\n3|f\n4|m', isHidden: true },
      { input: 'sql', expectedOutput: '1|f\n2|m\n3|f\n4|m', isHidden: true },
    ],
    starterCode: { sql: '-- Step 1: Update\nUPDATE Salary SET sex = CASE WHEN sex = ... THEN ... ELSE ... END;\n-- Step 2: Verify\nSELECT id, sex FROM Salary ORDER BY id;\n' },
  },

  // ─────────────────────────────────────────────
  // 11. Customers Who Never Ordered
  // ─────────────────────────────────────────────
  {
    title: 'Customers Who Never Ordered',
    slug: 'customers-no-orders',
    difficulty: 'easy',
    type: 'sql',
    tags: ['LEFT JOIN', 'NULL', 'subquery'],
    description: `## Problem Statement
Find all customers who have **never placed an order**.

### Tables

**Customers**

| Column | Type        |
|--------|-------------|
| id     | INT (PK)    |
| name   | VARCHAR(50) |

**Orders**

| Column     | Type |
|------------|------|
| id         | INT  |
| customerId | INT  |

### Example Input Data

Customers: Joe(1), Henry(2), Sam(3), Max(4)
Orders: Order 1 by Sam(3), Order 2 by Joe(1)

### Expected Output
\`\`\`
Henry
Max
\`\`\`

### Hints
- Use \`LEFT JOIN Orders ON Customers.id = Orders.customerId\`.
- Filter where \`Orders.customerId IS NULL\`.
- Alternatively use \`NOT IN\` subquery.
- Order by name alphabetically.`,
    constraints: [
      'Return only the customer name.',
      'Order by name ASC.',
    ],
    databaseSchema: 'CREATE TABLE Customers (id INT, name VARCHAR(50)); CREATE TABLE Orders (id INT, customerId INT);',
    databaseSeed: 'INSERT INTO Customers VALUES (1, "Joe"), (2, "Henry"), (3, "Sam"), (4, "Max"); INSERT INTO Orders VALUES (1, 3), (2, 1);',
    sampleOutput: 'Henry\nMax',
    testCases: [
      { input: 'sql', expectedOutput: 'Henry\nMax', isHidden: false },
      { input: 'sql', expectedOutput: 'Henry\nMax', isHidden: true },
      { input: 'sql', expectedOutput: 'Henry\nMax', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT c.name\nFROM Customers c\nLEFT JOIN Orders o ON c.id = o.customerId\nWHERE ...\n' },
  },

  // ─────────────────────────────────────────────
  // 12. Big Countries
  // ─────────────────────────────────────────────
  {
    title: 'Big Countries',
    slug: 'big-countries',
    difficulty: 'easy',
    type: 'sql',
    tags: ['WHERE', 'OR', 'filtering'],
    description: `## Problem Statement
A country is **big** if it satisfies **either** of the following:
- Has an **area** of more than **3,000,000** km²
- Has a **population** of more than **25,000,000**

Return \`name\`, \`population\`, and \`area\` for all big countries.

### Table: World

| Column     | Type        |
|------------|-------------|
| name       | VARCHAR(50) |
| continent  | VARCHAR(50) |
| area       | INT         |
| population | INT         |
| gdp        | INT         |

### Expected Output
\`\`\`
Afghanistan|25500100|652230
Algeria|37100000|2381741
Brazil|202790000|8515767
\`\`\`

### Hints
- Use \`WHERE area > 3000000 OR population > 25000000\`.
- Select only \`name\`, \`population\`, \`area\`.
- Order by name alphabetically.`,
    constraints: [
      'Return name, population, area columns.',
      'area > 3000000 OR population > 25000000.',
      'Order by name ASC.',
    ],
    databaseSchema: 'CREATE TABLE World (name VARCHAR(50), continent VARCHAR(50), area INT, population INT, gdp INT);',
    databaseSeed: 'INSERT INTO World VALUES ("Afghanistan", "Asia", 652230, 25500100, 20343000), ("Algeria", "Africa", 2381741, 37100000, 188681000), ("Brazil", "South America", 8515767, 202790000, 2000000000);',
    sampleOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741\nBrazil|202790000|8515767',
    testCases: [
      { input: 'sql', expectedOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741\nBrazil|202790000|8515767', isHidden: false },
      { input: 'sql', expectedOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741\nBrazil|202790000|8515767', isHidden: true },
      { input: 'sql', expectedOutput: 'Afghanistan|25500100|652230\nAlgeria|37100000|2381741\nBrazil|202790000|8515767', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT name, population, area\nFROM World\nWHERE ...\n' },
  },

  // ─────────────────────────────────────────────
  // 13. Delete Duplicate Emails
  // ─────────────────────────────────────────────
  {
    title: 'Delete Duplicate Emails',
    slug: 'delete-duplicate-emails',
    difficulty: 'easy',
    type: 'sql',
    tags: ['DELETE', 'subquery', 'MIN', 'duplicates'],
    description: `## Problem Statement
Delete all duplicate email entries from the \`Person\` table, keeping only the one with the **smallest \`id\`** for each email.

After deletion, \`SELECT id, email FROM Person ORDER BY id\` should show only unique emails.

### Table: Person

| Column | Type         |
|--------|--------------|
| id     | INT (PK)     |
| email  | VARCHAR(100) |

### Example Input Data
| id | email              |
|----|--------------------|
| 1  | john@example.com   |
| 2  | bob@example.com    |
| 3  | john@example.com   |
| 4  | alice@example.com  |
| 5  | bob@example.com    |

### Expected Output
\`\`\`
1|john@example.com
2|bob@example.com
4|alice@example.com
\`\`\`

### Hints
- Use a \`DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email)\`.
- Some databases require an alias for the subquery.
- Then \`SELECT id, email FROM Person ORDER BY id;\``,
    constraints: [
      'Keep the row with the smallest id for each email.',
      'After DELETE, SELECT id, email ORDER BY id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Person (id INT, email VARCHAR(100));',
    databaseSeed: 'INSERT INTO Person VALUES (1, "john@example.com"), (2, "bob@example.com"), (3, "john@example.com"), (4, "alice@example.com"), (5, "bob@example.com");',
    sampleOutput: '1|john@example.com\n2|bob@example.com\n4|alice@example.com',
    testCases: [
      { input: 'sql', expectedOutput: '1|john@example.com\n2|bob@example.com\n4|alice@example.com', isHidden: false },
      { input: 'sql', expectedOutput: '1|john@example.com\n2|bob@example.com\n4|alice@example.com', isHidden: true },
      { input: 'sql', expectedOutput: '1|john@example.com\n2|bob@example.com\n4|alice@example.com', isHidden: true },
    ],
    starterCode: { sql: '-- Step 1: Delete duplicates\nDELETE FROM Person WHERE id NOT IN (...);\n-- Step 2: Verify\nSELECT id, email FROM Person ORDER BY id;\n' },
  },

  // ─────────────────────────────────────────────
  // 14. Classes with 5+ Students
  // ─────────────────────────────────────────────
  {
    title: 'Classes with 5+ Students',
    slug: 'classes-5-students',
    difficulty: 'easy',
    type: 'sql',
    tags: ['GROUP BY', 'HAVING', 'COUNT'],
    description: `## Problem Statement
Find all classes that have **at least 5 students** enrolled.

### Table: Courses

| Column  | Type        |
|---------|-------------|
| student | VARCHAR(50) |
| class   | VARCHAR(50) |

### Example Input Data
| student | class   |
|---------|---------|
| A       | Math    |
| B       | English |
| C       | Math    |
| D       | Biology |
| E       | Math    |
| F       | Math    |
| G       | Math    |
| H       | English |

### Expected Output
\`\`\`
Math
\`\`\`

### Hints
- Group by \`class\` and count students.
- Use \`HAVING COUNT(student) >= 5\`.
- Return only the \`class\` column.`,
    constraints: [
      'Return classes with 5 or more students.',
      'Return only the class name column.',
    ],
    databaseSchema: 'CREATE TABLE Courses (student VARCHAR(50), class VARCHAR(50));',
    databaseSeed: 'INSERT INTO Courses VALUES ("A", "Math"), ("B", "English"), ("C", "Math"), ("D", "Biology"), ("E", "Math"), ("F", "Math"), ("G", "Math"), ("H", "English");',
    sampleOutput: 'Math',
    testCases: [
      { input: 'sql', expectedOutput: 'Math', isHidden: false },
      { input: 'sql', expectedOutput: 'Math', isHidden: true },
      { input: 'sql', expectedOutput: 'Math', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT class\nFROM Courses\nGROUP BY class\nHAVING ...\n' },
  },

  // ─────────────────────────────────────────────
  // 15. 2nd Highest Salary
  // ─────────────────────────────────────────────
  {
    title: '2nd Highest Salary',
    slug: 'nth-highest-salary',
    difficulty: 'medium',
    type: 'sql',
    tags: ['subquery', 'DISTINCT', 'ORDER BY', 'LIMIT', 'OFFSET'],
    description: `## Problem Statement
Find the **2nd highest salary** from the \`Employee\` table. If there is no 2nd highest salary, return \`NULL\`.

### Table: Employee

| Column | Type |
|--------|------|
| id     | INT  |
| salary | INT  |

### Example Input Data
| id | salary |
|----|--------|
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
| 4  | 400    |

### Expected Output
\`\`\`
300
\`\`\`

### Hints
- Use \`SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1\`.
- Or use a subquery: \`SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee)\`.
- Wrap in a subquery to return NULL if no 2nd highest exists.`,
    constraints: [
      'Return a single value: the 2nd highest distinct salary.',
      'Return NULL if not present.',
    ],
    databaseSchema: 'CREATE TABLE Employee (id INT, salary INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1, 100), (2, 200), (3, 300), (4, 400);',
    sampleOutput: '300',
    testCases: [
      { input: 'sql', expectedOutput: '300', isHidden: false },
      { input: 'sql', expectedOutput: '300', isHidden: true },
      { input: 'sql', expectedOutput: '300', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT DISTINCT salary\nFROM Employee\nORDER BY salary DESC\nLIMIT 1 OFFSET 1;\n' },
  },

  // ─────────────────────────────────────────────
  // 16. Rising Temperature (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Rising Temperature',
    slug: 'rising-temperature',
    difficulty: 'easy',
    type: 'sql',
    tags: ['self-join', 'DATE', 'comparison'],
    description: `## Problem Statement
Find all dates' \`id\` where the temperature is **higher than the previous day's** temperature.

### Table: Weather

| Column      | Type |
|-------------|------|
| id          | INT  |
| recordDate  | DATE |
| temperature | INT  |

### Example Input Data
| id | recordDate | temperature |
|----|------------|-------------|
| 1  | 2015-01-01 | 10          |
| 2  | 2015-01-02 | 25          |
| 3  | 2015-01-03 | 20          |
| 4  | 2015-01-04 | 30          |

### Expected Output
\`\`\`
2
4
\`\`\`

### Hints
- Self-join the \`Weather\` table on consecutive dates.
- Use \`DATE(w1.recordDate) = DATE(w2.recordDate) + INTERVAL 1 DAY\` or \`DATEDIFF\`.
- Return the \`id\` of rows where temperature is greater.
- Order results by id ASC.`,
    constraints: [
      'Return id of days warmer than the previous day.',
      'Order by id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Weather (id INT, recordDate DATE, temperature INT);',
    databaseSeed: 'INSERT INTO Weather VALUES (1, "2015-01-01", 10), (2, "2015-01-02", 25), (3, "2015-01-03", 20), (4, "2015-01-04", 30);',
    sampleOutput: '2\n4',
    testCases: [
      { input: 'sql', expectedOutput: '2\n4', isHidden: false },
      { input: 'sql', expectedOutput: '2\n4', isHidden: true },
      { input: 'sql', expectedOutput: '2\n4', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT w1.id\nFROM Weather w1\nJOIN Weather w2 ON DATEDIFF(w1.recordDate, w2.recordDate) = 1\nWHERE ...\nORDER BY w1.id;\n' },
  },

  // ─────────────────────────────────────────────
  // 17. Employees Earning More Than Managers (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Employees Earning More Than Managers',
    slug: 'employee-earn-more-than-manager',
    difficulty: 'medium',
    type: 'sql',
    tags: ['self-join', 'comparison', 'JOIN'],
    description: `## Problem Statement
Find employees whose **salary is greater than their manager's salary**.

### Table: Employee

| Column    | Type        |
|-----------|-------------|
| id        | INT (PK)    |
| name      | VARCHAR(50) |
| salary    | INT         |
| managerId | INT         |

### Example Input Data
| id | name  | salary | managerId |
|----|-------|--------|-----------|
| 1  | Joe   | 70000  | 3         |
| 2  | Henry | 80000  | 4         |
| 3  | Sam   | 60000  | NULL      |
| 4  | Max   | 90000  | NULL      |

### Expected Output
\`\`\`
Joe
\`\`\`

### Hints
- Self-join Employee as \`e\` (employee) and \`m\` (manager) on \`e.managerId = m.id\`.
- Filter \`e.salary > m.salary\`.
- Return only the employee name column.`,
    constraints: [
      'Return only the employee name.',
      'Only return employees who have a manager.',
    ],
    databaseSchema: 'CREATE TABLE Employee (id INT, name VARCHAR(50), salary INT, managerId INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1, "Joe", 70000, 3), (2, "Henry", 80000, 4), (3, "Sam", 60000, NULL), (4, "Max", 90000, NULL);',
    sampleOutput: 'Joe',
    testCases: [
      { input: 'sql', expectedOutput: 'Joe', isHidden: false },
      { input: 'sql', expectedOutput: 'Joe', isHidden: true },
      { input: 'sql', expectedOutput: 'Joe', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT e.name\nFROM Employee e\nJOIN Employee m ON e.managerId = m.id\nWHERE ...\n' },
  },

  // ─────────────────────────────────────────────
  // 18. Second Highest Score Per Subject (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Rank Scores',
    slug: 'rank-scores',
    difficulty: 'medium',
    type: 'sql',
    tags: ['RANK', 'window functions', 'ORDER BY'],
    description: `## Problem Statement
Write a SQL query to **rank scores**. If there is a tie, both should get the same rank. After a tie, the next rank should be the immediately following integer (dense rank).

Return \`score\` and \`rank\`, ordered by score descending.

### Table: Scores

| Column | Type    |
|--------|---------|
| id     | INT     |
| score  | DECIMAL |

### Example Input Data
| id | score |
|----|-------|
| 1  | 3.50  |
| 2  | 3.65  |
| 3  | 4.00  |
| 4  | 3.85  |
| 5  | 4.00  |
| 6  | 3.65  |

### Expected Output
\`\`\`
4.00|1
4.00|1
3.85|2
3.65|3
3.65|3
3.50|4
\`\`\`

### Hints
- Use \`DENSE_RANK() OVER (ORDER BY score DESC)\` window function.
- Order by score DESC.`,
    constraints: [
      'Return score and rank columns.',
      'Use DENSE_RANK (no gaps in rank after ties).',
      'Order by score DESC.',
    ],
    databaseSchema: 'CREATE TABLE Scores (id INT, score DECIMAL(4,2));',
    databaseSeed: 'INSERT INTO Scores VALUES (1, 3.50), (2, 3.65), (3, 4.00), (4, 3.85), (5, 4.00), (6, 3.65);',
    sampleOutput: '4.00|1\n4.00|1\n3.85|2\n3.65|3\n3.65|3\n3.50|4',
    testCases: [
      { input: 'sql', expectedOutput: '4.00|1\n4.00|1\n3.85|2\n3.65|3\n3.65|3\n3.50|4', isHidden: false },
      { input: 'sql', expectedOutput: '4.00|1\n4.00|1\n3.85|2\n3.65|3\n3.65|3\n3.50|4', isHidden: true },
      { input: 'sql', expectedOutput: '4.00|1\n4.00|1\n3.85|2\n3.65|3\n3.65|3\n3.50|4', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT score,\n  DENSE_RANK() OVER (ORDER BY score DESC) AS rank\nFROM Scores\nORDER BY score DESC;\n' },
  },

  // ─────────────────────────────────────────────
  // 19. Consecutive Numbers (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Consecutive Numbers',
    slug: 'consecutive-numbers',
    difficulty: 'hard',
    type: 'sql',
    tags: ['self-join', 'consecutive', 'DISTINCT'],
    description: `## Problem Statement
Find all numbers that appear **at least 3 consecutive times** in the \`Logs\` table.

### Table: Logs

| Column | Type |
|--------|------|
| id     | INT  |
| num    | INT  |

IDs are consecutive integers.

### Example Input Data
| id | num |
|----|-----|
| 1  | 1   |
| 2  | 1   |
| 3  | 1   |
| 4  | 2   |
| 5  | 1   |
| 6  | 2   |
| 7  | 2   |

### Expected Output
\`\`\`
1
\`\`\`

### Hints
- Self-join Logs three times: \`l1.id + 1 = l2.id AND l2.id + 1 = l3.id\`
- Where \`l1.num = l2.num AND l2.num = l3.num\`.
- Use \`DISTINCT\` to avoid duplicates.`,
    constraints: [
      'Return only distinct numbers that appear 3+ consecutive times.',
      'Result column name: ConsecutiveNums.',
    ],
    databaseSchema: 'CREATE TABLE Logs (id INT, num INT);',
    databaseSeed: 'INSERT INTO Logs VALUES (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (6, 2), (7, 2);',
    sampleOutput: '1',
    testCases: [
      { input: 'sql', expectedOutput: '1', isHidden: false },
      { input: 'sql', expectedOutput: '1', isHidden: true },
      { input: 'sql', expectedOutput: '1', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT DISTINCT l1.num AS ConsecutiveNums\nFROM Logs l1\nJOIN Logs l2 ON l1.id + 1 = l2.id\nJOIN Logs l3 ON l2.id + 1 = l3.id\nWHERE ...\n' },
  },

  // ─────────────────────────────────────────────
  // 20. Department Highest Salary (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Department Highest Salary',
    slug: 'department-highest-salary',
    difficulty: 'medium',
    type: 'sql',
    tags: ['JOIN', 'MAX', 'GROUP BY', 'subquery'],
    description: `## Problem Statement
Find employees who earn the **highest salary in their department**. Return the department name, employee name, and salary.

### Tables

**Employee**

| Column       | Type        |
|--------------|-------------|
| id           | INT (PK)    |
| name         | VARCHAR(50) |
| salary       | INT         |
| departmentId | INT         |

**Department**

| Column | Type        |
|--------|-------------|
| id     | INT (PK)    |
| name   | VARCHAR(50) |

### Example Input Data

Employee: Joe(IT, 70000), Jim(IT, 90000), Henry(Sales, 80000), Max(Sales, 90000)
Departments: IT(1), Sales(2)

### Expected Output
\`\`\`
IT|Jim|90000
Sales|Henry|80000
Sales|Max|90000
\`\`\`

### Hints
- \`JOIN Department ON Employee.departmentId = Department.id\`.
- Use a subquery to find \`MAX(salary)\` per department.
- Filter employees matching that max salary.
- Order by department name, then employee name.`,
    constraints: [
      'Return Department name, Employee name, Salary.',
      'Match employees whose salary = MAX(salary) in their department.',
      'Order by Department ASC, Employee ASC.',
    ],
    databaseSchema: 'CREATE TABLE Employee (id INT, name VARCHAR(50), salary INT, departmentId INT); CREATE TABLE Department (id INT, name VARCHAR(50));',
    databaseSeed: 'INSERT INTO Department VALUES (1, "IT"), (2, "Sales"); INSERT INTO Employee VALUES (1, "Joe", 70000, 1), (2, "Jim", 90000, 1), (3, "Henry", 80000, 2), (4, "Max", 90000, 2);',
    sampleOutput: 'IT|Jim|90000\nSales|Henry|80000\nSales|Max|90000',
    testCases: [
      { input: 'sql', expectedOutput: 'IT|Jim|90000\nSales|Henry|80000\nSales|Max|90000', isHidden: false },
      { input: 'sql', expectedOutput: 'IT|Jim|90000\nSales|Henry|80000\nSales|Max|90000', isHidden: true },
      { input: 'sql', expectedOutput: 'IT|Jim|90000\nSales|Henry|80000\nSales|Max|90000', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT d.name AS Department, e.name AS Employee, e.salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n  SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId\n)\nORDER BY d.name, e.name;\n' },
  },

  // ─────────────────────────────────────────────
  // 21. Triangle Judgment (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Triangle Judgment',
    slug: 'triangle-judgment',
    difficulty: 'easy',
    type: 'sql',
    tags: ['CASE WHEN', 'conditional', 'triangle inequality'],
    description: `## Problem Statement
Determine for each row whether the three side lengths \`x\`, \`y\`, and \`z\` can form a **valid triangle**.

A valid triangle satisfies:
- x + y > z
- x + z > y
- y + z > x

Return \`x\`, \`y\`, \`z\`, and \`triangle\` (\`'Yes'\` or \`'No'\`).

### Table: Triangle

| Column | Type |
|--------|------|
| x      | INT  |
| y      | INT  |
| z      | INT  |

### Example Input Data
| x  | y  | z  |
|----|----|----|
| 13 | 15 | 30 |
| 10 | 20 | 15 |

### Expected Output
\`\`\`
13|15|30|No
10|20|15|Yes
\`\`\`

### Hints
- Use \`CASE WHEN (x+y>z AND x+z>y AND y+z>x) THEN 'Yes' ELSE 'No' END\`.`,
    constraints: [
      'Return x, y, z, triangle columns.',
      'triangle is Yes or No.',
    ],
    databaseSchema: 'CREATE TABLE Triangle (x INT, y INT, z INT);',
    databaseSeed: 'INSERT INTO Triangle VALUES (13, 15, 30), (10, 20, 15);',
    sampleOutput: '13|15|30|No\n10|20|15|Yes',
    testCases: [
      { input: 'sql', expectedOutput: '13|15|30|No\n10|20|15|Yes', isHidden: false },
      { input: 'sql', expectedOutput: '13|15|30|No\n10|20|15|Yes', isHidden: true },
      { input: 'sql', expectedOutput: '13|15|30|No\n10|20|15|Yes', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT x, y, z,\n  CASE WHEN ... THEN "Yes" ELSE "No" END AS triangle\nFROM Triangle;\n' },
  },

  // ─────────────────────────────────────────────
  // 22. Human Traffic of Stadium (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Human Traffic of Stadium',
    slug: 'human-traffic-stadium',
    difficulty: 'hard',
    type: 'sql',
    tags: ['consecutive', 'self-join', 'window functions'],
    description: `## Problem Statement
Display the records with **3 or more consecutive rows** where the \`people\` count is **100 or more** in the Stadium table.

Return \`id\`, \`visit_date\`, and \`people\`. Order by \`visit_date\` ascending.

### Table: Stadium

| Column     | Type |
|------------|------|
| id         | INT  |
| visit_date | DATE |
| people     | INT  |

### Example Input Data
| id | visit_date | people |
|----|------------|--------|
| 1  | 2017-01-01 | 10     |
| 2  | 2017-01-02 | 109    |
| 3  | 2017-01-03 | 150    |
| 4  | 2017-01-04 | 99     |
| 5  | 2017-01-05 | 145    |
| 6  | 2017-01-06 | 1455   |
| 7  | 2017-01-07 | 199    |
| 8  | 2017-01-08 | 188    |

### Expected Output
\`\`\`
5|2017-01-05|145
6|2017-01-06|1455
7|2017-01-07|199
8|2017-01-08|188
\`\`\`

### Hints
- Self-join with 3 consecutive rows where all have people >= 100.
- Use \`DISTINCT\` and collect all involved rows.
- Order by \`visit_date ASC\`.`,
    constraints: [
      'Return id, visit_date, people.',
      'Only rows part of a 3+ consecutive run with people >= 100.',
      'Order by visit_date ASC.',
    ],
    databaseSchema: 'CREATE TABLE Stadium (id INT, visit_date DATE, people INT);',
    databaseSeed: 'INSERT INTO Stadium VALUES (1, "2017-01-01", 10), (2, "2017-01-02", 109), (3, "2017-01-03", 150), (4, "2017-01-04", 99), (5, "2017-01-05", 145), (6, "2017-01-06", 1455), (7, "2017-01-07", 199), (8, "2017-01-08", 188);',
    sampleOutput: '5|2017-01-05|145\n6|2017-01-06|1455\n7|2017-01-07|199\n8|2017-01-08|188',
    testCases: [
      { input: 'sql', expectedOutput: '5|2017-01-05|145\n6|2017-01-06|1455\n7|2017-01-07|199\n8|2017-01-08|188', isHidden: false },
      { input: 'sql', expectedOutput: '5|2017-01-05|145\n6|2017-01-06|1455\n7|2017-01-07|199\n8|2017-01-08|188', isHidden: true },
      { input: 'sql', expectedOutput: '5|2017-01-05|145\n6|2017-01-06|1455\n7|2017-01-07|199\n8|2017-01-08|188', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\n-- Hint: self-join three times on consecutive ids\n' },
  },

  // ─────────────────────────────────────────────
  // 23. Immediate Food Delivery (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Immediate Food Delivery',
    slug: 'immediate-food-delivery',
    difficulty: 'easy',
    type: 'sql',
    tags: ['AVG', 'CASE WHEN', 'percentage'],
    description: `## Problem Statement
Find the **percentage** of immediate orders in the first orders of each customer, rounded to **2 decimal places**.

An order is **immediate** if \`order_date = customer_pref_delivery_date\`.

The **first order** is the one with the minimum \`order_date\` for each customer.

### Table: Delivery

| Column                      | Type |
|-----------------------------|------|
| delivery_id                 | INT  |
| customer_id                 | INT  |
| order_date                  | DATE |
| customer_pref_delivery_date | DATE |

### Example Input Data
| delivery_id | customer_id | order_date | customer_pref_delivery_date |
|-------------|-------------|------------|-----------------------------|
| 1           | 1           | 2019-08-01 | 2019-08-02                  |
| 2           | 2           | 2019-08-02 | 2019-08-02                  |
| 3           | 1           | 2019-08-11 | 2019-08-11                  |
| 4           | 3           | 2019-08-24 | 2019-08-26                  |
| 5           | 3           | 2019-08-21 | 2019-08-22                  |
| 6           | 2           | 2019-08-11 | 2019-08-13                  |

### Expected Output
\`\`\`
50.00
\`\`\`

### Hints
- First find first order per customer using MIN(order_date).
- Among those, count how many are immediate.
- Return percentage as ROUND(100.0 * immediate_count / total, 2).`,
    constraints: [
      'Return a single column: immediate_percentage.',
      'Rounded to 2 decimal places.',
    ],
    databaseSchema: 'CREATE TABLE Delivery (delivery_id INT, customer_id INT, order_date DATE, customer_pref_delivery_date DATE);',
    databaseSeed: 'INSERT INTO Delivery VALUES (1,1,"2019-08-01","2019-08-02"), (2,2,"2019-08-02","2019-08-02"), (3,1,"2019-08-11","2019-08-11"), (4,3,"2019-08-24","2019-08-26"), (5,3,"2019-08-21","2019-08-22"), (6,2,"2019-08-11","2019-08-13");',
    sampleOutput: '50.00',
    testCases: [
      { input: 'sql', expectedOutput: '50.00', isHidden: false },
      { input: 'sql', expectedOutput: '50.00', isHidden: true },
      { input: 'sql', expectedOutput: '50.00', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT ROUND(100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*), 2) AS immediate_percentage\nFROM Delivery\nWHERE (customer_id, order_date) IN (\n  SELECT customer_id, MIN(order_date) FROM Delivery GROUP BY customer_id\n);\n' },
  },

  // ─────────────────────────────────────────────
  // 24. Game Play Analysis IV (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Game Play Analysis IV',
    slug: 'game-play-analysis-iv',
    difficulty: 'medium',
    type: 'sql',
    tags: ['subquery', 'DATE', 'retention', 'fraction'],
    description: `## Problem Statement
Find the **fraction of players** that logged in again **the day after** their first login day, **rounded to 2 decimal places**.

### Table: Activity

| Column       | Type |
|--------------|------|
| player_id    | INT  |
| device_id    | INT  |
| event_date   | DATE |
| games_played | INT  |

The primary key is (player_id, event_date).

### Example Input Data
| player_id | device_id | event_date | games_played |
|-----------|-----------|------------|--------------|
| 1         | 2         | 2016-03-01 | 5            |
| 1         | 2         | 2016-03-02 | 6            |
| 2         | 3         | 2017-06-25 | 1            |
| 3         | 1         | 2016-03-02 | 0            |
| 3         | 4         | 2018-07-03 | 5            |

### Expected Output
\`\`\`
0.33
\`\`\`

### Hints
- Find each player's first login: \`MIN(event_date)\`.
- Check if player also logged in on \`first_date + 1 day\`.
- Return \`ROUND(COUNT(day_after) / total_players, 2)\`.`,
    constraints: [
      'Return a single column: fraction (DECIMAL rounded to 2 places).',
    ],
    databaseSchema: 'CREATE TABLE Activity (player_id INT, device_id INT, event_date DATE, games_played INT);',
    databaseSeed: 'INSERT INTO Activity VALUES (1, 2, "2016-03-01", 5), (1, 2, "2016-03-02", 6), (2, 3, "2017-06-25", 1), (3, 1, "2016-03-02", 0), (3, 4, "2018-07-03", 5);',
    sampleOutput: '0.33',
    testCases: [
      { input: 'sql', expectedOutput: '0.33', isHidden: false },
      { input: 'sql', expectedOutput: '0.33', isHidden: true },
      { input: 'sql', expectedOutput: '0.33', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\n-- Hint: Find first login per player, then check if they logged in next day\n' },
  },

  // ─────────────────────────────────────────────
  // 25. Product Sales Analysis (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Product Sales Analysis',
    slug: 'product-sales-analysis',
    difficulty: 'easy',
    type: 'sql',
    tags: ['JOIN', 'basics', 'multi-table'],
    description: `## Problem Statement
Find the \`product_name\`, \`year\`, and \`price\` for each sale. Join the \`Sales\` and \`Product\` tables.

### Tables

**Sales**

| Column     | Type |
|------------|------|
| sale_id    | INT  |
| product_id | INT  |
| year       | INT  |
| quantity   | INT  |
| price      | INT  |

**Product**

| Column       | Type        |
|--------------|-------------|
| product_id   | INT         |
| product_name | VARCHAR(50) |

### Example Input Data

Products: iPhone(1), iPad(2)
Sales: iPhone sold in 2008 for 10000, iPhone sold in 2009 for 5000, iPad sold in 2011 for 9000

### Expected Output
\`\`\`
iPhone|2008|10000
iPhone|2009|5000
iPad|2011|9000
\`\`\`

### Hints
- \`JOIN Product ON Sales.product_id = Product.product_id\`.
- Select \`product_name\`, \`year\`, \`price\`.
- Order by product_name, then year.`,
    constraints: [
      'Return product_name, year, price.',
      'Order by product_name ASC, year ASC.',
    ],
    databaseSchema: 'CREATE TABLE Sales (sale_id INT, product_id INT, year INT, quantity INT, price INT); CREATE TABLE Product (product_id INT, product_name VARCHAR(50));',
    databaseSeed: 'INSERT INTO Product VALUES (1, "iPhone"), (2, "iPad"); INSERT INTO Sales VALUES (1, 1, 2008, 10, 10000), (2, 1, 2009, 10, 5000), (7, 2, 2011, 15, 9000);',
    sampleOutput: 'iPhone|2008|10000\niPhone|2009|5000\niPad|2011|9000',
    testCases: [
      { input: 'sql', expectedOutput: 'iPhone|2008|10000\niPhone|2009|5000\niPad|2011|9000', isHidden: false },
      { input: 'sql', expectedOutput: 'iPhone|2008|10000\niPhone|2009|5000\niPad|2011|9000', isHidden: true },
      { input: 'sql', expectedOutput: 'iPhone|2008|10000\niPhone|2009|5000\niPad|2011|9000', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT p.product_name, s.year, s.price\nFROM Sales s\nJOIN Product p ON s.product_id = p.product_id\nORDER BY p.product_name, s.year;\n' },
  },

  // ─────────────────────────────────────────────
  // 26. Reported Posts (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Reported Posts Summary',
    slug: 'reported-posts-summary',
    difficulty: 'medium',
    type: 'sql',
    tags: ['GROUP BY', 'DISTINCT', 'subquery', 'reporting'],
    description: `## Problem Statement
For each \`action_date\`, find the number of **posts reported as spam** (distinct \`post_id\` with action = 'report' and extra = 'spam').

### Table: Actions

| Column      | Type        |
|-------------|-------------|
| user_id     | INT         |
| post_id     | INT         |
| action_date | DATE        |
| action      | VARCHAR(15) |
| extra       | VARCHAR(20) |

### Example Input Data
| user_id | post_id | action_date | action | extra |
|---------|---------|-------------|--------|-------|
| 1       | 1       | 2019-07-01  | view   | NULL  |
| 1       | 1       | 2019-07-01  | like   | NULL  |
| 1       | 1       | 2019-07-01  | share  | NULL  |
| 2       | 4       | 2019-07-04  | view   | NULL  |
| 2       | 4       | 2019-07-04  | report | spam  |
| 3       | 4       | 2019-07-04  | view   | NULL  |
| 3       | 4       | 2019-07-04  | report | spam  |
| 4       | 3       | 2019-07-02  | view   | NULL  |
| 4       | 3       | 2019-07-02  | report | spam  |

### Expected Output
\`\`\`
2019-07-04|1
2019-07-02|1
\`\`\`

### Hints
- Filter \`action = 'report'\` and \`extra = 'spam'\`.
- Group by \`action_date\` and count \`DISTINCT post_id\`.
- Order by \`action_date ASC\`.`,
    constraints: [
      'Filter action = report and extra = spam.',
      'Count DISTINCT post_id per date.',
      'Return action_date, spam_posts_count.',
      'Order by action_date ASC.',
    ],
    databaseSchema: 'CREATE TABLE Actions (user_id INT, post_id INT, action_date DATE, action VARCHAR(15), extra VARCHAR(20));',
    databaseSeed: 'INSERT INTO Actions VALUES (1,1,"2019-07-01","view",NULL),(1,1,"2019-07-01","like",NULL),(1,1,"2019-07-01","share",NULL),(2,4,"2019-07-04","view",NULL),(2,4,"2019-07-04","report","spam"),(3,4,"2019-07-04","view",NULL),(3,4,"2019-07-04","report","spam"),(4,3,"2019-07-02","view",NULL),(4,3,"2019-07-02","report","spam");',
    sampleOutput: '2019-07-02|1\n2019-07-04|1',
    testCases: [
      { input: 'sql', expectedOutput: '2019-07-02|1\n2019-07-04|1', isHidden: false },
      { input: 'sql', expectedOutput: '2019-07-02|1\n2019-07-04|1', isHidden: true },
      { input: 'sql', expectedOutput: '2019-07-02|1\n2019-07-04|1', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT action_date, COUNT(DISTINCT post_id) AS spam_posts_count\nFROM Actions\nWHERE action = "report" AND extra = "spam"\nGROUP BY action_date\nORDER BY action_date;\n' },
  },

  // ─────────────────────────────────────────────
  // 27. Monthly Transactions (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Monthly Transactions Summary',
    slug: 'monthly-transactions-summary',
    difficulty: 'medium',
    type: 'sql',
    tags: ['GROUP BY', 'SUM', 'CASE WHEN', 'date functions'],
    description: `## Problem Statement
Find for each \`month\` and \`country\`: the number of transactions, total amount, number of approved transactions, and total approved amount.

### Table: Transactions

| Column      | Type        |
|-------------|-------------|
| id          | INT (PK)    |
| country     | VARCHAR(10) |
| state       | VARCHAR(10) |
| amount      | INT         |
| trans_date  | DATE        |

\`state\` is either \`'approved'\` or \`'declined'\`.

### Example Input Data
| id | country | state    | amount | trans_date |
|----|---------|----------|--------|------------|
| 121| US      | approved | 1000   | 2018-12-18 |
| 122| US      | declined | 2000   | 2018-12-19 |
| 123| US      | approved | 2000   | 2019-01-01 |
| 124| DE      | approved | 2000   | 2019-01-07 |

### Expected Output
\`\`\`
2018-12|US|2|3000|1|1000
2019-01|US|1|2000|1|2000
2019-01|DE|1|2000|1|2000
\`\`\`

### Hints
- Use \`DATE_FORMAT(trans_date, '%Y-%m')\` for month.
- Use \`COUNT(*)\`, \`SUM(amount)\` for totals.
- Use \`SUM(CASE WHEN state='approved' THEN 1 ELSE 0 END)\` for approved count.
- Group by month, country. Order by month, country.`,
    constraints: [
      'Return month (YYYY-MM), country, trans_count, total_amount, approved_count, approved_total_amount.',
      'Order by month ASC, country ASC.',
    ],
    databaseSchema: 'CREATE TABLE Transactions (id INT, country VARCHAR(10), state VARCHAR(10), amount INT, trans_date DATE);',
    databaseSeed: 'INSERT INTO Transactions VALUES (121,"US","approved",1000,"2018-12-18"),(122,"US","declined",2000,"2018-12-19"),(123,"US","approved",2000,"2019-01-01"),(124,"DE","approved",2000,"2019-01-07");',
    sampleOutput: '2018-12|US|2|3000|1|1000\n2019-01|DE|1|2000|1|2000\n2019-01|US|1|2000|1|2000',
    testCases: [
      { input: 'sql', expectedOutput: '2018-12|US|2|3000|1|1000\n2019-01|DE|1|2000|1|2000\n2019-01|US|1|2000|1|2000', isHidden: false },
      { input: 'sql', expectedOutput: '2018-12|US|2|3000|1|1000\n2019-01|DE|1|2000|1|2000\n2019-01|US|1|2000|1|2000', isHidden: true },
      { input: 'sql', expectedOutput: '2018-12|US|2|3000|1|1000\n2019-01|DE|1|2000|1|2000\n2019-01|US|1|2000|1|2000', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT DATE_FORMAT(trans_date, "%Y-%m") AS month, country,\n  COUNT(*) AS trans_count,\n  SUM(amount) AS total_amount,\n  SUM(CASE WHEN state = "approved" THEN 1 ELSE 0 END) AS approved_count,\n  SUM(CASE WHEN state = "approved" THEN amount ELSE 0 END) AS approved_total_amount\nFROM Transactions\nGROUP BY month, country\nORDER BY month, country;\n' },
  },

  // ─────────────────────────────────────────────
  // 28. Customers Who Bought All Products (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Customers Who Bought All Products',
    slug: 'customers-bought-all-products',
    difficulty: 'medium',
    type: 'sql',
    tags: ['GROUP BY', 'HAVING', 'COUNT DISTINCT', 'subquery'],
    description: `## Problem Statement
Find \`customer_id\`s of customers who have **purchased every product** listed in the \`Product\` table.

### Tables

**Customer**

| Column      | Type |
|-------------|------|
| customer_id | INT  |
| product_key | INT  |

**Product**

| Column      | Type |
|-------------|------|
| product_key | INT (PK) |

### Example Input Data

Products: key 5, key 6
Customer purchases: Customer 1 → keys 5,6; Customer 2 → key 5; Customer 3 → keys 5,6

### Expected Output
\`\`\`
1
3
\`\`\`

### Hints
- Count the number of products in the Product table.
- Group Customer by customer_id, count DISTINCT product_key.
- Filter with HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product).
- Order by customer_id ASC.`,
    constraints: [
      'Customers must have purchased ALL products.',
      'Return customer_id column.',
      'Order by customer_id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Customer (customer_id INT, product_key INT); CREATE TABLE Product (product_key INT PRIMARY KEY);',
    databaseSeed: 'INSERT INTO Product VALUES (5), (6); INSERT INTO Customer VALUES (1, 5), (2, 6), (3, 5), (3, 6), (1, 6);',
    sampleOutput: '1\n3',
    testCases: [
      { input: 'sql', expectedOutput: '1\n3', isHidden: false },
      { input: 'sql', expectedOutput: '1\n3', isHidden: true },
      { input: 'sql', expectedOutput: '1\n3', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT customer_id\nFROM Customer\nGROUP BY customer_id\nHAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product)\nORDER BY customer_id;\n' },
  },

  // ─────────────────────────────────────────────
  // 29. Find Users With Valid E-Mails (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Find Users With Valid E-Mails',
    slug: 'users-valid-emails',
    difficulty: 'easy',
    type: 'sql',
    tags: ['REGEXP', 'pattern matching', 'filtering'],
    description: `## Problem Statement
Find users with **valid email addresses**. A valid email satisfies:
- Prefix (before @): starts with a letter, may contain letters, digits, underscores, periods, and/or dashes.
- Domain: must be **@leetcode.com**.

Return \`user_id\`, \`name\`, and \`mail\`. Order by \`user_id\`.

### Table: Users

| Column  | Type         |
|---------|--------------|
| user_id | INT (PK)     |
| name    | VARCHAR(50)  |
| mail    | VARCHAR(100) |

### Example Input Data
| user_id | name      | mail                        |
|---------|-----------|-----------------------------|
| 1       | Winston   | winston@leetcode.com        |
| 2       | Jonathan  | jonathanisreal@leetcode.com |
| 3       | Annabelle | user.12@leetcode.com        |
| 4       | Sally     | sally.w@leetcode.com        |
| 5       | Marwan    | israel@leetcode.com         |
| 6       | David     | david69@gmail.com           |
| 7       | Shapiro   | .shapo@leetcode.com         |

### Expected Output
\`\`\`
1|Winston|winston@leetcode.com
2|Jonathan|jonathanisreal@leetcode.com
3|Annabelle|user.12@leetcode.com
4|Sally|sally.w@leetcode.com
5|Marwan|israel@leetcode.com
\`\`\`

### Hints
- Use \`REGEXP '^[a-zA-Z][a-zA-Z0-9._-]*@leetcode\\\\.com$'\`.
- The prefix must START with a letter (not digit, underscore, dot, or dash).`,
    constraints: [
      'Email must match valid pattern and end with @leetcode.com.',
      'Return user_id, name, mail.',
      'Order by user_id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Users (user_id INT, name VARCHAR(50), mail VARCHAR(100));',
    databaseSeed: 'INSERT INTO Users VALUES (1,"Winston","winston@leetcode.com"),(2,"Jonathan","jonathanisreal@leetcode.com"),(3,"Annabelle","user.12@leetcode.com"),(4,"Sally","sally.w@leetcode.com"),(5,"Marwan","israel@leetcode.com"),(6,"David","david69@gmail.com"),(7,"Shapiro",".shapo@leetcode.com");',
    sampleOutput: '1|Winston|winston@leetcode.com\n2|Jonathan|jonathanisreal@leetcode.com\n3|Annabelle|user.12@leetcode.com\n4|Sally|sally.w@leetcode.com\n5|Marwan|israel@leetcode.com',
    testCases: [
      { input: 'sql', expectedOutput: '1|Winston|winston@leetcode.com\n2|Jonathan|jonathanisreal@leetcode.com\n3|Annabelle|user.12@leetcode.com\n4|Sally|sally.w@leetcode.com\n5|Marwan|israel@leetcode.com', isHidden: false },
      { input: 'sql', expectedOutput: '1|Winston|winston@leetcode.com\n2|Jonathan|jonathanisreal@leetcode.com\n3|Annabelle|user.12@leetcode.com\n4|Sally|sally.w@leetcode.com\n5|Marwan|israel@leetcode.com', isHidden: true },
      { input: 'sql', expectedOutput: '1|Winston|winston@leetcode.com\n2|Jonathan|jonathanisreal@leetcode.com\n3|Annabelle|user.12@leetcode.com\n4|Sally|sally.w@leetcode.com\n5|Marwan|israel@leetcode.com', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\nSELECT user_id, name, mail\nFROM Users\nWHERE mail REGEXP "^[a-zA-Z][a-zA-Z0-9._-]*@leetcode\\\\.com$"\nORDER BY user_id;\n' },
  },

  // ─────────────────────────────────────────────
  // 30. Median Employee Salary (NEW)
  // ─────────────────────────────────────────────
  {
    title: 'Median Employee Salary',
    slug: 'median-employee-salary',
    difficulty: 'hard',
    type: 'sql',
    tags: ['median', 'self-join', 'subquery', 'advanced'],
    description: `## Problem Statement
Find the **median salary** of each company. Return \`id\`, \`company\`, and \`salary\` for rows that hold the median salary in their company.

### Table: Employee

| Column  | Type        |
|---------|-------------|
| id      | INT (PK)    |
| company | VARCHAR(10) |
| salary  | INT         |

### Example Input Data
| id | company | salary |
|----|---------|--------|
| 1  | A       | 2341   |
| 2  | A       | 341    |
| 3  | A       | 15     |
| 4  | A       | 15314  |
| 5  | A       | 451    |
| 6  | A       | 513    |
| 7  | B       | 15     |
| 8  | B       | 13     |
| 9  | B       | 1154   |
| 10 | B       | 1345   |
| 11 | B       | 1221   |
| 12 | B       | 234    |
| 13 | C       | 2345   |
| 14 | C       | 2645   |
| 15 | C       | 2645   |
| 16 | C       | 2652   |
| 17 | C       | 65     |

### Expected Output
\`\`\`
5|A|451
6|A|513
12|B|234
9|B|1154
14|C|2645
\`\`\`

### Hints
- For each employee, count how many employees in the same company have salary <= theirs and >= theirs.
- A median row satisfies: \`COUNT(salary <= s.salary) >= n/2\` AND \`COUNT(salary >= s.salary) >= n/2\` where n = company size.
- Order by id ASC.`,
    constraints: [
      'Return id, company, salary of median rows.',
      'Handle both odd and even company sizes.',
      'Order by id ASC.',
    ],
    databaseSchema: 'CREATE TABLE Employee (id INT, company VARCHAR(10), salary INT);',
    databaseSeed: 'INSERT INTO Employee VALUES (1,"A",2341),(2,"A",341),(3,"A",15),(4,"A",15314),(5,"A",451),(6,"A",513),(7,"B",15),(8,"B",13),(9,"B",1154),(10,"B",1345),(11,"B",1221),(12,"B",234),(13,"C",2345),(14,"C",2645),(15,"C",2645),(16,"C",2652),(17,"C",65);',
    sampleOutput: '5|A|451\n6|A|513\n12|B|234\n9|B|1154\n14|C|2645',
    testCases: [
      { input: 'sql', expectedOutput: '5|A|451\n6|A|513\n12|B|234\n9|B|1154\n14|C|2645', isHidden: false },
      { input: 'sql', expectedOutput: '5|A|451\n6|A|513\n12|B|234\n9|B|1154\n14|C|2645', isHidden: true },
      { input: 'sql', expectedOutput: '5|A|451\n6|A|513\n12|B|234\n9|B|1154\n14|C|2645', isHidden: true },
    ],
    starterCode: { sql: '-- Write your SQL query below\n-- Hint: use a self-join or subquery comparing salary counts per company\n' },
  },

];

async function runSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Upserting 30 SQL problems...');

    for (const p of sqlProblems) {
      await Problem.findOneAndUpdate(
        { slug: p.slug },
        { ...p, type: 'sql' },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`✓ Upserted: ${p.title}`);
    }

    console.log('\n✅ Successfully seeded 30 SQL problems!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runSeed();
