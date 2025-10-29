import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../AdminDashboard.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/audit-logs', {
        params: {
          page,
          limit,
          action: filter || undefined,
        },
      });

      setLogs(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success':
        return 'badge-success';
      case 'error':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="admin-section">
      <h2>📋 Audit Logs</h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}>Filter by Action:</label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          No audit logs found
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.username || 'System'}</td>
                  <td>
                    <span className="badge badge-info">{log.action}</span>
                  </td>
                  <td>{log.resource_type} #{log.resource_id}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td><code>{log.ip_address}</code></td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = page > 2 ? page + i - 2 : i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={page === pageNum ? 'active' : ''}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
