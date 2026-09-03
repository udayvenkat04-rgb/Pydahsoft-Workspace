import React, { useState } from 'react';
import PerformanceAnalytics from './PerformanceAnalytics';
import ReportGenerator from '../Reports/ReportGenerator';

export default function PerformanceAndReports({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('analytics');

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'analytics'
                ? 'bg-[#20b875] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 Performance Analytics
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'reports'
                ? 'bg-[#20b875] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Executive Reports Generator
          </button>
        </div>
      </div>

      {/* Render selected tab view */}
      {activeSubTab === 'analytics' && <PerformanceAnalytics currentUser={currentUser} />}
      {activeSubTab === 'reports' && <ReportGenerator currentUser={currentUser} />}
    </div>
  );
}
