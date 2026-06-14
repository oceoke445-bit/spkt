'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { spktApi } from '@/lib/spktApi';
import { spktDialogClass } from '@/lib/spktDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { InfoArticle } from '@/lib/spktApi';

export const AdminArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<InfoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<InfoArticle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Panduan', description: '', content: '' });

  const refresh = () => {
    setLoading(true);
    spktApi.getInfoArticles().then(({ articles: data }) => setArticles(data)).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', category: 'Panduan', description: '', content: '' });
    setShowForm(true);
  };

  const openEdit = (article: InfoArticle) => {
    setEditing(article);
    setForm({ title: article.title, category: article.category, description: article.description, content: article.content });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await spktApi.updateInfoArticle(editing.id, form);
        toast.success('Artikel diperbarui');
      } else {
        await spktApi.createInfoArticle(form);
        toast.success('Artikel ditambahkan');
      }
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await spktApi.deleteInfoArticle(id);
      toast.success('Artikel dihapus');
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Artikel</h1>
          <p className="text-blue-200 text-sm">CMS informasi & panduan</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-blue-500 to-blue-600">
          <Plus className="w-4 h-4 mr-2" /> Tambah Artikel
        </Button>
      </div>

      {loading && <p className="text-blue-300">Memuat...</p>}

      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="flex items-center justify-between p-4 rounded-lg border border-blue-500/40 bg-blue-900/50">
            <div>
              <p className="font-medium text-white">{article.title}</p>
              <p className="text-sm text-blue-300">{article.category} · {article.date}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(article)} className="border-blue-400/50 text-blue-100">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(article.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={spktDialogClass('lg')}>
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? 'Edit Artikel' : 'Artikel Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-blue-200">Judul</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-blue-900/50 border-blue-500/50 text-white" /></div>
            <div><Label className="text-blue-200">Kategori</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-blue-900/50 border-blue-500/50 text-white" /></div>
            <div><Label className="text-blue-200">Deskripsi</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-blue-900/50 border-blue-500/50 text-white" /></div>
            <div><Label className="text-blue-200">Konten</Label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="w-full rounded-md bg-blue-900/50 border border-blue-500/50 text-white p-3 text-sm" /></div>
            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-500 to-blue-600">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
