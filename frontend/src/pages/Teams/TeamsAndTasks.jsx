import React, { useState } from 'react';
import TeamManagement from './TeamManagement';
import TaskManagement from '../Tasks/TaskManagement';

export default function TeamsAndTasks({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('teams');

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'teams'
                ? 'bg-[#20b875] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏢 Teams & Roster
          </button>
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'tasks'
                ? 'bg-[#20b875] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 Tasks Management & Statuses
          </button>
        </div>
      </div>

      {/* Render selected tab view */}
      {activeSubTab === 'teams' && <TeamManagement currentUser={currentUser} />}
      {activeSubTab === 'tasks' && <TaskManagement currentUser={currentUser} />}
    </div>
  );
}
