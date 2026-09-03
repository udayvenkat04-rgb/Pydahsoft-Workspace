import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../config/api';

export default function AuditLogsView({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">{error}</div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-gray-500">Loading audit trail...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Entity ID</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60">
                    <td className="p-4 text-gray-500 font-medium whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <strong className="text-[#09233d] font-bold block">{log.performedBy?.name}</strong>
                      <span className="text-[10px] text-gray-400">@{log.performedBy?.username}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{log.entityType}</td>
                    <td className="p-4 font-mono text-[11px] text-gray-500">{log.entityId}</td>
                    <td className="p-4 text-right font-mono text-[10px] text-gray-500">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
