import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Heart, MessageCircle, Share2, Edit3, Trash2,
  User, Home, TrendingUp, Bell, Search, X, Check,
  MapPin, Users, Star, Zap,
  Send, Sparkles, Hash, Image,
  Shield, BarChart2, LogOut,
  UserPlus, UserCheck, Menu, ArrowLeft,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: SocialPulseApp })

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string
  name: string
  username: string
  profession: string
  bio: string
  avatar: string
  phone?: string
  address?: string
  parentsName?: string
  location: string
  followers: string[]
  following: string[]
  joinDate: string
  postsCount: number
  isVerified?: boolean
}

interface Post {
  id: string
  userId: string
  content: string
  image?: string
  likes: string[]
  timestamp: number
  isEdited: boolean
  hashtags: string[]
  category: 'social_good' | 'general'
  viralScore?: number
  sentiment?: 'Positive' | 'Negative' | 'Neutral'
}

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: number
}

type View = 'feed' | 'profile' | 'trending' | 'notifications' | 'search'

// ─── Storage ──────────────────────────────────────────────────────────────────

const SK = { users: 'sp_users', posts: 'sp_posts', messages: 'sp_messages', cu: 'sp_cu' }

const ls = {
  get<T>(k: string, fb: T): T {
    try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fb } catch { return fb }
  },
  set(k: string, v: unknown) { localStorage.setItem(k, JSON.stringify(v)) },
}

const uid = () => Math.random().toString(36).slice(2, 11)

// ─── Seed data ─────────────────────────────────────────────────────────────────

const SEED_USERS: UserProfile[] = [
  { id: 'u1', name: 'Priya Sharma', username: 'priya_sharma', profession: 'Social Activist', bio: 'Fighting for equality and justice. Every voice matters. 🌿', avatar: 'https://i.pravatar.cc/150?img=47', phone: '', address: '', parentsName: '', location: 'Delhi, India', followers: ['u2', 'u3', 'u4'], following: ['u2', 'u3'], joinDate: '2024-01-15', postsCount: 142, isVerified: true },
  { id: 'u2', name: 'Rahul Verma', username: 'rahul_v', profession: 'Software Engineer', bio: 'Building the future, one commit at a time. 🚀', avatar: 'https://i.pravatar.cc/150?img=68', phone: '', address: '', parentsName: '', location: 'Mumbai, India', followers: ['u1', 'u3'], following: ['u1', 'u4'], joinDate: '2024-02-20', postsCount: 87, isVerified: false },
  { id: 'u3', name: 'Anjali Singh', username: 'anjali_s', profession: 'Journalist', bio: 'Truth teller. Story finder. Chai lover ☕', avatar: 'https://i.pravatar.cc/150?img=32', phone: '', address: '', parentsName: '', location: 'Bangalore, India', followers: ['u1', 'u2', 'u4'], following: ['u1', 'u2'], joinDate: '2024-03-05', postsCount: 234, isVerified: true },
  { id: 'u4', name: 'Vikram Nair', username: 'vikram_n', profession: 'Doctor', bio: 'Healing hearts and minds. Public health advocate 🏥', avatar: 'https://i.pravatar.cc/150?img=12', phone: '', address: '', parentsName: '', location: 'Chennai, India', followers: ['u1', 'u2'], following: ['u1', 'u3'], joinDate: '2024-01-30', postsCount: 56, isVerified: false },
]

const SEED_POSTS: Post[] = [
  { id: 'p1', userId: 'u1', content: 'Clean water is a right, not a privilege. Today we helped install 50 water purifiers in rural villages. Small steps, big impact! 💧 #WaterForAll #SocialGood', likes: ['u2', 'u3', 'u4'], timestamp: Date.now() - 7200000, isEdited: false, hashtags: ['WaterForAll', 'SocialGood'], category: 'social_good', viralScore: 87, sentiment: 'Positive' },
  { id: 'p2', userId: 'u3', content: 'Breaking: Local government launches free digital literacy program for senior citizens. This is how technology should be used — to include, not exclude. 👏 #DigitalIndia #Inclusion', likes: ['u1', 'u4'], timestamp: Date.now() - 18000000, isEdited: false, hashtags: ['DigitalIndia', 'Inclusion'], category: 'social_good', viralScore: 72, sentiment: 'Positive' },
  { id: 'p3', userId: 'u2', content: 'Just shipped a feature that\'ll help 10,000+ small businesses manage accounts digitally. Technology for the grassroots level hits different 🛠️ #TechForGood', likes: ['u1', 'u3'], timestamp: Date.now() - 28800000, isEdited: false, hashtags: ['TechForGood'], category: 'general', viralScore: 65, sentiment: 'Positive' },
  { id: 'p4', userId: 'u4', content: 'Mental health awareness starts at home. Talk to your family. Check on your neighbours. A simple "How are you?" can save a life. 💚 #MentalHealth #CommunityFirst', likes: ['u1', 'u2', 'u3'], timestamp: Date.now() - 43200000, isEdited: false, hashtags: ['MentalHealth', 'CommunityFirst'], category: 'social_good', viralScore: 91, sentiment: 'Positive' },
]

// ─── AI helper ─────────────────────────────────────────────────────────────────

