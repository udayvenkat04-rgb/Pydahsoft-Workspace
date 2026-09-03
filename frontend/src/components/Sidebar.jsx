import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'users', label: '👤 User Creation' },
    { id: 'create-task', label: '📝 Task Creation' },
    { id: 'assignments', label: '📋 Task Assignments' }
  ];

  return (
    <aside className="w-64 bg-[#09233d] text-white flex flex-col justify-between min-h-screen p-4 border-r border-[#1a3854]">
      <div>
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#1a3854]">
          <span className="bg-[#20b875] text-white font-bold px-2 py-1 rounded text-sm">&lt;&gt;</span>
          <span className="font-bold text-base">PydahSoft Workspace</span>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded font-medium text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-[#20b875] text-white font-bold'
                  : 'text-gray-300 hover:bg-[#133352] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-[#1a3854]">
        <div className="mb-3 px-2">
          <p className="text-xs font-bold text-[#6be2a7]">{user?.name}</p>
          <p className="text-[11px] text-gray-400">Role: {user?.role?.toUpperCase()}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-xs text-center"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
