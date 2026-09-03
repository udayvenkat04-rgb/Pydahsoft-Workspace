import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Sidebar from './components/Sidebar/Sidebar';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import UserManagement from './pages/UserManagement/UserManagement';
import TaskCreation from './pages/TaskCreation/TaskCreation';
import TaskAssignment from './pages/TaskAssignment/TaskAssignment';
import './App.css';

function DashboardLayout({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={() => {
          onLogout();
          navigate('/');
        }}
      />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#09233d]">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'users' && 'User Creation & Management'}
            {activeTab === 'create-task' && 'Task Creation ("Task Givings")'}
            {activeTab === 'assignments' && 'Task Assignments ("Tasks Giving to Users")'}
          </h1>
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded">
              Active User: {user.name} ({user.role?.toUpperCase()})
            </span>
            <Link
              to="/"
              className="border border-gray-300 bg-white hover:bg-gray-100 font-bold px-3 py-1 rounded text-gray-700"
            >
              Landing Page
            </Link>
          </div>
        </header>

        <div className="p-4">
          {activeTab === 'dashboard' && (
            <DashboardOverview user={user} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'create-task' && (
            <TaskCreation onTaskCreated={() => setActiveTab('assignments')} />
          )}

          {activeTab === 'assignments' && <TaskAssignment />}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('pydahsoft_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pydahsoft_user');
    localStorage.removeItem('pydahsoft_token');
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Landing user={user} />} />
      <Route
        path="/login"
        element={<Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />}
      />
      <Route
        path="/dashboard/*"
        element={
          user ? (
            <DashboardLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
