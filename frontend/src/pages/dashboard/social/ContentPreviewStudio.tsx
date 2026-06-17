import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, Share2, Megaphone, FolderHeart, Sparkles, Wand2, Volume2, 
  Calendar, Check, AlertCircle, Loader, Play, Pause, RefreshCw, Image, Video, Layout
} from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ContentPreviewStudio() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activePlatform, setActivePlatform] = useState('telegram');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Content states
  const [aiData, setAiData] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedHook, setSelectedHook] = useState('');
  
  // Media states
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [repurposedVideo, setRepurposedVideo] = useState<any>(null);
  const [repurposingVideo, setRepurposingVideo] = useState(false);

  // Voiceover playback states
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Thumbnail overlay configs
  const [badgeText, setBadgeText] = useState('MEGA DEAL');
  const [badgeColor, setBadgeColor] = useState('rose'); // rose, purple, cyan, orange

  // Fetch product
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-details', productId],
    queryFn: () => api.get(`/products/${productId}`).then(r => r.data),
    enabled: !!productId
  });

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['social-campaigns'],
    queryFn: () => api.get('/social/campaigns').then(r => r.data)
  });

  // Fetch connected social accounts to check authorization health
  const { data: accounts = [] } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => api.get('/social/accounts').then(r => r.data)
  });

  // Mutation to schedule post
  const scheduleMut = useMutation({
    mutationFn: (d: any) => api.post('/social/posts/schedule', d),
    onSuccess: () => {
      toast.success('Post queued successfully!');
      qc.invalidateQueries({ queryKey: ['social-posts'] });
      navigate('/admin/social');
    },
    onError: () => toast.error('Failed to schedule post')
  });

  // Mutation to generate AI content
  const aiMut = useMutation({
    mutationFn: () => api.post('/social/posts/generate', { productId }),
    onSuccess: (data: any) => {
      setAiData(data.data);
      toast.success('AI marketing content generated!');
    },
    onError: () => toast.error('AI content generation failed')
  });

  // Load product initial values
  useEffect(() => {
    if (product) {
      setThumbnailUrl(product.imageUrl || '');
      // If product has a video URL, we can set it
      setVideoUrl('');
    }
  }, [product]);

  // Synchronize fields when active platform changes
  useEffect(() => {
    if (!aiData) return;

    const data = aiData[activePlatform] || {};
    setTitle(data.title || product?.productName || '');
    setCaption(data.caption || '');
    setHashtags(data.hashtags || []);
  }, [activePlatform, aiData]);

  // Apply hooks
  const handleHookChange = (hookKey: string) => {
    if (!aiData) return;
    const hookVal = aiData.hooks?.[hookKey] || '';
    setSelectedHook(hookKey);
    // Prepend hook value to caption
    setCaption(prev => `${hookVal.toUpperCase()}\n\n${prev}`);
  };

  // Generate sharp thumbnail with badge overlays
  const handleGenerateThumbnail = async () => {
    if (!product) return;
    setGeneratingThumbnail(true);
    try {
      const { data } = await api.post('/social/repurpose/thumbnail', {
        productName: product.productName,
        price: product.price,
        discountPrice: product.discountPrice,
        imageUrl: product.imageUrl,
        platform: product.platform || 'amazon'
      });
      if (data.success) {
        setThumbnailUrl(data.thumbnailUrl);
        toast.success('Badge-composited thumbnail generated!');
      } else {
        toast.error('Thumbnail generation failed');
      }
    } catch {
      toast.error('Error generating thumbnail');
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  // Repurpose video clips
  const handleRepurposeVideo = async () => {
    if (!product) return;
    setRepurposingVideo(true);
    try {
      const { data } = await api.post('/social/repurpose/video', {
        productName: product.productName,
        videoUrl: product.imageUrl ? 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-new-smart-phone-in-hands-40505-large.mp4' : '', // Mock default video
        imageUrl: thumbnailUrl
      });
      setRepurposedVideo(data);
      if (data.clips?.length) {
        setVideoUrl(data.clips[0].videoUrl);
      }
      toast.success('AI clips and scene segments extracted!');
    } catch {
      toast.error('Video repurposing failed');
    } finally {
      setRepurposingVideo(false);
    }
  };

  // TTS Voiceover preview
  const handleToggleVoiceover = () => {
    const synth = window.speechSynthesis;
    if (!synth) {
      toast.error('Speech synthesis not supported in this browser');
      return;
    }

    if (isPlayingVoice) {
      synth.cancel();
      setIsPlayingVoice(false);
      return;
    }

    const scriptText = aiData?.scripts?.[activePlatform === 'youtube' ? '15s' : '30s'] || caption || '';
    if (!scriptText) {
      toast.error('No promotional script or description available to read');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(scriptText);
    const voices = synth.getVoices();
    
    // Select male/female voice
    if (voiceGender === 'male') {
      utterance.voice = voices.find(v => v.name.toLowerCase().includes('google us english') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male')) || voices[0];
    } else {
      utterance.voice = voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google uk english female')) || voices[0];
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsPlayingVoice(false);
    };

    utterance.onerror = () => {
      setIsPlayingVoice(false);
    };

    setSpeechUtterance(utterance);
    setIsPlayingVoice(true);
    synth.speak(utterance);
  };

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag && !hashtags.includes(newTag)) {
      setHashtags(p => [...p, newTag.trim().replace('#', '')]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setHashtags(p => p.filter(t => t !== tag));
  };

  const handlePublishOrSchedule = (isEverywhere = false) => {
    if (!product) return;

    let runDate = null;
    if (scheduledDate && scheduledTime) {
      runDate = new Date(`${scheduledDate}T${scheduledTime}`);
      if (runDate.getTime() <= Date.now()) {
        toast.error('Schedule date/time must be in the future');
        return;
      }
    }

    const payload = {
      productId: product._id,
      campaignId: selectedCampaign || undefined,
      platform: activePlatform,
      title,
      caption: caption + '\n\n' + hashtags.map(t => `#${t}`).join(' '),
      hashtags,
      selectedHook,
      script: aiData?.scripts || {},
      videoUrl: videoUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      scheduledAt: runDate ? runDate.toISOString() : undefined
    };

    if (isEverywhere) {
      // For publish everywhere, send jobs for all connected platforms
      const connectedPlatforms = accounts.map(a => a.platform);
      if (connectedPlatforms.length === 0) {
        toast.error('No connected social accounts available. Connect one first.');
        return;
      }

      connectedPlatforms.forEach(plat => {
        scheduleMut.mutate({
          ...payload,
          platform: plat,
          caption: (aiData?.[plat]?.caption || caption) + '\n\n' + (aiData?.[plat]?.hashtags || hashtags).map((t: string) => `#${t}`).join(' ')
        });
      });
    } else {
      scheduleMut.mutate(payload);
    }
  };

  if (productLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const activeAccount = accounts.find(a => a.platform === activePlatform);
  const isPlatformConnected = activePlatform === 'telegram' ? true : !!activeAccount;

  return (
    <div className="space-y-6">
      {/* Sub-Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Content Preview Studio</h1>
          <p className="text-white/50 text-sm mt-1">Refine copies, hooks, composited badges, and video clipping scripts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/social" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Overview</Link>
          <Link to="/admin/social/accounts" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Accounts</Link>
          <Link to="/admin/social/campaigns" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Campaigns</Link>
          <Link to="/admin/social/library" className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Library & History</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (6 cols): AI configuration sidebar */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Generator Trigger */}
          {!aiData ? (
            <div className="glass p-8 rounded-3xl text-center space-y-4">
              <Sparkles className="mx-auto text-primary animate-pulse" size={40} />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-outfit">Ready to Generate Social Content?</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                  ProductVision AI will analyze the product details (deal price, original price, ratings, category) to generate tailor-made captions, urgency hooks, and video scripts.
                </p>
              </div>
              <button 
                onClick={() => aiMut.mutate()}
                disabled={aiMut.isPending}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 font-medium text-sm"
              >
                {aiMut.isPending ? <Loader className="animate-spin" size={16} /> : <Wand2 size={16} />}
                Generate Content & Scripts
              </button>
            </div>
          ) : (
            <>
              {/* Marketing Hooks Variations */}
              <div className="glass p-6 rounded-3xl space-y-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" /> AI Hook Optimization
                </h2>
                <p className="text-xs text-white/40">Select a hook style to insert it at the beginning of your active caption template.</p>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(aiData.hooks || {}).map(([key, val]: any) => (
                    <button
                      key={key}
                      onClick={() => handleHookChange(key)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all text-left max-w-xs ${
                        selectedHook === key 
                          ? 'bg-primary/20 border-primary text-white font-semibold' 
                          : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-[9px] uppercase block text-primary/80 mb-0.5">{key}</span>
                      <span className="line-clamp-1">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Thumbnail & Video Repurposing Panel */}
              <div className="glass p-6 rounded-3xl space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layout size={14} className="text-secondary" /> AI Asset Engines
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Thumbnail compositer */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Image size={14} className="text-primary" /> Thumbnail Compositor
                    </h3>
                    <p className="text-[11px] text-white/40">Composite price badges, discount pills, and borders onto the product image.</p>
                    
                    <button 
                      onClick={handleGenerateThumbnail}
                      disabled={generatingThumbnail}
                      className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      {generatingThumbnail ? <Loader className="animate-spin" size={12} /> : <Wand2 size={12} />}
                      Composite Badges
                    </button>
                  </div>

                  {/* Video repurposer */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Video size={14} className="text-secondary" /> Video Repurposer
                    </h3>
                    <p className="text-[11px] text-white/40">Convert raw product video into short clips optimized for Reels/Shorts.</p>
                    
                    <button 
                      onClick={handleRepurposeVideo}
                      disabled={repurposingVideo}
                      className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      {repurposingVideo ? <Loader className="animate-spin" size={12} /> : <Video size={12} />}
                      Repurpose Video Clips
                    </button>
                  </div>

                </div>

                {/* If video repurposed, show scene detection clips list */}
                {repurposedVideo && (
                  <div className="pt-2 space-y-2">
                    <p className="text-xs font-bold text-white/60">AI Smart Scene Timestamps:</p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {repurposedVideo.scenes?.map((scene: any) => (
                        <div key={scene.id} className="flex justify-between items-center text-[10px] p-2 bg-white/5 rounded-lg border border-white/5">
                          <div>
                            <span className="font-bold text-secondary mr-2">{scene.start}s - {scene.end}s</span>
                            <span className="text-white/80">{scene.label}</span>
                          </div>
                          <span className="text-white/40 truncate max-w-[150px]">{scene.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text-To-Speech Script Voiceover Preview */}
              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 size={14} className="text-accent" /> AI Voiceover Engine
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setVoiceGender('female')}
                      className={`text-[10px] px-2 py-0.5 rounded ${voiceGender === 'female' ? 'bg-primary/20 text-white font-bold' : 'text-white/40'}`}
                    >
                      Female Voice
                    </button>
                    <button 
                      onClick={() => setVoiceGender('male')}
                      className={`text-[10px] px-2 py-0.5 rounded ${voiceGender === 'male' ? 'bg-primary/20 text-white font-bold' : 'text-white/40'}`}
                    >
                      Male Voice
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Voice Script Preview</p>
                    <p className="text-xs text-white/60 truncate mt-1">
                      {aiData.scripts?.[activePlatform === 'youtube' ? '15s' : '30s'] || caption}
                    </p>
                  </div>
                  <button 
                    onClick={handleToggleVoiceover}
                    className="p-3 rounded-full bg-accent/20 text-accent hover:bg-accent hover:text-bg transition-colors"
                    title={isPlayingVoice ? 'Stop' : 'Listen Voiceover'}
                  >
                    {isPlayingVoice ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>

              {/* Content Editor details */}
              <div className="glass p-6 rounded-3xl space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Content Editor</h2>
                
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Title (Only used on Pinterest/YouTube/Facebook)</label>
                  <input 
                    type="text" 
                    className="input py-2 text-sm"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Caption Description</label>
                  <textarea 
                    className="input py-2.5 text-xs h-32"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                  />
                </div>

                {/* Hashtag optimize pills */}
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Optimized Hashtags</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/5 rounded-2xl max-h-24 overflow-y-auto mb-3">
                    {hashtags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        #{tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-primary hover:text-white font-bold ml-0.5">×</button>
                      </span>
                    ))}
                  </div>

                  <form onSubmit={handleAddTag} className="flex gap-2">
                    <input 
                      type="text" 
                      className="input py-1.5 text-xs flex-1"
                      placeholder="Add custom hashtag..."
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                    />
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Add Tag</button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN (5 cols): Device mockup visualizer & Scheduling */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Platform tabs switch */}
          <div className="flex gap-1.5 bg-white/5 p-1.5 rounded-2xl overflow-x-auto shrink-0 border border-white/5">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`text-xs px-3 py-2 rounded-xl transition-all font-semibold whitespace-nowrap ${
                  activePlatform === p.id 
                    ? 'bg-primary text-white' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Connection Authorization Check Alert */}
          {!isPlatformConnected && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-rose-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Not Connected:</span> You don't have an active connection for {activePlatform.toUpperCase()}. Publications will fail. 
                <Link to="/admin/social/accounts" className="underline font-bold text-white ml-1.5">Connect account →</Link>
              </div>
            </div>
          )}

          {/* Device Mockup Canvas */}
          <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-bg max-w-sm mx-auto flex flex-col h-[520px]">
            {/* Phone/Device Top bar */}
            <div className="h-6 bg-black/40 border-b border-white/5 px-4 flex items-center justify-between text-[9px] text-white/30 font-semibold select-none shrink-0">
              <span>9:41</span>
              <div className="w-16 h-4 rounded-full bg-black shrink-0 mx-auto border border-white/5" />
              <span>100%</span>
            </div>

            {/* Platform Mockup rendering */}
            <div className="flex-1 overflow-y-auto p-4 bg-black/10 select-none">
              
              {/* TELEGRAM MOCK */}
              {activePlatform === 'telegram' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                      PV
                    </div>
                    <div className="max-w-[80%] p-3 rounded-2xl bg-zinc-900 border border-white/5 text-xs text-white/90 space-y-2 leading-relaxed">
                      <p className="font-semibold text-sky-400">ProductVision Bot</p>
                      
                      {thumbnailUrl && (
                        <img src={thumbnailUrl} className="w-full rounded-lg object-cover bg-black/40 max-h-36" alt="" />
                      )}
                      
                      <p className="whitespace-pre-line text-[11px] leading-relaxed">
                        {caption || '🔥 DEAL DETECTED 🔥\n\nSamsung Galaxy S25 Ultra...'}
                      </p>
                      
                      {hashtags.length > 0 && (
                        <p className="text-sky-400 font-semibold">
                          {hashtags.map(t => `#${t}`).join(' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INSTAGRAM MOCK */}
              {activePlatform === 'instagram' && (
                <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden text-xs text-white/90 shadow-lg flex flex-col">
                  {/* IG Post Header */}
                  <div className="p-3 border-b border-white/5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                      PV
                    </div>
                    <div>
                      <p className="font-bold text-[11px]">productpilot_ai</p>
                      <p className="text-[9px] text-white/40">Sponsored</p>
                    </div>
                  </div>

                  {/* IG Post Media */}
                  <div className="relative aspect-square bg-black flex items-center justify-center">
                    {videoUrl ? (
                      <video src={videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    ) : thumbnailUrl ? (
                      <img src={thumbnailUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <Image size={24} className="text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* IG Action buttons */}
                  <div className="p-3 border-t border-white/5 space-y-2">
                    <div className="flex gap-3 text-white/80">
                      <span>♥</span>
                      <span>💬</span>
                      <span>✈</span>
                    </div>
                    <div>
                      <span className="font-bold text-[11px] mr-2">productpilot_ai</span>
                      <span className="text-[10px] whitespace-pre-line leading-relaxed">
                        {caption || 'Amazing new find! check reviews in bio.'}
                      </span>
                      {hashtags.length > 0 && (
                        <span className="text-sky-400 text-[9px] ml-1 select-all font-semibold">
                          {hashtags.map(t => `#${t}`).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TWITTER (X) MOCK */}
              {activePlatform === 'twitter' && (
                <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-3 text-xs text-white/95">
                  <div className="flex gap-2">
                    <div className="w-9 h-9 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
                      𝕏
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">ProductPilot AI</span>
                        <span className="text-white/40 text-[11px]">@ProductPilotAI</span>
                      </div>
                      <p className="whitespace-pre-line text-[11px] leading-relaxed mt-1">
                        {caption || 'This viral product is currently on sale! Grab it before deal expires...'}
                      </p>
                      {hashtags.length > 0 && (
                        <p className="text-sky-400 font-semibold mt-1">
                          {hashtags.map(t => `#${t}`).join(' ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {thumbnailUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/5 bg-zinc-950 aspect-video flex items-center justify-center">
                      <img src={thumbnailUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </div>
              )}

              {/* PINTEREST MOCK */}
              {activePlatform === 'pinterest' && (
                <div className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden text-xs text-white/90 shadow-md">
                  {thumbnailUrl && (
                    <img src={thumbnailUrl} className="w-full object-cover bg-black" alt="" />
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-white text-sm font-outfit">
                      {title || 'Must Have Shopping Ideas'}
                    </h3>
                    <p className="text-white/50 text-[10px] leading-relaxed whitespace-pre-line">
                      {caption || 'Explore specifications, customer reviews, and pricing details...'}
                    </p>
                    {hashtags.length > 0 && (
                      <p className="text-sky-400 text-[9px] font-semibold">
                        {hashtags.map(t => `#${t}`).join(' ')}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-3">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px] text-white">
                        P
                      </div>
                      <span className="font-bold text-[10px]">ProductPilot AI</span>
                    </div>
                  </div>
                </div>
              )}

              {/* YOUTUBE SHORTS MOCK */}
              {activePlatform === 'youtube' && (
                <div className="bg-black rounded-2xl overflow-hidden aspect-[9/16] relative max-w-[250px] mx-auto border border-white/10 shadow-xl flex flex-col justify-end">
                  
                  {/* YouTube Video Player Simulation */}
                  {videoUrl ? (
                    <video src={videoUrl} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                      <div className="text-center p-4">
                        <Video size={36} className="text-white/20 mx-auto mb-2" />
                        <p className="text-[10px] text-white/40">Repurpose video to load player preview</p>
                      </div>
                    </div>
                  )}

                  {/* YT Overlay overlay icons */}
                  <div className="absolute right-2 bottom-20 flex flex-col gap-4 text-white font-semibold text-[10px] items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">👍</div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">👎</div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">💬</div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">↗</div>
                  </div>

                  {/* YT Shorts Details Card */}
                  <div className="p-3 bg-gradient-to-t from-black/80 to-transparent space-y-2 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center font-bold text-[9px]">
                        YT
                      </div>
                      <span className="font-bold text-[10px]">@ProductPilotAI</span>
                      <button className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-bold">SUBSCRIBE</button>
                    </div>
                    <p className="text-[10px] font-semibold truncate text-white" title={title}>
                      {title || 'Catchy YouTube Shorts title hook...'}
                    </p>
                    <p className="text-[9px] text-white/60 line-clamp-1 truncate select-none">
                      {caption || 'Check deal details in comment pin.'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Scheduling Campaign / Date controls */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Campaign & Scheduler</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Select Campaign Folder</label>
                <select 
                  className="input py-2 text-xs bg-bg border-white/10"
                  value={selectedCampaign}
                  onChange={e => setSelectedCampaign(e.target.value)}
                >
                  <option value="">No Campaign Folder</option>
                  {campaigns.map((camp: any) => (
                    <option key={camp._id} value={camp._id}>{camp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Schedule Publication Date</label>
                <input 
                  type="date" 
                  className="input py-1.5 text-xs"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Schedule Publication Time</label>
              <input 
                type="time" 
                className="input py-1.5 text-xs"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => handlePublishOrSchedule(false)}
                disabled={scheduleMut.isPending || !isPlatformConnected}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-medium"
              >
                {scheduleMut.isPending ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                {scheduledDate ? 'Queue Scheduled Post' : 'Publish to Active Channel'}
              </button>

              <button 
                onClick={() => handlePublishOrSchedule(true)}
                disabled={scheduleMut.isPending}
                className="btn-secondary w-full py-3 flex items-center justify-center gap-2 text-sm font-medium border border-white/10"
              >
                <Wand2 size={16} className="text-primary animate-pulse" />
                Publish Everywhere (One-Click)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
