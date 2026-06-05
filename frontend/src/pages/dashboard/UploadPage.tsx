import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Loader, ExternalLink, Bot } from 'lucide-react';
import api from '../../lib/api';
import { getConfidenceColor, getConfidenceBg } from '../../lib/utils';
import toast from 'react-hot-toast';

const PIPELINE_STEPS = [
  'Uploading image',
  'Running OCR extraction',
  'AI Vision analysis',
  'RAG context retrieval',
  'Field validation',
  'Confidence scoring',
  'Generating JSON',
  'Sending to Telegram',
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'polling' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [urls, setUrls] = useState({ manualProductUrl: '', affiliateUrl: '' });

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus('idle');
    setResult(null);
    setExtractionId(null);
    setStep(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleExtract = async () => {
    if (!file) return;
    setStatus('uploading');
    setStep(0);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/extract', formData);
      setExtractionId(data.extractionId);
      setStatus('polling');
      setStep(1);
      pollStatus(data.extractionId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setStatus('error');
    }
  };

  const pollStatus = async (id: string) => {
    let stepIdx = 1;
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/extract/${id}`);
        if (stepIdx < PIPELINE_STEPS.length - 1) {
          stepIdx++;
          setStep(stepIdx);
        }
        if (data.status === 'completed') {
          clearInterval(interval);
          setResult(data);
          setUrls({ manualProductUrl: data.manualProductUrl || '', affiliateUrl: data.affiliateUrl || '' });
          setStatus('done');
          setStep(PIPELINE_STEPS.length - 1);
          toast.success('Extraction complete!');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setStatus('error');
          toast.error(data.error || 'Extraction failed');
        }
      } catch {
        clearInterval(interval);
        setStatus('error');
      }
    }, 2000);
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setResult(null);
    setExtractionId(null);
    setStep(0);
    setUrls({ manualProductUrl: '', affiliateUrl: '' });
  };

  const handleSendTelegram = async () => {
    if (!result) return;
    try {
      await api.patch(`/extract/${result._id}/affiliate`, urls);
      await api.post(`/extract/${result._id}/telegram`);
      toast.success('Sent to Telegram!');
      setResult({ ...result, telegramSent: true, manualProductUrl: urls.manualProductUrl, affiliateUrl: urls.affiliateUrl });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to send to Telegram';
      toast.error(`Error: ${errMsg}`);
    }
  };

  const val = (field: string) => result?.extracted?.[field]?.value;
  const conf = (field: string) => result?.extracted?.[field]?.confidence ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Upload Screenshot</h1>
        <p className="text-white/50">Upload any product screenshot for AI extraction.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div className="space-y-4">
          {!file ? (
            <div {...getRootProps()} className={`glass border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary/60 bg-primary/5' : 'border-white/10 hover:border-white/20'}`}>
              <input {...getInputProps()} />
              <Upload size={40} className="mx-auto mb-4 text-white/30" />
              <p className="font-medium mb-1">{isDragActive ? 'Drop it here' : 'Drag & drop screenshot'}</p>
              <p className="text-white/40 text-sm">PNG, JPG, WEBP, PDF up to 20MB</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="relative">
                <img src={preview!} alt="preview" className="w-full max-h-64 object-contain bg-black/20" />
                <button onClick={clear} className="absolute top-3 right-3 glass p-1.5 rounded-lg hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-white/60 truncate">{file.name}</p>
                <p className="text-xs text-white/30 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}

          {file && status === 'idle' && (
            <button onClick={handleExtract} className="btn-primary w-full py-4">
              Extract Product Data
            </button>
          )}

          {/* Pipeline Progress */}
          <AnimatePresence>
            {(status === 'uploading' || status === 'polling') && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Loader size={16} className="animate-spin" /> Processing...
                </div>
                {PIPELINE_STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      i < step ? 'bg-accent/20 text-accent' :
                      i === step ? 'bg-primary/20 text-primary' :
                      'bg-white/5 text-white/20'
                    }`}>
                      {i < step ? <CheckCircle size={12} /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <span className={i <= step ? 'text-white/80' : 'text-white/30'}>{s}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {status === 'error' && (
            <div className="glass border border-red-400/20 p-4 flex items-center gap-3 text-red-400">
              <AlertCircle size={18} /> Extraction failed. Please try again.
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Confidence Score */}
              <div className={`glass border p-4 rounded-2xl flex items-center justify-between ${getConfidenceBg(result.confidenceScore)}`}>
                <div>
                  <p className="text-sm text-white/50">Overall Confidence</p>
                  <p className={`text-3xl font-bold ${getConfidenceColor(result.confidenceScore)}`}>{result.confidenceScore}%</p>
                </div>
                <CheckCircle size={32} className={getConfidenceColor(result.confidenceScore)} />
              </div>

              {/* Image */}
              {result.imageUrl && (
                <div className="glass p-3 rounded-2xl">
                  <img src={result.imageUrl} alt="product" className="w-full max-h-40 object-contain rounded-xl" />
                </div>
              )}

              {/* Fields */}
              <div className="glass p-5 space-y-3 max-h-96 overflow-y-auto">
                {[
                  ['Product Name', 'product_name'],
                  ['Brand', 'brand'],
                  ['Category', 'category'],
                  ['Price', 'price'],
                  ['Discount Price', 'discount_price'],
                  ['Rating', 'rating'],
                  ['Reviews', 'review_count'],
                  ['Availability', 'availability'],
                  ['Platform', 'platform'],
                  ['Color', 'color'],
                  ['RAM', 'ram'],
                  ['Storage', 'storage'],
                  ['Model', 'model_number'],
                ].map(([label, key]) => val(key) ? (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <span className="text-white/40 text-sm shrink-0">{label}</span>
                    <div className="text-right">
                      <span className="text-sm">{val(key)}</span>
                      <div className={`text-xs ${getConfidenceColor(conf(key))}`}>{conf(key)}%</div>
                    </div>
                  </div>
                ) : null)}
              </div>

              {/* Links */}
              {(result.productLinks?.amazon || result.productLinks?.flipkart) && (
                <div className="glass p-4 space-y-2">
                  <p className="text-sm font-medium mb-3">Product Links</p>
                  {result.productLinks.amazon && (
                    <a href={result.productLinks.amazon} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink size={14} /> Amazon
                    </a>
                  )}
                  {result.productLinks.flipkart && (
                    <a href={result.productLinks.flipkart} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink size={14} /> Flipkart
                    </a>
                  )}
                </div>
              )}

              {/* Affiliate Management */}
              <div className="glass p-4 space-y-3">
                <p className="text-sm font-medium">Affiliate Links</p>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Manual Product URL</label>
                  <input className="input text-sm py-2" placeholder="Paste product URL..." value={urls.manualProductUrl} onChange={e => setUrls(p => ({...p, manualProductUrl: e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Affiliate URL</label>
                  <input className="input text-sm py-2" placeholder="Paste affiliate URL..." value={urls.affiliateUrl} onChange={e => setUrls(p => ({...p, affiliateUrl: e.target.value}))} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <a href={`/api/extract/${result._id}/export/json`} className="btn-secondary flex-1 text-center py-2.5 text-sm min-w-[120px]">Export JSON</a>
                <button onClick={handleSendTelegram} className={`flex-1 py-2.5 text-sm flex items-center justify-center gap-2 min-w-[160px] ${result.telegramSent ? 'btn-secondary text-emerald-400' : 'btn-primary'}`}>
                  <Bot size={16} /> {result.telegramSent ? 'Resend to Telegram' : 'Send to Telegram'}
                </button>
              </div>

              <button onClick={clear} className="btn-ghost w-full text-sm">Extract Another</button>
            </motion.div>
          ) : (
            <div className="glass h-full min-h-64 flex items-center justify-center text-white/20 text-sm rounded-2xl">
              Extraction results will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
