export interface Employee {
  id: string
  name: string
  email: string
  salary: number
  bonus: number
  equity: number
  cohort: string
  positionId: string
  gender: 'M' | 'F'
}

export interface Position {
  id: string
  title: string
  employeeCount: number
  sameRoleMedian: number
  cohortDistribution: { name: string; count: number }[]
  employees: Employee[]
}

export const positions: Position[] = [
  {
    id: 'p1',
    title: 'Software Engineer II',
    employeeCount: 12,
    sameRoleMedian: 135000,
    cohortDistribution: [
      { name: '0-1 Yr', count: 3 },
      { name: '1-3 Yrs', count: 6 },
      { name: '3-5 Yrs', count: 2 },
      { name: '5+ Yrs', count: 1 },
    ],
    employees: [
      { id: 'e1', name: 'Alice Chen', email: 'alice@company.com', salary: 138000, bonus: 15000, equity: 40000, cohort: '1-3 Yrs', positionId: 'p1', gender: 'F' },
      { id: 'e2', name: 'Bob Smith', email: 'bob@company.com', salary: 132000, bonus: 12000, equity: 35000, cohort: '1-3 Yrs', positionId: 'p1', gender: 'M' },
      { id: 'e3', name: 'Charlie Davis', email: 'charlie@company.com', salary: 128000, bonus: 10000, equity: 30000, cohort: '0-1 Yr', positionId: 'p1', gender: 'M' },
      { id: 'e4', name: 'Diana Prince', email: 'diana@company.com', salary: 145000, bonus: 18000, equity: 45000, cohort: '3-5 Yrs', positionId: 'p1', gender: 'F' },
      { id: 'e13', name: 'Ethan Park', email: 'ethan@company.com', salary: 126000, bonus: 9000, equity: 28000, cohort: '0-1 Yr', positionId: 'p1', gender: 'M' },
      { id: 'e14', name: 'Fatima Al-Hassan', email: 'fatima@company.com', salary: 134000, bonus: 13000, equity: 36000, cohort: '1-3 Yrs', positionId: 'p1', gender: 'F' },
      { id: 'e15', name: 'George Tan', email: 'george@company.com', salary: 130000, bonus: 11000, equity: 32000, cohort: '1-3 Yrs', positionId: 'p1', gender: 'M' },
      { id: 'e16', name: 'Hannah Lee', email: 'hannah@company.com', salary: 136000, bonus: 14000, equity: 38000, cohort: '1-3 Yrs', positionId: 'p1', gender: 'F' },
      { id: 'e17', name: 'Irina Petrov', email: 'irina@company.com', salary: 122000, bonus: 8000, equity: 25000, cohort: '0-1 Yr', positionId: 'p1', gender: 'F' },
      { id: 'e18', name: 'Jasmine Obi', email: 'jasmine@company.com', salary: 140000, bonus: 16000, equity: 42000, cohort: '1-3 Yrs', positionId: 'p1', gender: 'F' },
      { id: 'e19', name: 'Kevin Nguyen', email: 'kevin@company.com', salary: 148000, bonus: 19000, equity: 48000, cohort: '3-5 Yrs', positionId: 'p1', gender: 'M' },
      { id: 'e20', name: 'Laura Moss', email: 'laura@company.com', salary: 155000, bonus: 22000, equity: 55000, cohort: '5+ Yrs', positionId: 'p1', gender: 'F' },
    ],
  },
  {
    id: 'p2',
    title: 'Product Manager',
    employeeCount: 8,
    sameRoleMedian: 145000,
    cohortDistribution: [
      { name: '0-1 Yr', count: 1 },
      { name: '1-3 Yrs', count: 4 },
      { name: '3-5 Yrs', count: 2 },
      { name: '5+ Yrs', count: 1 },
    ],
    employees: [
      { id: 'e5', name: 'Eve Adams', email: 'eve@company.com', salary: 148000, bonus: 20000, equity: 50000, cohort: '3-5 Yrs', positionId: 'p2', gender: 'F' },
      { id: 'e6', name: 'Frank Wright', email: 'frank@company.com', salary: 158000, bonus: 18000, equity: 45000, cohort: '1-3 Yrs', positionId: 'p2', gender: 'M' },
      { id: 'e7', name: 'Grace Hopper', email: 'grace@company.com', salary: 155000, bonus: 25000, equity: 60000, cohort: '5+ Yrs', positionId: 'p2', gender: 'F' },
      { id: 'e10', name: 'Jana Okafor', email: 'jana@company.com', salary: 162000, bonus: 22000, equity: 55000, cohort: '3-5 Yrs', positionId: 'p2', gender: 'F' },
      { id: 'e21', name: 'Keiko Tanaka', email: 'keiko@company.com', salary: 139000, bonus: 17000, equity: 42000, cohort: '0-1 Yr', positionId: 'p2', gender: 'F' },
      { id: 'e22', name: 'Liam Burke', email: 'liam@company.com', salary: 152000, bonus: 21000, equity: 52000, cohort: '1-3 Yrs', positionId: 'p2', gender: 'M' },
      { id: 'e23', name: 'Maya Patel', email: 'maya@company.com', salary: 144000, bonus: 19000, equity: 47000, cohort: '1-3 Yrs', positionId: 'p2', gender: 'F' },
      { id: 'e24', name: 'Noah Reyes', email: 'noah@company.com', salary: 150000, bonus: 20000, equity: 49000, cohort: '1-3 Yrs', positionId: 'p2', gender: 'M' },
    ],
  },
  {
    id: 'p3',
    title: 'Account Executive',
    employeeCount: 15,
    sameRoleMedian: 95000,
    cohortDistribution: [
      { name: '0-1 Yr', count: 5 },
      { name: '1-3 Yrs', count: 7 },
      { name: '3-5 Yrs', count: 2 },
      { name: '5+ Yrs', count: 1 },
    ],
    employees: [
      { id: 'e8', name: 'Hank Hill', email: 'hank@company.com', salary: 98000, bonus: 40000, equity: 10000, cohort: '1-3 Yrs', positionId: 'p3', gender: 'M' },
      { id: 'e9', name: 'Ivy League', email: 'ivy@company.com', salary: 92000, bonus: 38000, equity: 10000, cohort: '0-1 Yr', positionId: 'p3', gender: 'F' },
      { id: 'e11', name: 'Marcus Webb', email: 'marcus@company.com', salary: 96000, bonus: 41000, equity: 12000, cohort: '1-3 Yrs', positionId: 'p3', gender: 'M' },
      { id: 'e12', name: 'Priya Nair', email: 'priya@company.com', salary: 91000, bonus: 37000, equity: 9000, cohort: '0-1 Yr', positionId: 'p3', gender: 'F' },
      { id: 'e25', name: 'Quinn Torres', email: 'quinn@company.com', salary: 102000, bonus: 43000, equity: 13000, cohort: '1-3 Yrs', positionId: 'p3', gender: 'F' },
      { id: 'e26', name: 'Ryan Kim', email: 'ryan@company.com', salary: 88000, bonus: 35000, equity: 8000, cohort: '0-1 Yr', positionId: 'p3', gender: 'M' },
      { id: 'e27', name: 'Sofia Mendez', email: 'sofia@company.com', salary: 94000, bonus: 39000, equity: 11000, cohort: '1-3 Yrs', positionId: 'p3', gender: 'F' },
      { id: 'e28', name: 'Tyler Brooks', email: 'tyler@company.com', salary: 99000, bonus: 42000, equity: 13000, cohort: '1-3 Yrs', positionId: 'p3', gender: 'M' },
      { id: 'e29', name: 'Uma Patel', email: 'uma@company.com', salary: 86000, bonus: 34000, equity: 8000, cohort: '0-1 Yr', positionId: 'p3', gender: 'F' },
      { id: 'e30', name: 'Victor Osei', email: 'victor@company.com', salary: 105000, bonus: 45000, equity: 15000, cohort: '3-5 Yrs', positionId: 'p3', gender: 'M' },
      { id: 'e31', name: 'Wendy Zhao', email: 'wendy@company.com', salary: 93000, bonus: 38000, equity: 10000, cohort: '0-1 Yr', positionId: 'p3', gender: 'F' },
      { id: 'e32', name: 'Xavier Diallo', email: 'xavier@company.com', salary: 100000, bonus: 42000, equity: 13000, cohort: '1-3 Yrs', positionId: 'p3', gender: 'M' },
      { id: 'e33', name: 'Yuki Sato', email: 'yuki@company.com', salary: 97000, bonus: 40000, equity: 11000, cohort: '1-3 Yrs', positionId: 'p3', gender: 'F' },
      { id: 'e34', name: 'Zara Ahmed', email: 'zara@company.com', salary: 108000, bonus: 47000, equity: 16000, cohort: '3-5 Yrs', positionId: 'p3', gender: 'F' },
      { id: 'e35', name: 'Andre Dubois', email: 'andre@company.com', salary: 112000, bonus: 50000, equity: 18000, cohort: '5+ Yrs', positionId: 'p3', gender: 'M' },
    ],
  },
]

export const allEmployees = positions.flatMap(p => p.employees)
