'use client';
interface ReportViewerProps { src: string; title: string; }
export default function ReportViewer({ src, title }: ReportViewerProps) {
  return (
    <div className="report-shell">
      <div className="report-topbar">
        <div className="report-topbar-left">
          <a className="back-btn" href="/reports">← Back</a>
          <span className="report-label">{title}</span>
        </div>
        <form action="/api/logout" method="post">
          <button className="btn btn-sm btn-ghost btn-danger" type="submit">Sign out</button>
        </form>
      </div>
      <iframe className="report-frame" src={src} title={title} />
    </div>
  );
}