async function aiCall(action: string, text: string, ctx?: string): Promise<string> {
  try {
    const r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, text, context: ctx }) })
    const d = await r.json()
    return d.result ?? ''
  } catch { return '' }
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function getEliteBadge(count: number) {
  if (count >= 10_000_000) return { label: '💎 Crore Elite', color: 'from-yellow-400 to-amber-600' }
  if (count >= 1_000_000) return { label: '🏆 10L Elite', color: 'from-fuchsia-400 to-pink-600' }
  if (count >= 100_000) return { label: '⭐ 1L Elite', color: 'from-blue-400 to-cyan-500' }
  return null
}

function timeAgo(ts: number) {
  const d = Date.now() - ts
  if (d < 60000) return 'just now'
  if (d < 3600000) return `${Math.floor(d / 60000)}m`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`
  return `${Math.floor(d / 86400000)}d`
}

// ─── Style constants ───────────────────────────────────────────────────────────

const glass = 'bg-white/5 backdrop-blur-xl border border-white/10'
const gHover = 'hover:bg-white/10 transition-all duration-200'
const purp = 'bg-gradient-to-r from-violet-600 to-blue-600'
const purpHover = 'hover:from-violet-500 hover:to-blue-500'
const btn = 'px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer'

// ─── Avatar ────────────────────────────────────────────────────────────────────

function Av({ user, size = 40, onClick }: { user: UserProfile; size?: number; onClick?: () => void }) {
  const badge = getEliteBadge(user.followers.length)
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6d28d9&color=fff`
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }} onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      <img src={user.avatar || fallback} alt={user.name} className="rounded-full object-cover ring-2 ring-violet-500/50 w-full h-full" onError={e => { (e.target as HTMLImageElement).src = fallback }} />
      {badge && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-xs">⭐</div>}
    </div>
  )
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

