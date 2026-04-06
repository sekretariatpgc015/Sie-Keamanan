import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';

export default function FormPage() {
  const [tanggal, setTanggal] = useState('');
  const [uraian, setUraian] = useState('');
  const [jenis, setJenis] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [jumlah, setJumlah] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4nn2dtvIgGWd9IrieZEC1WVujxnmy-_0v3cE-5sSV9Fy2PaglnRt1PLacqeChtLhC/exec';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    const amount = parseFloat(jumlah.replace(/[^0-9.-]+/g, ""));
    
    // Format tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY
    const [year, month, day] = tanggal.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      tanggal: formattedDate,
      uraian,
      pemasukan: jenis === 'Pemasukan' ? amount : 0,
      pengeluaran: jenis === 'Pengeluaran' ? amount : 0,
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk menghindari error CORS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      setSuccessMsg('Data berhasil disimpan ke Google Sheets!');
      
      // Reset form
      setTanggal('');
      setUraian('');
      setJumlah('');
      setJenis('Pemasukan');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error submitting data:', error);
      setErrorMsg('Gagal menyimpan data. Pastikan URL Apps Script sudah benar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-sky-100">
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold">Sie Keamanan</h2>
        <p className="text-sky-100 mt-1">Input Laporan Keuangan</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{successMsg}</p>
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="tanggal" className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              id="tanggal"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="uraian" className="block text-sm font-medium text-slate-700 mb-1">
              Uraian
            </label>
            <textarea
              id="uraian"
              required
              rows={3}
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Contoh: Pembelian perlengkapan posko..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jenis" className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Transaksi
              </label>
              <select
                id="jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as 'Pemasukan' | 'Pengeluaran')}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-white"
              >
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
            </div>

            <div>
              <label htmlFor="jumlah" className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah (Rp)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  id="jumlah"
                  required
                  min="0"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Simpan Data</span>
          </button>
        </div>
      </form>
    </div>
  );
}
