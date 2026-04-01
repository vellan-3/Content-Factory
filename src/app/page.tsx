"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Copy, Send, LayoutDashboard, MessageSquare, 
  Image as ImageIcon, Zap, BarChart3, Fingerprint, ExternalLink,
  Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase, type Post, type Meme, type Identity } from "@/lib/supabase";

// --- Utility: Tailwind Merge ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components: Base ---
const Card = ({ children, className, variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "sm" | "accent" | "red" | "blue" | "orange" | "purple" | "teal" }) => {
  const variants = {
    default: "bg-bg2 border-border",
    sm: "bg-bg3 border-border",
    accent: "bg-bg2 border-accent/20",
    red: "bg-bg2 border-red/20",
    blue: "bg-bg2 border-blue/20",
    orange: "bg-bg2 border-orange/20",
    purple: "bg-bg2 border-purple/20",
    teal: "bg-bg2 border-teal/20",
  };
  return (
    <div className={cn("border rounded-lg p-4 mb-3", variants[variant], className)}>
      {children}
    </div>
  );
};

type ColorType = "accent" | "red" | "blue" | "orange" | "teal" | "purple";

const Tag = ({ children, color = "accent", className }: { children: React.ReactNode; color?: ColorType; className?: string }) => {
  const colors: Record<ColorType, string> = {
    accent: "text-accent border-accent/30 bg-accent-dim",
    red: "text-red border-red/30 bg-red-dim",
    blue: "text-blue border-blue/30 bg-blue-dim",
    orange: "text-orange border-orange/30 bg-orange-dim",
    teal: "text-teal border-teal/30 bg-teal-dim",
    purple: "text-purple border-purple/30 bg-purple-dim",
  };
  return (
    <span className={cn("inline-block font-mono text-[10px] uppercase font-medium tracking-[0.06em] px-2 py-0.5 border rounded-[2px]", colors[color], className)}>
      {children}
    </span>
  );
};

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "default" | "sm" | "icon";

const Button = ({ children, className, variant = "secondary", size = "default", onClick, loading, disabled, icon: Icon }: { children: React.ReactNode; className?: string; variant?: ButtonVariant; size?: ButtonSize; onClick?: () => void; loading?: boolean; disabled?: boolean; icon?: any }) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-[#080808] border-accent hover:bg-[#d4e83f]",
    secondary: "bg-bg3 text-text border-border2 hover:border-border3 hover:bg-bg4",
    danger: "bg-red-dim text-red border-red/30 hover:bg-red/20",
    ghost: "bg-transparent border-transparent text-muted hover:text-text",
  };
  const sizes: Record<ButtonSize, string> = {
    default: "px-4 py-2.5 text-sm",
    sm: "px-3 py-1.5 text-[11px]",
    icon: "p-2 min-w-[34px] justify-center",
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={cn("inline-flex items-center gap-2 font-medium rounded-md border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], sizes[size], className)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
};

const Pill = ({ children, active, onClick, color = "accent" }: { children: React.ReactNode; active: boolean; onClick: () => void; color?: ColorType }) => {
  const activeStyles: Record<ColorType, string> = {
    accent: "bg-accent-dim border-accent/40 text-accent",
    red: "bg-red-dim border-red/40 text-red",
    blue: "bg-blue-dim border-blue/40 text-blue",
    orange: "bg-orange-dim border-orange/40 text-orange",
    purple: "bg-purple-dim border-purple/40 text-purple",
    teal: "bg-teal-dim border-teal/40 text-teal",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-[11px] font-mono font-medium tracking-wider uppercase border border-border2 bg-bg3 text-muted rounded-full transition-all hover:border-border3 hover:text-text",
        active ? activeStyles[color] : ""
      )}
    >
      {children}
    </button>
  );
};

