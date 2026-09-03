import React, { useState, useEffect } from 'react';

export default function TaskCreation({ onTaskCreated }) {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('Default Project');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setUsers(data.data);
          setAssignedTo(data.data[0]._id);
        }
      })
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!assignedTo) {
      setError('Please select a user to assign the task to.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          project,
          assignedTo,
          priority,
          dueDate: dueDate || null
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`Task "${title}" created and assigned successfully!`);
        setTitle('');
        setDescription('');
        setDueDate('');
        if (onTaskCreated) onTaskCreated();
      } else {
        setError(data.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Unable to connect to backend server');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-[#09233d]">Task Creation ("Task Givings")</h2>

      <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-[#09233d]">Create & Assign New Task</h3>

        {message && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 text-sm font-semibold rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm font-semibold rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement MongoDB schema for users"
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Project name"
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assign To User</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
              >
                {users.length === 0 ? (
                  <option value="">No users available</option>
                ) : (
                  users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description / Instructions</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details and instructions..."
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-[#20b875] text-white font-bold px-6 py-2 rounded text-sm hover:bg-[#159e63]"
          >
            Create & Assign Task
          </button>
        </form>
      </div>
    </div>
  );
}
