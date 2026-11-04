/** Download rows as a CSV file that opens correctly in Excel (UTF-8 with BOM). */
export function downloadCsv(filename, headers, rows) {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
