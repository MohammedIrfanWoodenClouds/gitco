/**
 * Local-filesystem fallback used when Supabase is not configured.
 * Files are saved to <project-root>/local-uploads/<path>.
 * Version records are tracked in <project-root>/local-uploads/versions.json.
 */

import fs from 'fs';
import path from 'path';

const BASE = path.join(process.cwd(), 'local-uploads');
const VERSIONS_FILE = path.join(BASE, 'versions.json');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function localUpload(storagePath: string, bytes: Uint8Array): void {
  const dest = path.join(BASE, storagePath);
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, Buffer.from(bytes));
}

export interface VersionRecord {
  id: string;
  report_code: string;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
  uploaded_by: string;
  status: 'active' | 'archived' | 'pending';
  metadata: Record<string, unknown>;
}

function readVersions(): VersionRecord[] {
  try {
    return JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeVersions(records: VersionRecord[]) {
  ensureDir(BASE);
  fs.writeFileSync(VERSIONS_FILE, JSON.stringify(records, null, 2));
}

export function localInsertVersion(record: Omit<VersionRecord, 'id'>): VersionRecord {
  const versions = readVersions();
  for (const v of versions) {
    if (v.report_code === record.report_code && v.status === 'active') {
      v.status = 'archived';
    }
  }
  const newRecord: VersionRecord = { id: `local-${Date.now()}`, ...record };
  versions.push(newRecord);
  writeVersions(versions);
  return newRecord;
}

export function localGetVersions(reportCode?: string): VersionRecord[] {
  const versions = readVersions();
  return reportCode ? versions.filter((v) => v.report_code === reportCode) : versions;
}
