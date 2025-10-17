import React, { useMemo, useState } from 'react';
import reportsApi from '../../api/reports';
import { Download, FileText, BarChart3, TrendingUp, Calendar } from 'lucide-react';

const defaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

export default function Reports() {
  const [range, setRange] = useState(defaultRange());
  const [loading, setLoading] = useState(false);
  const [finance, setFinance] = useState(null);
  const [visits, setVisits] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('finance');
  const [exportFormat, setExportFormat] = useState('csv');

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(Number(value || 0));
    } catch {
      return `LKR ${Number(value || 0).toLocaleString()}`;
    }
  };

  const kpis = useMemo(() => {
    const financeOverall = finance?.overall?.[0] || {};
    const visitOverall = visits?.overall?.[0] || {};
    return [
      { label: 'Revenue', value: formatCurrency(financeOverall.totalAmount || 0), icon: TrendingUp, tone: 'from-emerald-500 to-emerald-600' },
      { label: 'Payments', value: financeOverall.count || 0, icon: FileText, tone: 'from-blue-500 to-blue-600' },
      { label: 'Patient Visits', value: visitOverall.count || 0, icon: BarChart3, tone: 'from-indigo-500 to-indigo-600' },
      { label: 'Range', value: `${range.startDate} → ${range.endDate}`, icon: Calendar, tone: 'from-slate-500 to-slate-600' },
    ];
  }, [finance, visits, range]);

  const exportCSV = () => {
    const rows = [];
    if (tab === 'finance' && finance) {
      rows.push(['Section', 'Key', 'Count', 'Amount']);
      (finance.totalsByStatus || []).forEach(r => rows.push(['By Status', r._id, r.count, r.totalAmount]));
      (finance.totalsByType || []).forEach(r => rows.push(['By Type', r._id, r.count, r.totalAmount]));
      (finance.totalsByDay || []).forEach(r => rows.push(['By Day', r._id, r.count, r.totalAmount]));
      (finance.totalsByDoctor || []).forEach(r => rows.push(['By Doctor', r.doctorName || 'N/A', r.count, r.totalAmount]));
      const overall = finance.overall?.[0];
      if (overall) rows.push(['Overall', 'Total', overall.count, overall.totalAmount]);
    }
    if (tab === 'visits' && visits) {
      rows.push(['Section', 'Key', 'Count']);
      (visits.visitsByStatus || []).forEach(r => rows.push(['By Status', r._id, r.count]));
      (visits.visitsByDay || []).forEach(r => rows.push(['By Day', r._id, r.count]));
      (visits.visitsByDoctor || []).forEach(r => rows.push(['By Doctor', r.doctorName || 'N/A', r.count]));
      const overall = visits.overall?.[0];
      if (overall) rows.push(['Overall', 'Total', overall.count]);
    }

    const csvContent = rows.map(r => r.map(v => {
      if (v === undefined || v === null) return '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') ? `"${s}"` : s;
    }).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileBase = tab === 'finance' ? 'finance-report' : 'patient-visits-report';
    a.download = `${fileBase}-${range.startDate}_to_${range.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const title = tab === 'finance' ? 'Finance Report' : 'Patient Visits Report';
    const dateRange = `${range.startDate} to ${range.endDate}`;
    const style = `
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
        h1 { font-size: 18px; margin: 0 0 8px; }
        h2 { font-size: 14px; margin: 16px 0 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; }
        th { background: #f5f5f5; text-align: left; }
      </style>
    `;
    const section = (heading, headers, rows) => `
      <h2>${heading}</h2>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `;

    let html = `<h1>${title}</h1><div>${dateRange}</div>`;
    if (tab === 'finance' && finance) {
      const overall = finance.overall?.[0] || {};
      html += section('Overall', ['Metric', 'Value'], [['Total Amount', overall.totalAmount || 0], ['Payments', overall.count || 0]]);
      html += section('By Status', ['Status', 'Count', 'Amount'], (finance.totalsByStatus || []).map(r => [r._id, r.count, r.totalAmount]));
      html += section('By Type', ['Type', 'Count', 'Amount'], (finance.totalsByType || []).map(r => [r._id, r.count, r.totalAmount]));
      html += section('By Day', ['Date', 'Count', 'Amount'], (finance.totalsByDay || []).map(r => [r._id, r.count, r.totalAmount]));
      html += section('By Doctor', ['Doctor', 'Count', 'Amount'], (finance.totalsByDoctor || []).map(r => [r.doctorName || 'N/A', r.count, r.totalAmount]));
    }
    if (tab === 'visits' && visits) {
      const overall = visits.overall?.[0] || {};
      html += section('Overall', ['Metric', 'Value'], [['Total Visits', overall.count || 0]]);
      html += section('By Status', ['Status', 'Count'], (visits.visitsByStatus || []).map(r => [r._id, r.count]));
      html += section('By Day', ['Date', 'Count'], (visits.visitsByDay || []).map(r => [r._id, r.count]));
      html += section('By Doctor', ['Doctor', 'Count'], (visits.visitsByDoctor || []).map(r => [r.doctorName || 'N/A', r.count]));
    }
    win.document.write(`<html><head><title>${title}</title>${style}</head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (range.startDate) params.set('startDate', range.startDate);
    if (range.endDate) params.set('endDate', range.endDate);
    return params.toString();
  }, [range]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [financeRes, visitsRes] = await Promise.all([
        reportsApi.getFinanceReport(range),
        reportsApi.getPatientVisitReport(range),
      ]);
      setFinance(financeRes.data);
      setVisits(visitsRes.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600">Finance and patient visit analytics for your hospital</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-500" />
          <span>{range.startDate}</span>
          <span>→</span>
          <span>{range.endDate}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        {['finance', 'visits'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            {t === 'finance' ? 'Finance' : 'Patient Visits'}
          </button>
        ))}
      </div>
      
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 bg-white border border-gray-200 rounded-xl p-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={range.startDate}
            onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))}
            className="border rounded-lg px-3 py-2 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={range.endDate}
            onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))}
            className="border rounded-lg px-3 py-2 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex gap-2">
          <button
          onClick={loadReports}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm"
          disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="border rounded-lg px-2 py-2 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={() => {
                if (exportFormat === 'csv') return exportCSV();
                if (exportFormat === 'pdf') return exportPDF();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm inline-flex items-center gap-2"
            >
              <Download size={16} /> Export
            </button>
          </div>
          <button
            onClick={() => setRange(defaultRange())}
            className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Last 30 days
          </button>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(end.getDate() - 6);
              setRange({ startDate: start.toISOString().slice(0,10), endDate: end.toISOString().slice(0,10) });
            }}
            className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Last 7 days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tone} text-white flex items-center justify-center`}>
                <Icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded">{error}</div>
      )}

      {tab === 'finance' && (
      <section className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Finance</h3>
        {!finance ? (
          <div className="text-gray-500">No data</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">Overall</h4>
              <div className="text-sm text-gray-700">Total Amount: {formatCurrency(finance.overall?.[0]?.totalAmount || 0)}</div>
              <div className="text-sm text-gray-700">Payments: {finance.overall?.[0]?.count || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">By Status</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Status</th>
                    <th className="py-1">Count</th>
                    <th className="py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(finance.totalsByStatus || []).map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="py-1 capitalize">{r._id}</td>
                      <td className="py-1">{r.count}</td>
                      <td className="py-1">{formatCurrency(r.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">By Payment Type</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Type</th>
                    <th className="py-1">Count</th>
                    <th className="py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(finance.totalsByType || []).map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="py-1 capitalize">{r._id}</td>
                      <td className="py-1">{r.count}</td>
                      <td className="py-1">{formatCurrency(r.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">Top Doctors</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Doctor</th>
                    <th className="py-1">Count</th>
                    <th className="py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(finance.totalsByDoctor || []).map((r, idx) => (
                    <tr key={r.doctorId || idx} className="border-t">
                      <td className="py-1">{r.doctorName || 'N/A'}</td>
                      <td className="py-1">{r.count}</td>
                      <td className="py-1">{formatCurrency(r.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      )}

      {tab === 'visits' && (
      <section className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Patient Visits</h3>
        {!visits ? (
          <div className="text-gray-500">No data</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">Overall</h4>
              <div className="text-sm text-gray-700">Total Visits: {visits.overall?.[0]?.count || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">By Status</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Status</th>
                    <th className="py-1">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(visits.visitsByStatus || []).map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="py-1 capitalize">{r._id}</td>
                      <td className="py-1">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">By Day</h4>
              <div className="space-y-2">
                {(visits.visitsByDay || []).map((r) => (
                  <div key={r._id} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-600">{r._id}</div>
                    <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${Math.min(100, ((r.count || 0) / Math.max(1, Math.max(...(visits.visitsByDay || []).map(x => x.count || 0)))) * 100)}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-xs text-gray-700">{r.count}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-medium mb-2">Top Doctors</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Doctor</th>
                    <th className="py-1">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(visits.visitsByDoctor || []).map((r, idx) => (
                    <tr key={r.doctorId || idx} className="border-t">
                      <td className="py-1">{r.doctorName || 'N/A'}</td>
                      <td className="py-1">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      )}
    </div>
  );
}


