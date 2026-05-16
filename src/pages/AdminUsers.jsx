import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient, { extractApiError } from '../api/axios-client';

/**
 * Admin-only roster view. The /api/admin/users endpoint is gated on
 * the backend by role:admin, so even if this page leaked into a
 * non-admin's router, the API would 403. This client-side guard is
 * cosmetic (no flash of forbidden content) — not the security boundary.
 */
export default function AdminUsers() {
  const { hasRole, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    axiosClient
      .get('/admin/users', { params: { per_page: 200 } })
      .then((res) => {
        if (!alive) return;
        setUsers(res.data?.data ?? []);
        setError('');
      })
      .catch((err) => {
        if (!alive) return;
        setError(extractApiError(err, 'Failed to load users'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (authLoading) return null;
  if (!hasRole('admin')) return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          All users
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Decrypted via Eloquent. Visible only to accounts with the <code>admin</code> role.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-deep-800" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-deep-700">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-deep-700">
            <thead className="bg-gray-50 dark:bg-deep-800">
              <tr>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>Name</Th>
                <Th>Roles</Th>
                <Th>Age / Sex</Th>
                <Th>Verified</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-deep-700 dark:bg-deep-900">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-deep-800/50">
                  <Td className="font-mono text-xs text-gray-500">{u.id}</Td>
                  <Td className="font-medium text-gray-900 dark:text-white">{u.email}</Td>
                  <Td>{u.name}</Td>
                  <Td>
                    {u.roles?.length ? (
                      <span className="inline-flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r === 'admin'
                                ? 'bg-brand-100 text-brand-800 dark:bg-deep-700 dark:text-brand-200'
                                : 'bg-gray-100 text-gray-700 dark:bg-deep-700 dark:text-gray-300'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </Td>
                  <Td className="text-gray-600 dark:text-gray-400">
                    {u.age ?? '—'} / {u.sex ?? '—'}
                  </Td>
                  <Td>
                    {u.email_verified_at ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </Td>
                  <Td className="text-xs text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleString() : ''}
                  </Td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
