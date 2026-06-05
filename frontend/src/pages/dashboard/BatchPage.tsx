import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Layers, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function BatchPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(p => [...p, ...accepted].slice(0, 20));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 20,
  });

  const removeFile = (i: number) => setFiles(p => p.filter((_, idx) => idx !== i));

  const handleBatch = async () => {
    if (!files.length) return;
    setLoading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try {
      const { data } = await api.post('/extract/batch', formData);
      setResults(data.results);
      toast.success(`${data.results.length} extractions queued`);
      setFiles([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Batch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Batch Processing</h1>
        <p className="text-white/50">Upload up to 20 screenshots at once.</p>
      </div>

      <div {...getRootProps()} className={`glass border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary/60 bg-primary/5' : 'border-white/10 hover:border-white/20'}`}>
        <input {...getInputProps()} />
        <Layers size={40} className="mx-auto mb-3 text-white/30" />
        <p className="font-medium">Drop multiple screenshots here</p>
        <p className="text-white/40 text-sm mt-1">Up to 20 files · PNG, JPG, WEBP</p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {files.map((f, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden relative group">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-24 object-cover" />
              <div className="p-2 text-xs text-white/50 truncate">{f.name}</div>
              <button onClick={() => removeFile(i)} className="absolute top-2 right-2 bg-bg/80 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button onClick={handleBatch} disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          {loading ? <><Loader size={18} className="animate-spin" /> Processing...</> : `Extract ${files.length} Screenshots`}
        </button>
      )}

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 font-medium">Batch Results</div>
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
              <span className="text-sm text-white/70">{r.filename}</span>
              {r.error ? (
                <span className="text-red-400 flex items-center gap-1 text-sm"><AlertCircle size={14} /> {r.error}</span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1 text-sm"><CheckCircle size={14} /> Queued</span>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
