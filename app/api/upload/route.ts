import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { REPORTS, ReportCode } from '@/lib/reports';
import { getSupabaseAdmin } from '@/lib/supabase';
import { localUpload, localInsertVersion } from '@/lib/local-store';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const code = String(form.get('report') || '') as ReportCode;
  const file = form.get('file');

  if (!(code in REPORTS) || !(file instanceof File)) {
    return NextResponse.json({ error: 'Invalid report or file.' }, { status: 400 });
  }

  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    return NextResponse.json({ error: 'Only .xlsx and .xls files are accepted.' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(bytes, { type: 'array', cellDates: true });
  } catch {
    return NextResponse.json({ error: 'The uploaded file is not a readable Excel workbook.' }, { status: 422 });
  }

  const required = REPORTS[code].expected;
  const missing = required.filter((sheet) => !workbook.SheetNames.includes(sheet));
  if (missing.length) {
    return NextResponse.json({
      error: 'Workbook structure validation failed.',
      missing,
      available: workbook.SheetNames
    }, { status: 422 });
  }

  const sheetStats = workbook.SheetNames.map((name) => {
    const range = workbook.Sheets[name]?.['!ref'];
    const decoded = range ? XLSX.utils.decode_range(range) : null;
    return {
      name,
      rows: decoded ? decoded.e.r + 1 : 0,
      columns: decoded ? decoded.e.c + 1 : 0
    };
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const storagePath = `${code}/${timestamp}-${file.name}`;

  const supabase = getSupabaseAdmin();

  if (supabase) {
    // ── Supabase path ──────────────────────────────────────────────────────────
    const upload = await supabase.storage.from('report-files').upload(storagePath, bytes, {
      contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: false
    });
    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }
    const insert = await supabase.from('report_versions').insert({
      report_code: code,
      file_name: file.name,
      storage_path: storagePath,
      uploaded_by: session.username,
      status: 'active',
      metadata: { sheets: sheetStats }
    }).select('id').single();
    if (insert.error) {
      await supabase.storage.from('report-files').remove([storagePath]);
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }
    await supabase
      .from('report_versions')
      .update({ status: 'archived' })
      .eq('report_code', code)
      .neq('id', insert.data.id)
      .eq('status', 'active');
  } else {
    // ── Local filesystem fallback (no Supabase configured) ─────────────────────
    localUpload(storagePath, bytes);
    localInsertVersion({
      report_code: code,
      file_name: file.name,
      storage_path: storagePath,
      uploaded_at: new Date().toISOString(),
      uploaded_by: session.username,
      status: 'active',
      metadata: { sheets: sheetStats, local: true }
    });
  }

  return NextResponse.json({
    ok: true,
    report: code,
    fileName: file.name,
    storagePath,
    sheets: sheetStats,
    storage: supabase ? 'supabase' : 'local'
  });
}
