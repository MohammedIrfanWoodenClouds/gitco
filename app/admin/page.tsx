import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { REPORTS } from '@/lib/reports';
import Navbar from '@/components/Navbar';

const ICONS: Record<string, string> = {
  'plant-hire': '🏗',
  'fleet': '🚛',
  'auto-services': '🔧',
};

export default async function Admin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/login');

  return (
    <div className="shell">
      <Navbar username={session.username} role={session.role} />

      <div className="page-content">
        <div className="page-header">
          <div className="page-eyebrow">Admin Panel</div>
          <h1 className="page-title">Report Uploads</h1>
          <p className="page-desc">Upload and publish Excel workbooks for each report dashboard.</p>
        </div>

        <div className="info-banner">
          <div className="info-banner-icon">ℹ️</div>
          <div className="info-banner-text">
            <strong>Publishing workflow:</strong> Each upload is validated against the report's required workbook
            sheets before being saved. The supplied dashboard HTML remains the visual source of truth.
          </div>
        </div>

        <div className="upload-grid">
          {Object.entries(REPORTS).map(([code, report]) => (
            <div className="upload-card" key={code}>
              <div className="report-icon" style={{ marginBottom: 16 }}>{ICONS[code] ?? '📊'}</div>
              <div className="report-tag">Report Upload</div>
              <div className="report-title" style={{ marginBottom: 6 }}>{report.name}</div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20 }}>
                Expected workbook: <span style={{ color: 'var(--text-sub)' }}>{report.source}</span>
              </p>

              <form action="/api/upload" method="post" encType="multipart/form-data">
                <input type="hidden" name="report" value={code} />
                <div className="field">
                  <label htmlFor={`${code}-file`}>Excel Workbook (.xlsx / .xls)</label>
                  <input id={`${code}-file`} type="file" name="file" accept=".xlsx,.xls" required />
                </div>
                <button className="btn btn-gold w-full" type="submit" style={{ justifyContent: 'center', marginTop: 8 }}>
                  ↑ Validate &amp; Publish
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
