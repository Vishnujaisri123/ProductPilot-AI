import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Trash2, CheckCircle, Loader, FileText } from 'lucide-react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function KnowledgeBasePage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ['knowledge'],
    queryFn: () => api.get('/knowledge').then(r => r.data),
  });

  const uploadMut = useMutation({
    mutationFn: (fd: FormData) => api.post('/knowledge', fd),
    onSuccess: () => { toast.success('Document indexed!'); qc.invalidateQueries({ queryKey: ['knowledge'] }); setFile(null); setName(''); },
    onError: () => toast.error('Upload failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/knowledge/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['knowledge'] }); },
  });

  const onDrop = useCallback((f: File[]) => setFile(f[0]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'], 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    if (name) fd.append('name', name);
    uploadMut.mutate(fd);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Knowledge Base</h1>
        <p className="text-white/50">Upload product catalogs to improve RAG extraction accuracy.</p>
      </div>

      {/* Upload */}
      <div className="glass p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Add Documents</h2>
        <input className="input" placeholder="Document name (optional)" value={name} onChange={e => setName(e.target.value)} />
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary/60 bg-primary/5' : 'border-white/10 hover:border-white/20'}`}>
          <input {...getInputProps()} />
          <Upload size={28} className="mx-auto mb-2 text-white/30" />
          <p className="text-sm text-white/60">CSV, Excel, JSON, or TXT</p>
          {file && <p className="text-sm text-primary mt-2">{file.name}</p>}
        </div>
        <button onClick={handleUpload} disabled={!file || uploadMut.isPending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {uploadMut.isPending ? <><Loader size={16} className="animate-spin" /> Indexing...</> : 'Upload & Index'}
        </button>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="font-semibold mb-4">Indexed Documents ({docs?.length || 0})</h2>
        {isLoading ? (
          <div className="text-center py-8 text-white/30">Loading...</div>
        ) : docs?.length ? (
          <div className="space-y-3">
            {docs.map((d: any, i: number) => (
              <motion.div key={d._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{d.name}</p>
                    <p className="text-xs text-white/40">{d.type.toUpperCase()} · {d.recordCount} records · {formatDate(d.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'indexed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                    {d.status === 'indexed' ? <CheckCircle size={12} className="inline mr-1" /> : <Loader size={12} className="inline mr-1 animate-spin" />}
                    {d.status}
                  </span>
                  <button onClick={() => deleteMut.mutate(d._id)} className="p-2 hover:bg-red-400/10 rounded-lg transition-colors text-white/30 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl py-16 text-center text-white/30">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p>No documents yet. Upload product catalogs to improve accuracy.</p>
          </div>
        )}
      </div>
    </div>
  );
}
