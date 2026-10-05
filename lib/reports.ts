export const REPORTS = {
  'plant-hire': {
    name: 'Plant Hire & Sales',
    html: '/reports/plant-hire.html',
    expected: ['Apr -2026', 'May - 2026', 'June -2026', 'Product sales details', 'New Order Status'],
    source: 'GITCO Plant Hire and Sales(1).xlsx'
  },
  fleet: {
    name: 'Fleet Dashboard',
    html: '/reports/fleet.html',
    expected: ['Fleet Master', 'Daily Maintenance Log', 'Routine Maintenance Log', 'Dashboard Data', 'Lists'],
    source: 'GITCO Fleet Dashboard(1).xlsx'
  },
  'auto-services': {
    name: 'Auto Services',
    html: '/reports/auto-services.html',
    expected: ['Performance Dashboard', 'Manager Status Report', 'JULY-2026', 'AUG-2026', 'Attendance Sheet', 'Inventory', 'Purchase'],
    source: 'GITCO Auto Services Dashboard(1).xlsx'
  }
} as const;

export type ReportCode = keyof typeof REPORTS;
