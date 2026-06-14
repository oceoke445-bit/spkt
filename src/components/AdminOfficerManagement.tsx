'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { spktApi } from '@/lib/spktApi';
import { spktDialogClass } from '@/lib/spktDialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export const AdminOfficerManagement: React.FC = () => {
  const [officers, setOfficers] = useState<
    Array<{ id: string; name: string; rank: string; email: string; phone: string; status: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', rank: '', email: '', phone: '', status: 'available' });

  const refresh = () => {
    setLoading(true);
    spktApi
      .getOfficers()
      .then(({ officers: data }) => setOfficers(data))
      .catch(() => setOfficers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await spktApi.createOfficer(form);
      toast.success('Petugas ditambahkan');
      setShowForm(false);
      setForm({ name: '', rank: '', email: '', phone: '', status: 'available' });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan petugas');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await spktApi.updateOfficer(id, { status });
      toast.success('Status petugas diperbarui');
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui petugas');
    }
  };

  const handleDelete = async () => {
    if (!officerToDelete) return;

    setDeleting(true);
    try {
      await spktApi.deleteOfficer(officerToDelete.id);
      toast.success('Petugas dihapus', {
        description: `${officerToDelete.name} telah dihapus dari daftar`,
      });
      setOfficerToDelete(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus petugas');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Kelola Petugas</h1>
          <p className="text-blue-200 mt-1">Daftar petugas SPKT dan ketersediaan</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Petugas
        </Button>
      </div>

      {loading && <div className="text-center py-8 text-blue-300">Memuat petugas...</div>}

      {!loading && (
        <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/80 border border-blue-500/50 rounded-lg overflow-hidden">
          <table className="w-full min-w-[640px]">
            <thead className="bg-blue-950/50 border-b border-blue-500/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-blue-200 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs text-blue-200 uppercase">Pangkat</th>
                <th className="px-6 py-3 text-left text-xs text-blue-200 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs text-blue-200 uppercase">Telepon</th>
                <th className="px-6 py-3 text-left text-xs text-blue-200 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs text-blue-200 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/20">
              {officers.map((o) => (
                <tr key={o.id} className="hover:bg-blue-800/50">
                  <td className="px-6 py-4 text-white font-medium">{o.name}</td>
                  <td className="px-6 py-4 text-blue-200">{o.rank}</td>
                  <td className="px-6 py-4 text-blue-200">{o.email}</td>
                  <td className="px-6 py-4 text-blue-200">{o.phone}</td>
                  <td className="px-6 py-4">
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-36 bg-blue-900/50 border-blue-500/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Tersedia</SelectItem>
                        <SelectItem value="busy">Sibuk</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md"
                      onClick={() => setOfficerToDelete({ id: o.id, name: o.name })}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={spktDialogClass('lg')}>
          <DialogHeader>
            <DialogTitle className="text-white">Tambah Petugas Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-blue-200">Nama</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-blue-900/50 border-blue-500/50 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">Pangkat</Label>
              <Input value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} required className="bg-blue-900/50 border-blue-500/50 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="bg-blue-900/50 border-blue-500/50 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-blue-200">Telepon</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="bg-blue-900/50 border-blue-500/50 text-white" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
              Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!officerToDelete} onOpenChange={(open) => !open && setOfficerToDelete(null)}>
        <DialogContent className={spktDialogClass('md')}>
          <DialogHeader>
            <DialogTitle className="text-white">Hapus Petugas</DialogTitle>
            <DialogDescription className="text-blue-200">
              Yakin ingin menghapus <span className="font-medium text-white">{officerToDelete?.name}</span> dari
              daftar petugas? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-blue-500/50 text-blue-200 hover:bg-blue-800/60"
              onClick={() => setOfficerToDelete(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={deleting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
              onClick={handleDelete}
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
