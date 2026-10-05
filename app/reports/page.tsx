import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { REPORTS } from '@/lib/reports';
import Navbar from '@/components/Navbar';

const ICONS: Record<string, string> = {
  'plant-hire': '🏗',
  'fleet': '🚛',
  'auto-services': '🔧',
};

const DESCS: Record<string, string> = {
  'plant-hire':    'Heavy equipment utilisation, revenue, plant rentals and product sales performance.',
  'fleet':         'Vehicle locations, fuel consumption, daily maintenance logs and driver performance.',
  'auto-services': 'Service requests, maintenance schedules, parts inventory and attendance tracking.',
};

export default async function Reports() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="shell">
      <Navbar username={session.username} role={session.role} showAdmin />

      <div className="page-content">
        <div className="page-header">
          <div className="page-eyebrow">Management Dashboards</div>
          <h1 className="page-title">Report Dashboards</h1>
          <p className="page-desc">Select a report to open the live dashboard.</p>
        </div>

        <div className="report-grid">
          {Object.entries(REPORTS).map(([code, report]) => (
            <a className="report-card" key={code} href={`/reports/${code}`}>
              <div className="report-icon">{ICONS[code] ?? '📊'}</div>
              <div className="report-tag">GITCO Report</div>
              <div className="report-title">{report.name}</div>
              <div className="report-desc">{DESCS[code] ?? ''}</div>
              <div className="report-link">Open Dashboard <span>→</span></div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
