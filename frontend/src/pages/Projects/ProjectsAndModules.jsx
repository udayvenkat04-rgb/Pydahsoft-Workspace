import React, { useState } from 'react';
import ProjectManagement from './ProjectManagement';
import ModuleManagement from '../Modules/ModuleManagement';

export default function ProjectsAndModules({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('projects');

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'projects'
                ? 'bg-[#20b875] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📁 Projects Lifecycle
          </button>
          <button
            onClick={() => setActiveSubTab('modules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'modules'
                ? 'bg-[#20b875] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🧩 Project Modules Breakdown
          </button>
        </div>
      </div>

      {/* Render selected tab view */}
      {activeSubTab === 'projects' && <ProjectManagement currentUser={currentUser} />}
      {activeSubTab === 'modules' && <ModuleManagement currentUser={currentUser} />}
    </div>
  );
}
