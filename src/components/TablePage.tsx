import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { ExternalLink, RefreshCw, ArrowUpRight, ArrowDownRight, Wallet, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../lib/utils';

// Helper to parse date from various formats
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date(0);
  // Handle YYYY-MM-DD
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }
  // Handle DD/MM/YYYY or DD-MM-YYYY
  const sep = dateStr.includes('/') ? '/' : dateStr.includes('-') ? '-' : null;
  if (sep) {
    const parts = dateStr.split(sep);
    if (parts.length === 3 && parts[2].length === 4) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  }
  return new Date(dateStr);
};

const getMonthYear = (date: Date) => {
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const formatMonthYear = (yyyymm: string) => {
  if (!yyyymm) return '';
  const [y, m] = yyyymm.split('-');
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

export default function TablePage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1pMaQF_WUZOMSTbLJqK-75-WZXHmnx_ZO6gmslqWOvJ8/export?format=csv&gid=0';
  const GOOGLE_SHEET_VIEW_URL = 'https://docs.google.com/spreadsheets/d/1pMaQF_WUZOMSTbLJqK-75-WZXHmnx_ZO6gmslqWOvJ8/edit?gid=0#gid=0';

  const fetchData = () => {
    setLoading(true);
    setError('');
    
    // Add cache buster to ensure we get the latest data
    const fetchUrl = `${GOOGLE_SHEET_CSV_URL}&t=${new Date().getTime()}`;
    
    Papa.parse(fetchUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const parsedData: Transaction[] = results.data.map((row: any, index) => {
            // Clean up numbers (remove currency symbols, commas, etc.)
            const cleanNumber = (val: string) => {
              if (!val) return 0;
              const strVal = val.toString();
              
              // Check if it's negative (accounting format with parentheses or minus sign)
              const isNegative = (strVal.includes('(') && strVal.includes(')')) || strVal.includes('-');
              
              // Remove all non-digit characters
              const digitsOnly = strVal.replace(/[^0-9]/g, "");
              
              // If no digits found (e.g., "Rp -"), return 0
              if (!digitsOnly) return 0;
              
              const num = parseInt(digitsOnly, 10);
              return isNegative ? -num : num;
            };

            return {
              id: `sheet-${index}`,
              tanggal: row['Tanggal'] || '',
              uraian: row['Uraian'] || '',
              pemasukan: cleanNumber(row['Pemasukan']),
              pengeluaran: cleanNumber(row['Pengeluaran'])
            };
          });
          
          setData(parsedData);
          setLoading(false);
        } catch (err) {
          console.error("Error parsing data:", err);
          setError('Gagal memproses data dari Google Sheets.');
          setLoading(false);
        }
      },
      error: (err) => {
        console.error("Error fetching CSV:", err);
        setError('Gagal mengambil data dari Google Sheets. Pastikan link dapat diakses publik.');
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Extract unique months for filter
  const monthsSet = new Set<string>();
  data.forEach(item => {
    const d = parseDate(item.tanggal);
    const my = getMonthYear(d);
    if (my) monthsSet.add(my);
  });
  const availableMonths = Array.from(monthsSet).sort().reverse(); // Newest first

  // Filter data by month
  let currentPeriodData = data;
  let previousPeriodData: Transaction[] = [];

  if (selectedMonth !== 'all') {
    currentPeriodData = data.filter(item => {
      const d = parseDate(item.tanggal);
      return getMonthYear(d) === selectedMonth;
    });
    previousPeriodData = data.filter(item => {
      const d = parseDate(item.tanggal);
      const my = getMonthYear(d);
      return my && my < selectedMonth;
    });
  }

  // Data for current view
  const filteredData = currentPeriodData;

  // Calculate totals
  const saldoBulanLalu = previousPeriodData.reduce((sum, item) => sum + item.pemasukan - item.pengeluaran, 0);
  const totalPemasukan = currentPeriodData.reduce((sum, item) => sum + item.pemasukan, 0);
  const totalPengeluaran = currentPeriodData.reduce((sum, item) => sum + item.pengeluaran, 0);
  const saldoAkhir = saldoBulanLalu + totalPemasukan - totalPengeluaran;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Saldo Sebelumnya</p>
            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(saldoBulanLalu)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pemasukan</p>
            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(totalPemasukan)}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pengeluaran</p>
            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(totalPengeluaran)}</h3>
          </div>
        </div>
        
        <div className="bg-sky-500 rounded-2xl p-6 shadow-md text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-sky-100">Saldo Akhir</p>
            <h3 className="text-2xl font-bold">{formatCurrency(saldoAkhir)}</h3>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Rekapitulasi Keuangan</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none w-full sm:w-auto bg-white appearance-none"
              >
                <option value="all">Semua Bulan</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>{formatMonthYear(m)}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={fetchData}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors w-full sm:w-auto font-medium text-sm"
          title="Muat Ulang Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="whitespace-nowrap">Muat Ulang</span>
        </button>

        <a 
          href={GOOGLE_SHEET_VIEW_URL}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="whitespace-nowrap">Buka G-Sheet</span>
        </a>
      </div>
    </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Tanggal</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200">Uraian</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Pemasukan</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
                      <p>Memuat data dari Google Sheets...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-red-500 bg-red-50">
                    {error}
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                      {row.uraian}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium text-right whitespace-nowrap">
                      {formatCurrency(row.pemasukan)}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium text-right whitespace-nowrap">
                      {formatCurrency(row.pengeluaran)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
    {!loading && !error && (
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm text-slate-500">
        <p>Menampilkan {filteredData.length} transaksi</p>
      </div>
    )}
      </div>
    </div>
  );
}