// --- Main Application ---
export default function ContentFactory() {
  const [activeTab, setActiveTab] = useState("post");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // --- State: Post Gen ---
  const [postContext, setPostContext] = useState("");
  const [postType, setPostType] = useState("current-event");
  const [postFormat, setPostFormat] = useState("win-drop");
  const [postTone, setPostTone] = useState("casual-confident");
  const [postWinFrame, setPostWinFrame] = useState("real");
  const [postVariants, setPostVariants] = useState<any[]>([]);

  // --- State: Reply Engine ---
  const [replyTarget, setReplyTarget] = useState("");
  const [replyMode, setReplyMode] = useState("vibe");
  const [replyVariants, setReplyVariants] = useState<any[]>([]);

  // --- State: Identity & Persistence ---
  const [identity, setIdentity] = useState<Identity>({
    id: "default",
    voice: ["casual-nigerian"],
    persona: "winning-guy",
    niche: ["web3", "design", "dev"],
    rules: ["Never say gm", "Never beg for follows"],
    updated_at: new Date().toISOString()
  });

  // Load Identity from Supabase on mount
  useEffect(() => {
    const loadIdentity = async () => {
      const { data, error } = await supabase
        .from('identity')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (data) setIdentity(data);
    };
    loadIdentity();
  }, []);

  const saveIdentity = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('identity')
      .upsert({ ...identity, updated_at: new Date().toISOString() });
    
    if (error) showToast("Failed to save Identity", "error");
    else showToast("Identity DNA updated", "success");
    setLoading(false);
  };

  // --- Toast Helper ---
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- AI: Generate Post ---
  const generatePost = async () => {
    if (!postContext) return showToast("Context is required", "error");
    setLoading(true);
    setPostVariants([]);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ 
          context: postContext, 
          format: postFormat, 
          type: "post",
          identity 
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Simple parsing logic (based on the system prompt structure)
      const parts = data.text.split(/Variant \d:/i).filter(Boolean).map((t: string, i: number) => {
        const angleMatch = t.match(/ANGLE: (.*)/);
        const content = t.replace(/ANGLE: .*/, "").trim();
        const labels = ["Straight", "Provocative", "Meme energy"];
        return {
          label: labels[i] || `Variant ${i+1}`,
          angle: angleMatch ? angleMatch[1] : "Unique Angle",
          content: content
        };
      });
      setPostVariants(parts);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- AI: Generate Reply ---
  const generateReply = async () => {
    if (!replyTarget) return showToast("Target post is required", "error");
    setLoading(true);
    setReplyVariants([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ 
          context: replyTarget, 
          format: replyMode, 
          type: "reply",
          identity 
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const parts = data.text.split(/Variant \d:/i).filter(Boolean).map((t: string, i: number) => ({
        label: `Variant ${i+1}`,
        content: t.trim()
      }));
      setReplyVariants(parts);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-black">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[1000] px-4 py-2.5 rounded-lg border border-border2 bg-bg3 flex items-center gap-3 shadow-xl"
          >
            {toast.type === "success" ? <CheckCircle2 className="text-teal w-4 h-4" /> : <AlertCircle className="text-red w-4 h-4" />}
            <span className="text-xs font-mono text-text">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-12 bg-bg/95 backdrop-blur-md border-b border-border z-[200] flex items-center justify-between px-5">
        <div className="font-head text-2xl tracking-widest text-accent">FACTORY</div>
        <div className="flex gap-1 h-full py-1">
          {[
            { id: "post", label: "Post Gen", icon: Zap },
            { id: "reply", label: "Reply Gen", icon: MessageSquare },
            { id: "memes", label: "Meme Vault", icon: ImageIcon },
            { id: "gm", label: "GM / Events", icon: Send },
            { id: "tracker", label: "Tracker", icon: BarChart3 },
            { id: "identity", label: "Identity", icon: Fingerprint },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3.5 h-full rounded-md text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-2",
                activeTab === tab.id ? "bg-accent-dim text-accent" : "text-muted hover:text-text hover:bg-bg3"
              )}
            >
              <tab.icon size={12} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content Area */}
      <main className="pt-24 pb-20 px-5 max-w-[860px] mx-auto">
        
        {/* --- PAGE: POST GEN --- */}
        {activeTab === "post" && (
          <div className="fade-in">
            <header className="mb-10">
              <h1 className="text-6xl sm:text-8xl leading-[0.95] tracking-tight">POST<br /><span className="text-accent">FACTORY</span></h1>
              <p className="text-muted text-sm mt-4">Drop any context. Get a post that makes you win.</p>
            </header>

            <Card className="p-6">
              <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Context Input</div>
              <textarea 
                value={postContext}
                onChange={(e) => setPostContext(e.target.value)}
                placeholder="Drop anything here — something you saw today, a current event, another post, a feeling, a win..."
                rows={4}
                className="w-full bg-bg3 border border-border2 rounded-lg p-3 text-sm focus:border-border3 focus:outline-none transition-all resize-none"
              />
              <div className={cn("text-[10px] font-mono text-right mt-2", postContext.length > 280 ? "text-red" : "text-muted")}>
                {postContext.length} / 280
              </div>

              <div className="h-px bg-border my-6" />

              <div className="space-y-6">
                <div>
                  <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold font-bold">Context Type</div>
                  <div className="flex flex-wrap gap-2">
                    {["current-event", "post-contrast", "personal-win", "larp", "meme-pov", "rant", "observation", "bait", "alpha"].map((t) => (
                      <Pill key={t} active={postType === t} onClick={() => setPostType(t)}>{t.replace("-", " ")}</Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold font-bold">Post Format</div>
                  <div className="flex flex-wrap gap-2">
                    {["win-drop", "gem", "ragebait", "lore-drop", "question-bait", "pov", "provocative", "cringe"].map((f) => (
                      <Pill key={f} active={postFormat === f} onClick={() => setPostFormat(f)}>{f.replace("-", " ")}</Pill>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Tone</div>
                    <div className="flex flex-wrap gap-2">
                      {["casual-confident", "unhinged", "deadpan", "self-aware", "menacing", "absurd"].map((t) => (
                        <Pill key={t} active={postTone === t} onClick={() => setPostTone(t)}>{t.replace("-", " ")}</Pill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Win Frame</div>
                    <div className="flex flex-wrap gap-2">
                      {["real", "pseudo", "made-up", "none"].map((w) => (
                        <Pill key={w} active={postWinFrame === w} onClick={() => setPostWinFrame(w)}>{w.replace("-", " ")}</Pill>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button variant="primary" className="w-full sm:w-auto" onClick={generatePost} loading={loading} icon={Zap}>Generate Posts ↗</Button>
                <Button variant="secondary" size="sm" onClick={() => setPostContext("")}>Clear</Button>
                <div className="sm:ml-auto text-[10px] font-mono text-muted">Generates 3 variants + Meta logic</div>
              </div>
            </Card>

            {/* Results */}
            <AnimatePresence>
              {postVariants.length > 0 && (
                <div className="mt-12 space-y-4">
                  <div className="section-label mb-4 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Generated Variants</div>
                  {postVariants.map((v, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-bg3 border border-border rounded-lg p-5 group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] font-mono text-muted uppercase tracking-wider">{v.label} — <span className="text-accent">{v.angle}</span></div>
                        <Tag color="accent">{v.content.length} chars</Tag>
                      </div>
                      <div className="text-[14px] leading-relaxed text-text whitespace-pre-wrap">{v.content}</div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="primary" icon={Copy} onClick={() => { navigator.clipboard.writeText(v.content); showToast("Copied to clipboard", "success"); }}>Copy ↗</Button>
                        <Button size="sm" variant="secondary" icon={LayoutDashboard} onClick={() => showToast("Logged to tracker (demo)", "info")}>Log Post</Button>
                      </div>
                    </motion.div>
                  ))}

                  <Card variant="purple" className="mt-8">
                    <div className="flex items-center gap-3 mb-3">
                      <Tag color="purple">Queen Reference Check</Tag>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">Does this make you look like you're winning? Is the first sentence strong? Never acknowledge the lose. Only the W counts.</p>
                  </Card>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* --- PAGE: TRACKER --- */}
        {activeTab === "tracker" && (
          <div className="fade-in">
            <header className="mb-10">
              <h1 className="text-6xl sm:text-8xl leading-[0.95] tracking-tight">PERF<br /><span className="text-accent">TRACKER</span></h1>
              <p className="text-muted text-sm mt-4">Manual logs. Pattern analysis. Win rate tracking.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
              <Card className="text-center p-6">
                <div className="font-head text-5xl text-accent">12</div>
                <div className="text-[10px] uppercase font-mono text-muted tracking-widest mt-1">Posts Logged</div>
              </Card>
              <Card className="text-center p-6">
                <div className="font-head text-5xl text-blue">42%</div>
                <div className="text-[10px] uppercase font-mono text-muted tracking-widest mt-1">Banger Rate</div>
              </Card>
              <Card className="text-center p-6">
                <div className="font-head text-5xl text-orange">WIN</div>
                <div className="text-[10px] uppercase font-mono text-muted tracking-widest mt-1">Best Format</div>
              </Card>
            </div>

            <Card>
              <div className="section-label mb-4 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Log a Post</div>
              <div className="space-y-4">
                <textarea placeholder="Paste the post content here..." className="w-full bg-bg3 border border-border2 rounded-lg p-3 text-sm focus:border-border3 focus:outline-none transition-all resize-none" rows={2} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase block mb-1">Likes</label>
                    <input type="number" className="w-full bg-bg3 border border-border2 rounded-md p-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase block mb-1">Replies</label>
                    <input type="number" className="w-full bg-bg3 border border-border2 rounded-md p-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase block mb-1">Win Type</label>
                    <select className="w-full bg-bg3 border border-border2 rounded-md p-2 text-sm focus:outline-none appearance-none">
                      <option>Real W</option>
                      <option>Pseudo W</option>
                      <option>Constructed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase block mb-1">Format</label>
                    <select className="w-full bg-bg3 border border-border2 rounded-md p-2 text-sm focus:outline-none appearance-none">
                      <option>Win Drop</option>
                      <option>Gem</option>
                      <option>Provocation</option>
                    </select>
                  </div>
                </div>
                <Button variant="primary" className="w-full" icon={Plus}>Log Metrics</Button>
              </div>
            </Card>
          </div>
        )}

        {/* --- PAGE: REPLY ENGINE --- */}
        {activeTab === "reply" && (
          <div className="fade-in">
            <header className="mb-10">
              <h1 className="text-6xl sm:text-8xl leading-[0.95] tracking-tight">REPLY<br /><span className="text-accent">ENGINE</span></h1>
              <p className="text-muted text-sm mt-4">Paste target. Pick angle. Counter-frame the lose.</p>
            </header>

            <Card>
              <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Target Post</div>
              <textarea 
                value={replyTarget}
                onChange={(e) => setReplyTarget(e.target.value)}
                placeholder="Paste the tweet you're replying to..."
                className="w-full bg-bg3 border border-border2 rounded-lg p-3 text-sm focus:border-border3 focus:outline-none transition-all resize-none"
                rows={3}
              />
              
              <div className="h-px bg-border my-6" />

              <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Reply Mode</div>
              <div className="flex flex-wrap gap-2">
                {["vibe", "value-add", "contrarian", "strategic-tag", "funny", "bait"].map((m) => (
                  <Pill key={m} active={replyMode === m} onClick={() => setReplyMode(m)} color="blue">{m.replace("-", " ")}</Pill>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <Button variant="primary" onClick={generateReply} loading={loading} icon={MessageSquare}>Generate Replies ↗</Button>
                <Button variant="secondary" size="sm" onClick={() => setReplyTarget("")}>Clear</Button>
              </div>
            </Card>

            {/* Results */}
            <AnimatePresence>
              {replyVariants.length > 0 && (
                <div className="mt-12 space-y-4">
                  {replyVariants.map((v, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-bg3 border border-blue/20 rounded-lg p-5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Tag color="blue">{v.label}</Tag>
                        <span className="text-[10px] font-mono text-muted">HEDGING STRIPPED: YES</span>
                      </div>
                      <div className="text-[14px] leading-relaxed text-text">{v.content}</div>
                      <Button size="sm" variant="ghost" className="mt-4" icon={Copy} onClick={() => { navigator.clipboard.writeText(v.content); showToast("Reply copied", "success"); }}>Copy Reply</Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* --- PAGE: MEME VAULT --- */}
        {activeTab === "memes" && (
          <div className="fade-in">
            <header className="mb-10">
              <h1 className="text-6xl sm:text-8xl leading-[0.95] tracking-tight">MEME<br /><span className="text-accent">VAULT</span></h1>
              <p className="text-muted text-sm mt-4">Visual social proof. Tagged by emotion. Prefer mp4.</p>
            </header>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="section-label text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Your Arsenal</div>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => document.getElementById('meme-upload')?.click()}>Add Media</Button>
                <input 
                  type="file" 
                  id="meme-upload" 
                  className="hidden" 
                  accept="image/*,video/mp4,video/quicktime" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    showToast("Uploading to Cloudinary...", "info");
                    
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
                    
                    try {
                      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
                        method: "POST",
                        body: formData
                      });
                      const data = await res.json();
                      if (data.secure_url) {
                        showToast("Meme saved to cloud!", "success");
                        // Logic to save to Supabase "memes" table would go here
                      }
                    } catch (err) {
                      showToast("Upload failed", "error");
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Mock Slots */}
                {[1,2,3,4].map(n => (
                  <div key={n} className="aspect-square bg-bg3 border border-dashed border-border2 rounded-lg flex flex-col items-center justify-center p-4 hover:border-accent/40 transition-all cursor-pointer group">
                    <ImageIcon className="text-muted group-hover:text-accent transition-all" size={24} />
                    <span className="text-[9px] font-mono text-muted mt-2">Meme Slot {n}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* --- PAGE: IDENTITY --- */}
        {activeTab === "identity" && (
          <div className="fade-in">
            <header className="mb-10">
              <h1 className="text-6xl sm:text-8xl leading-[0.95] tracking-tight">IDENTITY<br /><span className="text-accent">DNA</span></h1>
              <p className="text-muted text-sm mt-4">Fine-tune the voice. The machine is only as good as the DNA.</p>
            </header>

            <Card>
              <div className="space-y-8">
                <div>
                  <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Tone Rules</div>
                  <div className="flex flex-wrap gap-2">
                    {identity.rules.map((rule, i) => (
                      <div key={i} className="flex items-center gap-2 bg-bg3 border border-red/20 px-3 py-1.5 rounded-md">
                        <span className="text-[11px] font-mono text-text">{rule}</span>
                        <Trash2 size={12} className="text-red cursor-pointer" />
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" icon={Plus}>Add Rule</Button>
                  </div>
                </div>

                <div>
                  <div className="section-label mb-3 text-[10px] uppercase font-mono text-muted tracking-widest font-bold">Gen-Z / CT Slang Feed</div>
                  <textarea 
                    placeholder="Add phrases you use often... (e.g. 'math is mathing', 'we move')"
                    className="w-full bg-bg3 border border-border2 rounded-lg p-3 text-sm focus:border-border3 focus:outline-none transition-all resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-border">
                <Button variant="primary" icon={Fingerprint} onClick={saveIdentity} loading={loading}>Save DNA to Supabase</Button>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
