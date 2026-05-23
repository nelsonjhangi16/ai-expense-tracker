// hooks/useExport.jsx

export function useExport() {

  // ================= CSV =================
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows    = data.map((row) =>
      headers.map((h) => {
        const val = row[h] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);

    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ================= PDF =================
  const exportPDF = (data, filename, title) => {
    if (!data || data.length === 0) return;

    const headers = ["Title", "Category", "Amount", "Date", "Recurring"];

    const rows = data.map((item) => [
      item.title     || "-",
      item.category  || "-",
      `$${Number(item.amount || 0).toFixed(2)}`,
      item.date ? new Date(item.date).toLocaleDateString() : "-",
      item.recurring && item.recurring !== "none" ? item.recurring : "-",
    ]);

    const total = data.reduce((s, i) => s + Number(i.amount || 0), 0);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
            color: #0f172a;
            padding: 40px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }
          .header h1 { font-size: 28px; font-weight: 700; color: #0f172a; }
          .header p  { font-size: 13px; color: #64748b; margin-top: 4px; }
          .badge {
            background: #6366f1;
            color: white;
            padding: 6px 16px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
          }
          .summary {
            display: flex;
            gap: 16px;
            margin-bottom: 28px;
          }
          .summary-card {
            flex: 1;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 20px;
          }
          .summary-card p  { font-size: 12px; color: #64748b; margin-bottom: 4px; }
          .summary-card h2 { font-size: 22px; font-weight: 700; }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          }
          thead tr { background: #6366f1; color: white; }
          thead th {
            padding: 12px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          tbody tr { border-bottom: 1px solid #f1f5f9; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:nth-child(even) { background: #f8fafc; }
          tbody td { padding: 11px 16px; font-size: 13px; color: #334155; }
          .amount { font-weight: 600; color: #0f172a; }
          .footer {
            margin-top: 24px;
            text-align: right;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${title}</h1>
            <p>Generated on ${new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}</p>
          </div>
          <span class="badge">${data.length} Records</span>
        </div>

        <div class="summary">
          <div class="summary-card">
            <p>Total Records</p>
            <h2>${data.length}</h2>
          </div>
          <div class="summary-card">
            <p>Total Amount</p>
            <h2>$${total.toFixed(2)}</h2>
          </div>
          <div class="summary-card">
            <p>Average</p>
            <h2>$${(total / data.length).toFixed(2)}</h2>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                ${row.map((cell, i) =>
                  `<td class="${i === 2 ? "amount" : ""}">${cell}</td>`
                ).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          Expense Tracker — ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return { exportCSV, exportPDF };
}