import React from 'react';

export default function DashboardOverview({ user, setActiveTab }) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
        <h2 className="text-2xl font-bold text-[#09233d]">Welcome to PydahSoft Dashboard, {user?.name}!</h2>
        <p className="text-sm text-gray-600 mt-1">Use the sidebar to create users, create tasks, and manage task assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('users')}
          className="cursor-pointer bg-white p-5 rounded border border-gray-300 hover:border-green-500 transition-colors"
        >
          <p className="text-xs font-bold text-green-600 uppercase">System Module</p>
          <h3 className="text-lg font-bold text-[#09233d] mt-1">👤 User Creation</h3>
          <p className="text-xs text-gray-500 mt-1">Create SuperAdmin, Superior, Team Lead, and Employee accounts.</p>
        </div>

        <div
          onClick={() => setActiveTab('create-task')}
          className="cursor-pointer bg-white p-5 rounded border border-gray-300 hover:border-green-500 transition-colors"
        >
          <p className="text-xs font-bold text-green-600 uppercase">System Module</p>
          <h3 className="text-lg font-bold text-[#09233d] mt-1">📝 Task Creation</h3>
          <p className="text-xs text-gray-500 mt-1">Create new tasks, specify priority, due dates, and assign users.</p>
        </div>

        <div
          onClick={() => setActiveTab('assignments')}
          className="cursor-pointer bg-white p-5 rounded border border-gray-300 hover:border-green-500 transition-colors"
        >
          <p className="text-xs font-bold text-green-600 uppercase">System Module</p>
          <h3 className="text-lg font-bold text-[#09233d] mt-1">📋 Task Assignments</h3>
          <p className="text-xs text-gray-500 mt-1">Track tasks given to users and update execution status.</p>
        </div>
      </div>
    </div>
  );
}
