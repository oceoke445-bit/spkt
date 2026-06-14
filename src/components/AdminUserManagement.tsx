'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { spktApi } from '@/lib/spktApi';
import { spktDialogClass } from '@/lib/spktDialog';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  nik?: string;
  phone?: string;
};

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'user', label: 'Masyarakat' },
  { value: 'petugas', label: 'Petugas' },
  { value: 'admin', label: 'Admin' },
];

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');

  const refresh = () => {
    setLoading(true);
    spktApi
      .getUsers()
      .then(({ users: data }) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleActive = async (u: AdminUser) => {
    try {
      await spktApi.updateUser(u.id, { active: !u.active });
      toast.success(u.active ? 'User dinonaktifkan' : 'User diaktifkan');
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui user');
    }
  };

  const saveRole = async () => {
    if (!editing) return;
    try {
      await spktApi.updateUser(editing.id, { role: editRole });
      toast.success('Role user diperbarui');
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui role');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
        <p className="text-blue-200 mt-1">Kelola pengguna, role, dan status akun</p>
      </div>

      {loading && <div className="text-center py-8 text-blue-300">Memuat data pengguna...</div>}

      {!loading && (
        <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border border-blue-500/50 rounded-lg shadow-xl overflow-hidden backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-blue-950/50 border-b border-blue-500/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">NIK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/20">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">{u.nik ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/50 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          u.active
                            ? 'bg-green-500/30 text-green-100 border-green-400/50'
                            : 'bg-red-500/30 text-red-100 border-red-400/50'
                        }`}
                      >
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(u);
                          setEditRole(u.role as UserRole);
                        }}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Ubah Role
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        className="text-red-400 hover:text-red-300"
                      >
                        {u.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className={spktDialogClass('lg')}>
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Ubah Role — {editing.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-blue-200">Role</Label>
                  <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveRole} className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                  Simpan
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
