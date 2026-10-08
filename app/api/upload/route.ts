import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { REPORTS, ReportCode } from '@/lib/reports';
import { getSupabaseAdmin } from '@/lib/supabase';
import { localUpload, localInsertVersion } from '@/lib/local-store';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST to upload report files.' },
    { status: 405 }
  );
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data payload.' }, { status: 400 });
    }

    const code = String(form.get('report') || '') as ReportCode;
    const file = form.get('file');

    if (!(code in REPORTS) || !(file instanceof File)) {
      return NextResponse.json({ error: 'Invalid report selection or missing file.' }, { status: 400 });
    }

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      return NextResponse.json({ error: 'Only .xlsx and .xls files are accepted.' }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(bytes, { type: 'array', cellDates: true });
    } catch (err) {
      console.error('Failed to parse excel workbook:', err);
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
      const bucketName = 'report-files';
      const contentType = file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      let upload = await supabase.storage.from(bucketName).upload(storagePath, bytes, {
        contentType,
        upsert: false
      });

      // Auto-create bucket if missing and retry upload
      if (upload.error && (upload.error.message.includes('Bucket not found') || upload.error.message.toLowerCase().includes('not found'))) {
        console.log(`Bucket "${bucketName}" not found. Creating bucket automatically...`);
        const { error: createErr } = await supabase.storage.createBucket(bucketName, {
          public: false,
          allowedMimeTypes: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/octet-stream'
          ]
        });

        if (!createErr || createErr.message.includes('already exists')) {
          upload = await supabase.storage.from(bucketName).upload(storagePath, bytes, {
            contentType,
            upsert: false
          });
        }
      }

      if (upload.error) {
        console.error('Supabase storage upload error:', upload.error);
        return NextResponse.json(
          { error: `Storage upload failed: ${upload.error.message}. Please ensure the "${bucketName}" bucket exists in Supabase Storage.` },
          { status: 500 }
        );
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
        console.error('Supabase db insert error:', insert.error);
        await supabase.storage.from(bucketName).remove([storagePath]);
        return NextResponse.json(
          { error: `Database version save failed: ${insert.error.message}. Make sure to run supabase.sql to create the report_versions table.` },
          { status: 500 }
        );
      }

      await supabase
        .from('report_versions')
        .update({ status: 'archived' })
        .eq('report_code', code)
        .neq('id', insert.data.id)
        .eq('status', 'active');
    } else {
      // ── Local filesystem / serverless fallback ─────────────────────────────────
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
  } catch (err) {
    console.error('Unhandled upload error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
