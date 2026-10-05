import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { REPORTS } from '@/lib/reports';
import ReportViewer from '@/components/ReportViewer';

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  const report = REPORTS['auto-services'];
  return <ReportViewer src={report.html} title={report.name} />;
}