function AuthModal({ onLogin }: { onLogin: (u: UserProfile) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [f, setF] = useState({ name: '', username: '', profession: '', password: '' })
  const [err, setErr] = useState('')

  function submit() {
    const users = ls.get<UserProfile[]>(SK.users, SEED_USERS)
    if (mode === 'login') {
      const u = users.find(u => u.username === f.username)
      if (!u) { setErr('User not found. Try demo login.'); return }
      onLogin(u)
    } else {
      if (!f.name || !f.username || !f.profession) { setErr('Please fill all required fields'); return }
      if (users.find(u => u.username === f.username)) { setErr('Username already taken'); return }
      const nu: UserProfile = { id: uid(), name: f.name, username: f.username, profession: f.profession, bio: '', avatar: `https://i.pravatar.cc/150?u=${f.username}`, phone: '', address: '', parentsName: '', location: '', followers: [], following: [], joinDate: new Date().toISOString().slice(0, 10), postsCount: 0 }
      ls.set(SK.users, [...users, nu])
      onLogin(nu)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #050510 70%)' }}>
      <div className={`${glass} rounded-3xl p-8 w-full max-w-md mx-4`} style={{ boxShadow: '0 0 80px rgba(139,92,246,0.35)' }}>
        <div className="text-center mb-8">
          <div className="text-5xl font-black bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">SocialPulse</div>
          <p className="text-white/40 text-sm mt-1">Connect. Share. Inspire.</p>
        </div>
        <div className="flex mb-5 rounded-xl overflow-hidden border border-white/10">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === m ? `${purp} text-white` : 'text-white/40 hover:text-white'}`}>{m === 'login' ? 'Sign In' : 'Register'}</button>
          ))}
        </div>
        <div className="space-y-3">
          {mode === 'register' && <>
            <input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" className={`w-full ${glass} rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-violet-500`} />
            <input value={f.profession} onChange={e => setF(p => ({ ...p, profession: e.target.value }))} placeholder="Profession *" className={`w-full ${glass} rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-violet-500`} />
          </>}
          <input value={f.username} onChange={e => setF(p => ({ ...p, username: e.target.value }))} placeholder="Username *" className={`w-full ${glass} rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-violet-500`} />
          <input type="password" value={f.password} onChange={e => setF(p => ({ ...p, password: e.target.value }))} placeholder="Password" className={`w-full ${glass} rounded-xl px-4 py-2.5 text-white placeholder-white/30 outline-none`} />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button onClick={submit} className={`w-full ${btn} ${purp} ${purpHover} text-white py-3`}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          {mode === 'login' && (
            <button onClick={() => { const u = ls.get<UserProfile[]>(SK.users, SEED_USERS)[0]; onLogin(u) }} className={`w-full ${btn} border border-white/20 text-white/60 hover:border-violet-500 hover:text-white py-3 text-sm`}>
              ⚡ Demo Login (Priya Sharma)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Composer ──────────────────────────────────────────────────────────────────

function Composer({ cu, onPost }: { cu: UserProfile; onPost: (p: Post) => void }) {
  const [text, setText] = useState('')
  const [imgUrl, setImgUrl] = useState('')
  const [showImg, setShowImg] = useState(false)
  const [busy, setBusy] = useState('')
  const [sentiment, setSentiment] = useState('')
  const [viralScore, setViralScore] = useState<number | null>(null)
  const [aiMsg, setAiMsg] = useState('')
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSentiment = useCallback(async (t: string) => {
    if (t.length < 20) { setSentiment(''); return }
    const r = await aiCall('sentiment', t)
    if (r) setSentiment(r)
  }, [])

  function onTextChange(v: string) {
    setText(v)
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(() => doSentiment(v), 1000)
  }

  async function ai(action: string, ctx?: string) {
    if (!text.trim()) { setAiMsg('✏️ Write something first!'); return }
    setBusy(action); setAiMsg('')
    const r = await aiCall(action, text, ctx)
    if (['enhance', 'tone', 'complete'].includes(action) && r) setText(r)
    else if (action === 'hashtags' && r) setText(t => t.trimEnd() + '\n' + r)
    else if (action === 'viral_score' && r) setViralScore(parseInt(r) || null)
    else if (r) setAiMsg(
      action === 'image_prompt' ? '🎨 Image prompt: ' + r :
      action === 'summarize' ? '📝 Summary: ' + r :
      action === 'safety' ? (r.startsWith('SAFE') ? '✅ ' : '⚠️ ') + r : r
    )
    setBusy('')
  }

  async function post() {
    if (!text.trim()) return
    setBusy('posting')
    const safety = await aiCall('safety', text)
    if (safety.startsWith('UNSAFE')) { setAiMsg('⚠️ Content blocked: ' + safety); setBusy(''); return }
    const hashtags = (text.match(/#(\w+)/g) ?? []).map(h => h.slice(1))
    const isSG = /water|health|education|environment|equality|justice|community|rural|digital|poverty|welfare|भलाई/i.test(text)
    onPost({ id: uid(), userId: cu.id, content: text, image: imgUrl || undefined, likes: [], timestamp: Date.now(), isEdited: false, hashtags, category: isSG ? 'social_good' : 'general' })
    setText(''); setImgUrl(''); setShowImg(false); setSentiment(''); setViralScore(null); setAiMsg('')
    setBusy('')
  }

  const sEmoji = sentiment === 'Positive' ? '😊' : sentiment === 'Negative' ? '😔' : sentiment === 'Neutral' ? '😐' : ''

  return (
    <div className={`${glass} rounded-2xl p-4 mb-4`}>
      <div className="flex gap-3">
        <Av user={cu} size={44} />
        <div className="flex-1">
          <textarea value={text} onChange={e => onTextChange(e.target.value)} placeholder="What's pulsing? Share your thoughts..." rows={3} className="w-full bg-transparent text-white placeholder-white/30 outline-none resize-none text-[15px]" />
          {sentiment && <div className="text-xs text-white/40 mb-2">{sEmoji} {sentiment} tone detected</div>}
          {viralScore !== null && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/40">Viral Score:</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10">
                <div className={`h-full rounded-full transition-all duration-700 ${viralScore > 70 ? 'bg-green-400' : viralScore > 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${viralScore}%` }} />
              </div>
              <span className="text-xs font-bold text-white">{viralScore}/100</span>
            </div>
          )}
          {aiMsg && (
            <div className={`${glass} rounded-xl p-3 mb-3 text-sm text-white/80 border border-violet-500/30 flex justify-between`}>
              <span>{aiMsg}</span>
              <button onClick={() => setAiMsg('')} className="text-white/30 hover:text-white ml-2 flex-shrink-0"><X size={12} /></button>
            </div>
          )}
          {showImg && <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="Paste image URL..." className={`w-full ${glass} rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none mb-3`} />}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              ['✨ Enhance', 'enhance'], ['🎭 Pro', 'tone', 'professional'], ['😄 Funny', 'tone', 'funny'],
              ['💡 Inspire', 'tone', 'inspiring'], ['# Hashtags', 'hashtags'], ['📝 Summarize', 'summarize'],
              ['🔥 Viral Score', 'viral_score'], ['🎨 Image Idea', 'image_prompt'], ['✏️ Complete', 'complete'], ['🛡️ Safety', 'safety'],
            ].map(([label, action, ctx]) => (
              <button key={label} onClick={() => ai(action, ctx)} disabled={!!busy}
                className="text-xs bg-white/5 hover:bg-white/10 border border-violet-500/30 hover:border-violet-400 text-white/60 hover:text-white rounded-lg px-2.5 py-1 transition-all disabled:opacity-40">
                {busy === action ? '⏳' : label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowImg(v => !v)} className={`text-white/40 hover:text-violet-400 transition-colors`}><Image size={18} /></button>
              <span className={`text-xs ${text.length > 260 ? 'text-red-400' : 'text-white/25'}`}>{text.length}/280</span>
            </div>
            <button onClick={post} disabled={!text.trim() || text.length > 280 || busy === 'posting'}
              className={`${btn} ${purp} ${purpHover} text-white flex items-center gap-2 shadow-lg shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Zap size={15} /> {busy === 'posting' ? 'Posting...' : 'Pulse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PostCard ──────────────────────────────────────────────────────────────────

function PostCard({ post, users, cu, onLike, onDelete, onEdit, onViewProfile }: {
  post: Post; users: UserProfile[]; cu: UserProfile
  onLike: (id: string) => void; onDelete: (id: string) => void
  onEdit: (id: string, content: string) => void; onViewProfile: (id: string) => void
}) {
  const author = users.find(u => u.id === post.userId)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(post.content)
  const [aiReply, setAiReply] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [loadingAction, setLoadingAction] = useState('')
  if (!author) return null
  const liked = post.likes.includes(cu.id)
  const isOwn = post.userId === cu.id
  const elite = getEliteBadge(author.followers.length)

  async function getReply() {
    setLoadingAction('reply')
    const r = await aiCall('reply', post.content)
    setAiReply(r); setLoadingAction('')
  }
  async function getSummary() {
    if (aiSummary) { setAiSummary(''); return }
    setLoadingAction('sum')
    const r = await aiCall('summarize', post.content)
    setAiSummary(r); setLoadingAction('')
  }

  return (
    <div className={`${glass} rounded-2xl p-4 mb-3 ${post.category === 'social_good' ? 'border-l-[3px] border-l-violet-500' : ''}`}>
      <div className="flex gap-3">
        <Av user={author} size={44} onClick={() => onViewProfile(author.id)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button onClick={() => onViewProfile(author.id)} className="font-semibold text-white hover:text-violet-300 transition-colors">
                {author.name}
              </button>
              {author.isVerified && <span className="ml-1 text-blue-400 text-sm">✓</span>}
              {elite && <span className={`ml-2 text-xs font-bold bg-gradient-to-r ${elite.color} bg-clip-text text-transparent`}>{elite.label}</span>}
              <div className="text-xs text-white/35">@{author.username} · {author.profession} · {timeAgo(post.timestamp)}</div>
            </div>
            {isOwn && !editing && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditing(true)} className="text-white/25 hover:text-violet-400 p-1 transition-colors"><Edit3 size={13} /></button>
                <button onClick={() => onDelete(post.id)} className="text-white/25 hover:text-red-400 p-1 transition-colors"><Trash2 size={13} /></button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} className="w-full bg-white/5 rounded-xl p-3 text-white outline-none resize-none text-sm" />
              <div className="flex gap-2 mt-2">
                <button onClick={() => { onEdit(post.id, editText); setEditing(false) }} className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs border border-white/10 text-white/50 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-white/85 text-[14px] leading-relaxed whitespace-pre-wrap">
              {post.content}{post.isEdited && <span className="text-white/25 text-xs ml-1">(edited)</span>}
            </p>
          )}

          {post.image && <img src={post.image} alt="" className="mt-3 rounded-xl max-h-72 object-cover w-full" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />}

          {aiSummary && (
            <div className={`${glass} rounded-xl p-2.5 mt-2 text-xs text-white/70 border border-violet-500/20`}>✨ {aiSummary}</div>
          )}

          <div className="flex gap-2 mt-2 flex-wrap">
            {post.sentiment && <span className={`text-xs px-2 py-0.5 rounded-full ${post.sentiment === 'Positive' ? 'bg-green-500/15 text-green-400' : post.sentiment === 'Negative' ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-white/40'}`}>{post.sentiment}</span>}
            {post.category === 'social_good' && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">Social Good</span>}
            {post.viralScore !== undefined && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">🔥 {post.viralScore}</span>}
          </div>

          {aiReply && (
            <div className={`${glass} rounded-xl p-3 mt-2 border border-violet-500/20`}>
              <div className="text-[11px] text-violet-400 mb-1">✨ AI Reply Suggestion</div>
              <p className="text-sm text-white/80">{aiReply}</p>
              <button onClick={() => setAiReply('')} className="text-[10px] text-white/25 hover:text-white mt-1">Dismiss</button>
            </div>
          )}

          <div className="flex gap-4 mt-3 text-white/35">
            <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors hover:text-red-400 ${liked ? 'text-red-400' : ''}`}>
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {post.likes.length}
            </button>
            <button onClick={getReply} disabled={loadingAction === 'reply'} className="flex items-center gap-1.5 text-sm hover:text-violet-400 transition-colors">
              <Sparkles size={13} /> {loadingAction === 'reply' ? '...' : 'AI Reply'}
            </button>
            <button onClick={getSummary} disabled={loadingAction === 'sum'} className="flex items-center gap-1.5 text-sm hover:text-blue-400 transition-colors">
              <BarChart2 size={13} /> {loadingAction === 'sum' ? '...' : aiSummary ? 'Hide' : 'Summarize'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile ───────────────────────────────────────────────────────────────────

function ProfilePage({ pu, cu, users, posts, onFollow, onUpdate, onBack }: {
  pu: UserProfile; cu: UserProfile; users: UserProfile[]; posts: Post[]
  onFollow: (id: string) => void; onUpdate: (u: Partial<UserProfile>) => void; onBack: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState({ ...pu })
  const isOwn = pu.id === cu.id
  const isFollowing = cu.following.includes(pu.id)
  const userPosts = posts.filter(p => p.userId === pu.id).sort((a, b) => b.timestamp - a.timestamp)
  const elite = getEliteBadge(pu.followers.length)
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(pu.name)}&background=6d28d9&color=fff`

  function save() { onUpdate({ name: f.name, profession: f.profession, bio: f.bio, avatar: f.avatar, location: f.location, parentsName: f.parentsName, phone: f.phone }); setEditing(false) }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Feed
      </button>
      <div className={`${glass} rounded-2xl overflow-hidden mb-4`}>
        <div className="h-28 bg-gradient-to-r from-violet-800/50 to-blue-800/50" />
        <div className="px-5 pb-5">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <img src={f.avatar || fallback} alt={pu.name} className="w-24 h-24 rounded-full ring-4 ring-violet-500 object-cover" onError={e => { (e.target as HTMLImageElement).src = fallback }} />
            {isOwn ? (
              <button onClick={() => editing ? save() : setEditing(true)} className={`${btn} ${purp} text-white text-sm flex items-center gap-1.5 mb-1`}>
                {editing ? <><Check size={14} />Save</> : <><Edit3 size={14} />Edit Profile</>}
              </button>
            ) : (
              <button onClick={() => onFollow(pu.id)} className={`${btn} ${isFollowing ? 'border border-white/20 text-white' : `${purp} text-white`} text-sm flex items-center gap-1.5 mb-1`}>
                {isFollowing ? <><UserCheck size={14} />Following</> : <><UserPlus size={14} />Follow</>}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-2.5">
              {[['name', 'Name'], ['profession', 'Profession'], ['avatar', 'Photo URL'], ['location', 'Location'], ['parentsName', 'Parents\' Name']].map(([k, ph]) => (
                <input key={k} value={(f as Record<string, string>)[k] ?? ''} onChange={e => setF(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} className={`w-full ${glass} rounded-xl px-3 py-2 text-white text-sm outline-none`} />
              ))}
              <textarea value={f.bio} onChange={e => setF(p => ({ ...p, bio: e.target.value }))} placeholder="Bio" rows={2} className={`w-full ${glass} rounded-xl px-3 py-2 text-white text-sm outline-none resize-none`} />
              <input value={f.phone ?? ''} onChange={e => setF(p => ({ ...p, phone: e.target.value }))} placeholder="Mobile (private)" type="tel" className={`w-full ${glass} rounded-xl px-3 py-2 text-white text-sm outline-none`} />
              <p className="text-xs text-white/30 flex items-center gap-1"><Shield size={10} /> Mobile & address are encrypted and never shown publicly</p>
              <button onClick={() => setEditing(false)} className="text-sm text-white/40 hover:text-white">Cancel</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white">{pu.name}</h2>
                {pu.isVerified && <span className="text-blue-400">✓</span>}
                {elite && <span className={`text-sm font-bold bg-gradient-to-r ${elite.color} bg-clip-text text-transparent`}>{elite.label}</span>}
              </div>
              <div className="text-white/40 text-sm">@{pu.username} · {pu.profession}</div>
              {pu.bio && <p className="text-white/75 text-sm mt-2">{pu.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/40">
                {pu.location && <span className="flex items-center gap-1"><MapPin size={11} />{pu.location}</span>}
                <span className="flex items-center gap-1"><Star size={11} />Joined {pu.joinDate}</span>
                {isOwn && pu.phone && <span className="flex items-center gap-1"><Shield size={11} />Phone: ••••{pu.phone.slice(-4)}</span>}
              </div>
              <div className="flex gap-5 mt-3 text-sm">
                <span><strong className="text-white">{pu.following.length}</strong> <span className="text-white/40">Following</span></span>
                <span><strong className="text-white">{pu.followers.length}</strong> <span className="text-white/40">Followers</span></span>
                <span><strong className="text-white">{userPosts.length}</strong> <span className="text-white/40">Pulses</span></span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {userPosts.length === 0 && <div className="text-center text-white/25 py-10">No pulses yet.</div>}
        {userPosts.map(p => (
          <div key={p.id} className={`${glass} rounded-2xl p-4`}>
            <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{p.content}</p>
            {p.image && <img src={p.image} alt="" className="mt-2 rounded-xl max-h-48 object-cover w-full" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />}
            <div className="flex gap-3 mt-2 text-white/30 text-xs">
              <span className="flex items-center gap-1"><Heart size={11} fill="currentColor" className="text-red-400/50" /> {p.likes.length}</span>
              <span>{timeAgo(p.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

function ChatPanel({ cu, users, messages, onSend, onClose }: {
  cu: UserProfile; users: UserProfile[]; messages: Message[]
  onSend: (to: string, content: string) => void; onClose: () => void
}) {
  const [sel, setSel] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [smartReply, setSmartReply] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const convo = sel ? messages.filter(m => (m.from === cu.id && m.to === sel) || (m.from === sel && m.to === cu.id)).sort((a, b) => a.timestamp - b.timestamp) : []
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [convo.length])
  const partner = sel ? users.find(u => u.id === sel) : null
  const others = users.filter(u => u.id !== cu.id)

  async function getSmartReply() {
    if (!convo.length) return
    setLoading(true)
    const r = await aiCall('reply', convo[convo.length - 1].content)
    setSmartReply(r); setLoading(false)
  }

  function send(text?: string) {
    const t = text ?? input
    if (!t.trim() || !sel) return
    onSend(sel, t); setInput(''); setSmartReply('')
  }

  return (
    <div className="fixed bottom-4 right-4 w-72 z-40" style={{ height: sel ? 460 : 280 }}>
      <div className={`${glass} rounded-2xl flex flex-col h-full`} style={{ boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
        <div className={`${purp} rounded-t-2xl px-4 py-2.5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-2">
            {sel && <button onClick={() => setSel(null)} className="text-white/70 hover:text-white"><ArrowLeft size={14} /></button>}
            <span className="font-semibold text-white text-sm">{partner ? partner.name : '💬 Messages'}</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={14} /></button>
        </div>
        {!sel ? (
          <div className="flex-1 overflow-y-auto p-2">
            {others.map(u => (
              <button key={u.id} onClick={() => setSel(u.id)} className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl ${gHover} text-left`}>
                <Av user={u} size={32} />
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium truncate">{u.name}</div>
                  <div className="text-white/35 text-xs truncate">{u.profession}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {convo.length === 0 && <div className="text-center text-white/25 text-sm py-6">Say hello! 👋</div>}
              {convo.map(m => {
                const mine = m.from === cu.id
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${mine ? `${purp} text-white` : `${glass} text-white/85`}`}>{m.content}</div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            {smartReply && (
              <div className="px-3 pb-2">
                <button onClick={() => send(smartReply)} className="text-xs bg-violet-600/25 border border-violet-500/30 text-violet-300 px-3 py-1.5 rounded-lg hover:bg-violet-600/40 w-full text-left truncate">
                  ✨ {smartReply}
                </button>
              </div>
            )}
            <div className="p-3 border-t border-white/10 flex gap-2 items-center flex-shrink-0">
              <button onClick={getSmartReply} disabled={loading} className="text-violet-400 hover:text-violet-300 flex-shrink-0" title="AI Smart Reply"><Sparkles size={15} /></button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Message..." className="flex-1 bg-transparent text-white placeholder-white/25 outline-none text-sm" />
              <button onClick={() => send()} className="text-violet-400 hover:text-violet-300 flex-shrink-0"><Send size={15} /></button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Trending Sidebar ──────────────────────────────────────────────────────────

function TrendingSidebar({ posts, users, onViewProfile }: { posts: Post[]; users: UserProfile[]; onViewProfile: (id: string) => void }) {
  const trending = [...posts].filter(p => p.category === 'social_good').sort((a, b) => b.likes.length - a.likes.length).slice(0, 4)
  const suggestions = users.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className={`${glass} rounded-2xl p-4`}>
        <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm"><TrendingUp size={15} className="text-violet-400" /> Trending for Good</h3>
        {trending.map((p, i) => {
          const author = users.find(u => u.id === p.userId)
          return (
            <div key={p.id} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : 'text-orange-600'}`}>#{i + 1}</span>
                <span className="text-white/35 text-xs">{author?.name}</span>
                <span className="ml-auto text-xs text-red-400 flex items-center gap-0.5"><Heart size={9} fill="currentColor" /> {p.likes.length}</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{p.content}</p>
            </div>
          )
        })}
      </div>

      <div className={`${glass} rounded-2xl p-4`}>
        <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm"><Users size={15} className="text-blue-400" /> Suggested</h3>
        {suggestions.map(u => (
          <div key={u.id} className={`flex items-center gap-2.5 mb-3 last:mb-0 cursor-pointer ${gHover} rounded-xl p-1.5 -mx-1.5`} onClick={() => onViewProfile(u.id)}>
            <Av user={u} size={34} />
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{u.name}</div>
              <div className="text-white/35 text-xs truncate">{u.profession}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${glass} rounded-2xl p-4`}>
        <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm"><Sparkles size={13} className="text-violet-400" /> AI Insights</h3>
        <p className="text-white/45 text-xs leading-relaxed">Posts about water, health, education & environment get <span className="text-violet-300">3× more reach</span> on SocialPulse. Use ✨ Enhance to boost impact.</p>
      </div>
    </div>
  )
}

// ─── Notifications ─────────────────────────────────────────────────────────────

function Notifications({ cu, users, posts }: { cu: UserProfile; users: UserProfile[]; posts: Post[] }) {
  const myPosts = posts.filter(p => p.userId === cu.id)
  const notifs = myPosts.flatMap(p => p.likes.map(uid => ({ type: 'like', uid, post: p, key: `${uid}-${p.id}` }))).slice(0, 10)
  return (
    <div className={`${glass} rounded-2xl p-4`}>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-violet-400" /> Notifications</h2>
      {notifs.length === 0 && <div className="text-center text-white/25 py-10">No notifications yet.</div>}
      {notifs.map(n => {
        const from = users.find(u => u.id === n.uid)
        if (!from) return null
        return (
          <div key={n.key} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <Av user={from} size={36} />
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm font-medium">{from.name}</span>
              <span className="text-white/45 text-sm"> liked your pulse</span>
              <div className="text-white/25 text-xs line-clamp-1 mt-0.5">{n.post.content.slice(0, 55)}…</div>
            </div>
            <Heart size={14} className="text-red-400 flex-shrink-0" fill="currentColor" />
          </div>
        )
      })}
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function SocialPulseApp() {
  const [cu, setCu] = useState<UserProfile | null>(() => {
    const id = ls.get<string | null>(SK.cu, null)
    if (!id) return null
    const all = ls.get<UserProfile[]>(SK.users, SEED_USERS)
    return all.find(u => u.id === id) ?? null
  })
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const s = ls.get<UserProfile[]>(SK.users, [])
    return s.length ? s : SEED_USERS
  })
  const [posts, setPosts] = useState<Post[]>(() => {
    const s = ls.get<Post[]>(SK.posts, [])
    return s.length ? s : SEED_POSTS
  })
  const [msgs, setMsgs] = useState<Message[]>(() => ls.get<Message[]>(SK.messages, []))
  const [view, setView] = useState<View>('feed')
  const [profileId, setProfileId] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => { ls.set(SK.users, users) }, [users])
  useEffect(() => { ls.set(SK.posts, posts) }, [posts])
  useEffect(() => { ls.set(SK.messages, msgs) }, [msgs])

  function login(user: UserProfile) { ls.set(SK.cu, user.id); setCu(user) }
  function logout() { ls.set(SK.cu, null); setCu(null) }

  function addPost(p: Post) {
    setPosts(ps => [p, ...ps])
    setUsers(us => us.map(u => u.id === cu!.id ? { ...u, postsCount: u.postsCount + 1 } : u))
  }

  function likePost(id: string) {
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p
      const liked = p.likes.includes(cu!.id)
      return { ...p, likes: liked ? p.likes.filter(i => i !== cu!.id) : [...p.likes, cu!.id] }
    }))
  }

  function followUser(uid: string) {
    setUsers(us => us.map(u => {
      if (u.id === cu!.id) return { ...u, following: u.following.includes(uid) ? u.following.filter(i => i !== uid) : [...u.following, uid] }
      if (u.id === uid) return { ...u, followers: u.followers.includes(cu!.id) ? u.followers.filter(i => i !== cu!.id) : [...u.followers, cu!.id] }
      return u
    }))
    setCu(c => c ? { ...c, following: c.following.includes(uid) ? c.following.filter(i => i !== uid) : [...c.following, uid] } : c)
  }

  function updateProfile(updates: Partial<UserProfile>) {
    setUsers(us => us.map(u => u.id === cu!.id ? { ...u, ...updates } : u))
    setCu(c => c ? { ...c, ...updates } : c)
  }

  function sendMessage(to: string, content: string) {
    setMsgs(ms => [...ms, { id: uid(), from: cu!.id, to, content, timestamp: Date.now() }])
  }

  function viewProfile(id: string) { setProfileId(id); setView('profile'); setMobileNav(false) }

  if (!cu) return <AuthModal onLogin={login} />

  const pu = view === 'profile' && profileId ? (users.find(u => u.id === profileId) ?? cu) : cu
  const filtered = searchQ
    ? posts.filter(p => p.content.toLowerCase().includes(searchQ.toLowerCase()) || users.find(u => u.id === p.userId)?.name.toLowerCase().includes(searchQ.toLowerCase()))
    : [...posts].sort((a, b) => b.timestamp - a.timestamp)

  const navItems: { icon: React.ElementType; label: string; v: View }[] = [
    { icon: Home, label: 'Feed', v: 'feed' },
    { icon: TrendingUp, label: 'Trending', v: 'trending' },
    { icon: Bell, label: 'Alerts', v: 'notifications' },
    { icon: Search, label: 'Search', v: 'search' },
  ]

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(ellipse 80% 80% at 20% 10%, #1a0533 0%, #050510 45%, #000820 100%)' }}>
      {/* Header */}
      <header className={`sticky top-0 z-30 ${glass} border-b border-white/10`}>
        <div className="max-w-6xl mx-auto px-4 h-13 flex items-center justify-between gap-4" style={{ height: 52 }}>
          <div className="text-xl font-black bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent flex-shrink-0">SocialPulse</div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ icon: Icon, label, v }) => (
              <button key={v} onClick={() => setView(v)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${view === v ? `${purp} text-white` : 'text-white/45 hover:text-white hover:bg-white/5'}`}>
                <Icon size={15} />{label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setChatOpen(v => !v)} className="relative text-white/45 hover:text-violet-400 transition-colors">
              <MessageCircle size={19} />
              {msgs.filter(m => m.to === cu.id).length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full" />}
            </button>
            <Av user={cu} size={30} onClick={() => viewProfile(cu.id)} />
            <button onClick={logout} className="text-white/25 hover:text-white transition-colors hidden md:block"><LogOut size={15} /></button>
            <button onClick={() => setMobileNav(v => !v)} className="md:hidden text-white/45 hover:text-white"><Menu size={19} /></button>
          </div>
        </div>
      </header>

      {mobileNav && (
        <div className={`md:hidden ${glass} border-b border-white/10 px-4 py-3 space-y-1`}>
          {navItems.map(({ icon: Icon, label, v }) => (
            <button key={v} onClick={() => { setView(v); setMobileNav(false) }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === v ? `${purp} text-white` : 'text-white/45 hover:text-white hover:bg-white/5'}`}>
              <Icon size={16} />{label}
            </button>
          ))}
          <button onClick={() => viewProfile(cu.id)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/5">
            <User size={16} /> My Profile
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/5">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Left sidebar */}
          <aside className="hidden md:block col-span-1">
            <div className={`${glass} rounded-2xl p-4 sticky top-16`}>
              <div className="flex flex-col items-center mb-4 cursor-pointer" onClick={() => viewProfile(cu.id)}>
                <Av user={cu} size={56} />
                <div className="mt-2 text-center">
                  <div className="font-bold text-white text-sm">{cu.name}</div>
                  <div className="text-white/40 text-xs">@{cu.username}</div>
                  <div className="text-white/35 text-xs">{cu.profession}</div>
                </div>
                <div className="flex gap-5 mt-3 text-xs">
                  <div className="text-center"><div className="font-bold text-white">{cu.following.length}</div><div className="text-white/35">Following</div></div>
                  <div className="text-center"><div className="font-bold text-white">{cu.followers.length}</div><div className="text-white/35">Followers</div></div>
                </div>
              </div>
              <div className="space-y-0.5">
                {navItems.map(({ icon: Icon, label, v }) => (
                  <button key={v} onClick={() => setView(v)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${view === v ? `${purp} text-white` : 'text-white/45 hover:text-white hover:bg-white/5'}`}>
                    <Icon size={15} />{label}
                  </button>
                ))}
                <button onClick={() => viewProfile(cu.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/5 transition-all">
                  <User size={15} /> Profile
                </button>
                <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/45 hover:text-white hover:bg-white/5 transition-all">
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Center */}
          <div className="col-span-1 md:col-span-2">
            {view === 'feed' && (
              <>
                <Composer cu={cu} onPost={addPost} />
                {filtered.map(p => <PostCard key={p.id} post={p} users={users} cu={cu} onLike={likePost} onDelete={id => setPosts(ps => ps.filter(p => p.id !== id))} onEdit={(id, content) => setPosts(ps => ps.map(p => p.id === id ? { ...p, content, isEdited: true } : p))} onViewProfile={viewProfile} />)}
                {filtered.length === 0 && <div className="text-center text-white/25 py-14">No pulses yet — be the first to share!</div>}
              </>
            )}

            {view === 'trending' && (
              <>
                <div className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={19} className="text-violet-400" /> Top Pulses for Social Good</div>
                {posts.filter(p => p.category === 'social_good').sort((a, b) => b.likes.length - a.likes.length).map((p, i) => (
                  <div key={p.id} className="relative pl-4">
                    {i < 3 && <div className={`absolute left-0 top-5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-gray-200 text-black' : 'bg-orange-600 text-white'}`}>{i + 1}</div>}
                    <PostCard post={p} users={users} cu={cu} onLike={likePost} onDelete={id => setPosts(ps => ps.filter(p => p.id !== id))} onEdit={(id, content) => setPosts(ps => ps.map(p => p.id === id ? { ...p, content, isEdited: true } : p))} onViewProfile={viewProfile} />
                  </div>
                ))}
                {posts.filter(p => p.category === 'social_good').length === 0 && <div className="text-center text-white/25 py-14">No social good pulses yet. Start one!</div>}
              </>
            )}

            {view === 'notifications' && <Notifications cu={cu} users={users} posts={posts} />}

            {view === 'search' && (
              <>
                <div className={`${glass} rounded-2xl flex items-center gap-3 px-4 py-3 mb-4`}>
                  <Search size={17} className="text-white/35" />
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search pulses and people..." className="flex-1 bg-transparent text-white placeholder-white/25 outline-none text-sm" />
                </div>
                {searchQ ? (
                  <>
                    <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">People</div>
                    {users.filter(u => u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.username.includes(searchQ.toLowerCase())).map(u => (
                      <div key={u.id} onClick={() => viewProfile(u.id)} className={`${glass} ${gHover} rounded-2xl p-4 mb-3 flex items-center gap-3 cursor-pointer`}>
                        <Av user={u} size={44} />
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-white/35 text-sm">@{u.username} · {u.profession}</div>
                        </div>
                      </div>
                    ))}
                    <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 mt-4">Pulses</div>
                    {filtered.map(p => <PostCard key={p.id} post={p} users={users} cu={cu} onLike={likePost} onDelete={id => setPosts(ps => ps.filter(p => p.id !== id))} onEdit={(id, content) => setPosts(ps => ps.map(p => p.id === id ? { ...p, content, isEdited: true } : p))} onViewProfile={viewProfile} />)}
                  </>
                ) : (
                  <div className="text-center text-white/25 py-14">Search for people and pulses…</div>
                )}
              </>
            )}

            {view === 'profile' && (
              <ProfilePage pu={pu} cu={cu} users={users} posts={posts} onFollow={followUser} onUpdate={updateProfile} onBack={() => setView('feed')} />
            )}
          </div>

          {/* Right sidebar */}
          <aside className="hidden xl:block col-span-1">
            <TrendingSidebar posts={posts} users={users} onViewProfile={viewProfile} />
          </aside>
        </div>
      </main>

      {chatOpen && <ChatPanel cu={cu} users={users} messages={msgs} onSend={sendMessage} onClose={() => setChatOpen(false)} />}
    </div>
  )
}
