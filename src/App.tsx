import React, { useState } from 'react';
import { FileText, Table as TableIcon, ShieldCheck, LogOut } from 'lucide-react';
import FormPage from './components/FormPage';
import TablePage from './components/TablePage';
import { Transaction } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'table'>('form');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center overflow-hidden border border-sky-200 shadow-sm">
                <img 
                  src="https://cdn.phototourl.com/member/2026-03-29-7a49234c-9402-4b59-99a5-b97fdae0c2a0.png" 
                  alt="Logo Keamanan" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback icon if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>');
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">Sie Keamanan</h1>
                <p className="text-sm text-sky-600 font-medium">Laporan Keuangan</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'form' 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-200' 
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
                }`}
              >
                <FileText className="w-4 h-4" />
                Input Data
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'table' 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-200' 
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                Rekapitulasi
              </button>
              <button
                onClick={() => window.location.href = 'https://rw-015.vercel.app/'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-20 z-10">
        <div className="flex p-2 gap-2">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'form' 
                ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Input
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'table' 
                ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            Rekap
          </button>
          <button
            onClick={() => window.location.href = 'https://rw-015.vercel.app/'}
            className="flex-1 flex justify-center items-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'form' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FormPage />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TablePage />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Sie Keamanan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
