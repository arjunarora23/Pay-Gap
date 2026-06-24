export const salaryData = {
  currentSalary: {
    components: {
      basicSalary: {
        amount: 720_000,
        currency: 'NOK',
      },
    },
  },
  salaryBand: {
    position: {
      title: 'SSE-2',
    },
    min: 620_000,
    max: 900_000,
  },
  comparison: {
    cohortSize: 47,
    sameRoleMedian: 758_000,
    percentile: 0.36,
    P25Density: 35,
    P50Density: 25,
    P75Density: 25,
    P100Density: 15,
    yourPositionVsMedian: -5.01,
    maleMedian: 752_000,
    femaleMedian: 770_000,
  },
} as const

export const employeeData = {
  name: 'Alex Smith',
  title: 'Senior Software Engineer',
  managerName: 'Sarah Jenkins',
} as const
