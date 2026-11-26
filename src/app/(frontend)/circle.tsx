'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'

type RecordID = string | number
type Media = { id: RecordID; url?: string; alt?: string; mimeType?: string }
type Person = { id: RecordID; name: string; username: string; avatar?: Media; birthday: string; bio?: string; typingAt?: string }
type Memory = { id: RecordID; description: string; date: string; file?: Media; author?: Person }
type Message = { id: RecordID; text: string; createdAt: string; author?: Person; replyTo?: Message }
type Data = { user: Person | null; welcome: Media[]; memories: Memory[]; messages: Message[]; members: Person[]; reactions: { id: RecordID; memory?: RecordID; message?: RecordID }[] }
type IconName = 'home' | 'photo' | 'chat' | 'calendar' | 'users' | 'settings' | 'plus' | 'search' | 'bell' | 'arrow' | 'heart' | 'download' | 'close' | 'lock' | 'send' | 'chevron' | 'grid'
function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10H3Z" /><path d="M9 20v-7h6v7" /></>,
    photo: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
    chat: <path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 2v6m10-6v6M3 11h18m-14 4h2m4 0h2" /></>,
    users: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-4a5 5 0 0 0-2-4" /></>,
    settings: <><path d="m9 3-1 3-3 1-2 4 2 3v4l4 3 3-1 3 1 4-3v-4l2-3-2-4-3-1-1-3Z" /><circle cx="12" cy="12" r="3" /></>,
    plus: <path d="M12 5v14M5 12h14" />, search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    bell: <><path d="M5 17h14l-2-4V9A5 5 0 0 0 7 9v4Zm5 4h4" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />, heart: <path d="M12 21 3 12C-3 5 7-1 12 6c5-7 15-1 9 6Z" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />, close: <path d="m6 6 12 12M6 18 18 6" />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V6a4 4 0 0 1 8 0v4" /></>,
    send: <path d="m3 3 19 9-19 9 4-9Zm4 9h15" />, chevron: <path d="m9 5 7 7-7 7" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  }
  return <svg aria-hidden="true" className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}
function Photo({ media, className = '' }: { media?: Media; className?: string }) {
  const [failed, setFailed] = useState(false)
  return <div className={`relative overflow-hidden bg-[#eee8df] ${className}`}>{media?.url && !failed ? <Image src={media.url} alt={media.alt || 'A shared memory'} fill loading="eager" sizes="(max-width: 800px) 90vw, 40vw" className="object-cover" onError={() => setFailed(true)} /> : <div className="flex h-full items-center justify-center text-[#846c5c]"><Icon name="photo" className="h-9 w-9" /></div>}</div>
}
function Avatar({ person, small = false }: { person?: Person | null; small?: boolean }) {
  return <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f4ddd0] font-semibold text-[#805240] ${small ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'}`}>{person?.avatar?.url ? <Photo media={person.avatar} className="h-full w-full" /> : (person?.name || 'Your circle').split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
}
function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    ref.current?.querySelector<HTMLElement>('button,input')?.focus()
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        const nodes = ref.current?.querySelectorAll<HTMLElement>('button,input,textarea,a,select')
        if (!nodes?.length) return
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); previous?.focus() }
  }, [close])
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#242321]/40 p-4 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) close() }}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-7 shadow-xl"><div className="mb-6 flex items-center justify-between"><h2 id="dialog-title" className="font-heading text-2xl font-bold">{title}</h2><button aria-label="Close dialog" className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100" onClick={close}><Icon name="close" /></button></div>{children}</div></div>
}
const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#df705a] px-5 text-sm font-semibold text-[#231d19] transition hover:bg-[#d96049] focus-visible:ring-2'
const input = 'min-h-11 w-full rounded-xl border border-[#e5e3de] bg-white px-3 py-2.5 text-sm focus:border-[#d7715e]'
const empty: Data = { user: null, welcome: [], memories: [], messages: [], members: [], reactions: [] }

export default function Circle() {
  const [data, setData] = useState<Data>(empty)
  const [view, setView] = useState('Home')
  const [tab, setTab] = useState('All memories')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState('')
  const [reply, setReply] = useState<Message | null>(null)
  const [files, setFiles] = useState<{ file: File; description: string; date: string }[]>([])
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [lightbox, setLightbox] = useState<Memory | null>(null)
  const lastTyping = useRef(0)
  const close = useCallback(() => { setModal(null); setLightbox(null) }, [])
  const refresh = useCallback(async () => {
    try { const res = await fetch('/circle-api'); if (res.ok) setData(await res.json()) } catch { setNotice('Connection interrupted. Please try again.') }
  }, [])
  useEffect(() => { void refresh(); const timer = setInterval(refresh, 7000); return () => clearInterval(timer) }, [refresh])
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6500); return () => clearTimeout(timer) }, [notice])
  async function mutate(form: FormData) {
    const res = await fetch('/circle-api', { method: 'POST', body: form })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Please try again.')
    return result
  }
  async function action(kind: string, fields: Record<string, string> = {}) {
    if (!data.user && kind !== 'login' && kind !== 'register') { setModal('login'); return }
    const form = new FormData(); form.set('action', kind)
    Object.entries(fields).forEach(([key, value]) => form.set(key, value))
    try { await mutate(form); await refresh(); return true } catch (e) { setNotice((e as Error).message); return false }
  }
  async function submit(form: FormData, kind: string) {
    setBusy(true); form.set('action', kind)
    try {
      const avatar = form.get('avatar')
      const result = await mutate(form)
      if (kind === 'login' && avatar instanceof File && avatar.size) setNotice('Signed in. Add your photo in Settings.')
      setNotice(result.message || (kind === 'settings' ? 'Profile updated.' : 'Welcome to Circle.'))
      close(); await refresh()
    } catch (e) { setNotice((e as Error).message) } finally { setBusy(false) }
  }
  const memories = data.memories.filter(m => m.description.toLowerCase().includes(query.toLowerCase()) && (tab === 'Videos' ? m.file?.mimeType?.startsWith('video') : tab === 'Photos' ? !m.file?.mimeType?.startsWith('video') : true))
  const typing = data.members.filter(p => p.id !== data.user?.id && p.typingAt && Date.now() - Date.parse(p.typingAt) < 9000)
  const birthdayMembers = data.members.filter(p => new Date(p.birthday).getUTCMonth() === month)
  const upcoming = [...data.members].sort((a, b) => new Date(a.birthday).getUTCMonth() - new Date(b.birthday).getUTCMonth()).slice(0, 2)
  function addFiles(list: FileList | null) {
    if (!list) return
    setFiles(old => [...old, ...Array.from(list).filter(f => /^(image|video)\//.test(f.type)).map(file => ({ file, description: '', date: new Date().toISOString().slice(0, 10) }))])
  }
  async function uploadAll() {
    if (!data.user) { setModal('login'); return }
    setBusy(true)
    try {
      for (const entry of [...files]) {
        const form = new FormData(); form.set('action', 'upload'); form.set('file', entry.file); form.set('description', entry.description); form.set('date', entry.date)
        await mutate(form); setFiles(old => old.filter(item => item !== entry))
      }
      close(); setNotice('Your memories are now in the circle.'); await refresh()
    } catch (e) { setNotice((e as Error).message) } finally { setBusy(false) }
  }
  return <div className="min-h-screen overflow-x-hidden bg-[#f8f9f6] font-sans text-[#30362f]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[218px] flex-col border-r border-[#e7e9e2] bg-[#fcfcf9] px-5 py-8 lg:flex">
      <a href="/" aria-label="Circle home" className="mb-12 flex items-center gap-2.5 px-3"><span className="h-8 w-8 rounded-full border-[7px] border-[#e9826b]" /><span className="font-heading text-[30px] font-extrabold tracking-[-1.5px]">circle<span className="text-[#d56852]">.</span></span></a>
      <p className="mb-4 px-4 text-xs font-semibold tracking-[1.7px] text-[#73776d]">YOUR LITTLE WORLD</p>
      <nav className="space-y-2">{(['Home', 'Memories', 'Group chat', 'Calendar', 'Members'] as const).map((name, i) => <button key={name} onClick={() => setView(name)} aria-current={view === name ? 'page' : undefined} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-sm ${view === name ? 'bg-[#f9e6df] font-semibold text-[#a54432]' : 'text-[#646b60] hover:bg-[#eef0e9]'}`}><Icon name={(['home', 'photo', 'chat', 'calendar', 'users'] as IconName[])[i]} />{name}{name === 'Group chat' && data.messages.length > 0 && <span className="ml-auto rounded-md bg-[#d9715c] px-1.5 text-xs text-white">{data.messages.length}</span>}</button>)}</nav>
      <div className="mt-auto"><div className="mb-7 rounded-2xl bg-[#eef1e8] p-4"><span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#657956]"><Icon name="lock" /></span><p className="text-sm font-semibold">Just us. Always.</p><p className="mt-2 text-sm leading-relaxed text-[#626b5d]">A private corner for your favorite people.</p><div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#567047]"><span className="h-1.5 w-1.5 rounded-full bg-[#6c8656]" />Invite-only circle</div></div><button onClick={() => data.user ? setModal('settings') : setModal('login')} className="flex min-h-11 w-full items-center gap-3 px-4 text-sm text-[#61695e]"><Icon name="settings" />Settings</button><div className="mt-4 border-t border-[#e5e8df] pt-5"><button onClick={() => setModal(data.user ? 'settings' : 'login')} className="flex min-h-11 w-full items-center gap-3"><Avatar person={data.user} /><span className="min-w-0 text-left"><span className="block truncate text-sm font-semibold">{data.user?.name || 'Welcome, friend'}</span><span className="text-xs text-[#70776a]">{data.user ? 'Your personal space' : 'Come on in'}</span></span><Icon name="chevron" className="ml-auto h-4 w-4" /></button></div></div>
    </aside>
    <div className="lg:ml-[218px]">
      <header className="flex min-h-[91px] items-center justify-between gap-4 border-b border-[#e7e9e2] bg-[#fcfcf9] px-5 md:px-9">
        <div><p className="text-sm text-[#6b7465]">A little closer, every day.</p><p className="mt-1 font-heading text-base font-bold">{view === 'Home' ? 'Our happy place' : view}</p></div><div className="flex items-center gap-3 md:gap-5"><div className="hidden items-center gap-2 rounded-full border border-[#e4e7de] bg-white px-4 md:flex"><Icon name="search" className="h-4 w-4 text-[#6a7363]" /><input aria-label="Search memories" value={query} onChange={e => { setQuery(e.target.value); if (view !== 'Home') setView('Memories') }} className="min-h-10 w-40 bg-transparent text-sm outline-none" placeholder="Find a memory..." /></div><button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e4e7de]" aria-label="Notifications" onClick={() => { setNotice(data.user ? 'You’re all caught up. New memories and birthdays will appear here.' : 'Join Circle to keep up with your friends.') }}><Icon name="bell" /></button><button onClick={() => setModal(data.user ? 'settings' : 'login')} aria-label="Your account"><Avatar person={data.user} /></button></div>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-[#e7e9e2] bg-white px-4 lg:hidden">{['Home', 'Memories', 'Group chat', 'Calendar', 'Members'].map(name => <button onClick={() => setView(name)} key={name} className={`min-h-12 shrink-0 px-3 text-sm ${view === name ? 'font-bold text-[#a54432]' : ''}`}>{name}</button>)}</nav>
      <main className="mx-auto max-w-[1600px] p-5 md:p-8 lg:p-9">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#727b69]"><span className="h-1.5 w-1.5 rounded-full bg-[#d3785e]" />Our people. Our stories.</div><h1 className="font-heading text-3xl font-bold tracking-[-1.1px] md:text-[34px]">{view === 'Home' ? <>Life’s better in our circle<span className="text-[#dd806a]">.</span></> : view === 'Memories' ? 'The moments we keep.' : view === 'Group chat' ? 'The conversation never ends.' : view === 'Calendar' ? 'Good days to remember.' : 'Your favorite people.'}</h1><p className="mt-2 text-sm text-[#6f7768]">{view === 'Home' ? 'The big adventures, the little moments, and everything in between.' : 'A little space for everything that brings us together.'}</p></div><button className={button} onClick={() => setModal(data.user ? 'upload' : 'login')}><Icon name="plus" />Share a memory</button></div>
        <div className={`grid min-w-0 gap-7 ${view === 'Home' || view === 'Memories' ? 'xl:grid-cols-[minmax(0,1fr)_306px]' : ''}`}>
          <section className="min-w-0">
            {view === 'Home' && <div className="relative mb-7 min-h-[300px] overflow-hidden rounded-[22px] bg-[#435a4c] md:min-h-[340px]">
              <div className="absolute inset-0">
                <Photo media={data.welcome[0]} className="h-full w-full" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#182e29]/85 via-[#1b3028]/40 to-transparent" />
              <div className="relative flex min-h-[340px] max-w-md flex-col items-start justify-center p-7 text-white md:p-9"><span className="mb-5 flex items-center gap-2 rounded-full border border-white/50 bg-[#20392c]/50 px-3 py-1.5 text-xs font-medium"><Icon name="heart" className="h-3.5 w-3.5" />Made of moments like these</span><h2 className="font-heading text-[34px] font-semibold leading-[1.23] tracking-[-1px]">Same people.<br />A thousand stories.</h2><p className="mt-3 max-w-[270px] text-sm leading-relaxed text-white">Some things are too good to disappear in a camera roll.</p><button onClick={() => setModal(data.user ? 'upload' : 'register')} className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl bg-white px-4 text-sm font-semibold text-[#394535]">{data.user ? 'Add your next chapter' : 'Make yourself at home'}<Icon name="arrow" className="h-4 w-4" /></button></div>
              <span className="absolute bottom-5 right-5 hidden rounded-full bg-[#23382d]/75 px-3 py-1.5 text-xs text-white md:block">A place for all of us</span>
            </div>}
            {(view === 'Home' || view === 'Memories') && <>
              <div className="mb-5 flex items-center justify-between"><h2 className="font-heading text-xl font-bold tracking-tight">Fresh from the circle <span className="ml-1 text-sm font-normal text-[#747c6d]">{data.memories.length > 0 ? data.memories.length : ''}</span></h2><button className="flex min-h-11 items-center gap-1 text-sm text-[#65715c]" onClick={() => { setTab(tab === 'Photos' ? 'All memories' : 'Photos') }}><Icon name="grid" className="h-4 w-4" /><span className="hidden sm:inline">Gallery view</span></button></div>
              <div role="tablist" aria-label="Memory type" className="mb-5 flex flex-wrap items-center gap-2">{['All memories', 'Photos', 'Videos'].map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-11 rounded-full px-4 text-sm ${tab === t ? 'bg-[#e8eddf] font-semibold text-[#465c36]' : 'text-[#70776a] hover:bg-[#edf0e7]'}`}>{t}</button>)}<span className="ml-auto text-xs text-[#6a7363]">Newest first ↓</span></div>
              {memories.length ? <div className="grid gap-5 sm:grid-cols-2">{memories.map(memory => <article key={memory.id} className="overflow-hidden rounded-2xl border border-[#e4e7dd] bg-white"><button aria-label={`Open ${memory.description}`} className="block w-full" onClick={() => setLightbox(memory)}>{memory.file?.mimeType?.startsWith('video') ? <div className="flex h-56 items-center justify-center bg-[#e9ede3] text-sm">Play video →</div> : <Photo media={memory.file} className="h-56 w-full" />}</button><div className="p-4"><div className="flex items-center gap-2"><Avatar person={memory.author} small /><p className="text-sm font-semibold">{memory.author?.name || 'Circle'}</p><span className="ml-auto text-xs text-[#71796a]">{new Date(memory.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div><p className="my-3 text-sm">{memory.description}</p><div className="flex items-center justify-between border-t border-[#edf0e7] pt-2"><button aria-label="Love this memory" className="flex min-h-11 items-center gap-2 text-sm text-[#a85540]" onClick={() => action('react', { memory: String(memory.id) })}><Icon name="heart" />{data.reactions.filter(r => String(r.memory) === String(memory.id)).length || 'Be the first'}</button>{memory.file?.url && <a href={memory.file.url} download className="flex h-11 w-11 items-center justify-center" aria-label="Download memory"><Icon name="download" /></a>}</div></div></article>)}</div> : data.user ? <div className="rounded-2xl border border-dashed border-[#ccd4c1] bg-white px-5 py-12 text-center"><Icon name="photo" className="mx-auto mb-3 h-8 w-8 text-[#788b67]" /><h3 className="font-heading text-lg font-bold">{query ? 'No matching memories' : 'Every circle starts with a moment.'}</h3><p className="mb-5 mt-2 text-sm text-[#6b7463]">Share the first photo. You’ll be glad you kept it.</p><button className={button} onClick={() => setModal('upload')}>Share your first memory</button></div> : <div className="grid gap-5 sm:grid-cols-2">{data.welcome.slice(1, 3).map((media, i) => <div key={media.id} className="overflow-hidden rounded-2xl border border-[#e3e7dc] bg-white"><Photo media={media} className="h-[215px] w-full" /><div className="p-4"><p className="font-heading text-base font-bold">{i === 0 ? 'For the spontaneous weekends' : 'And the everyday kind of magic'}</p><p className="mt-1.5 text-sm text-[#6d7566]">{i === 0 ? 'The best plans aren’t always planned.' : 'Not perfect. Just perfectly us.'}</p><button onClick={() => setModal('register')} className="mt-3 flex min-h-11 items-center gap-2 text-sm font-medium text-[#a54c37]">Start making memories<Icon name="arrow" className="h-4 w-4" /></button></div></div>)}</div>}
              {!data.user && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e1e5d8] bg-[#f0f3e9] p-5"><div><p className="text-sm font-semibold">Your people are one invitation away.</p><p className="mt-1 text-sm text-[#66725b]">Join the circle to share, chat, and stay close.</p></div><button onClick={() => setModal('register')} className="min-h-11 text-sm font-semibold text-[#9e4b38]">Join our circle →</button></div>}
            </>}
            {view === 'Calendar' && <div className="rounded-2xl border border-[#e2e6d9] bg-white p-5 md:p-7"><div className="mb-6 flex items-center justify-between"><button aria-label="Previous month" className="h-11 w-11" onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1) }}>←</button><h2 className="font-heading text-xl font-bold">{new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2><button aria-label="Next month" className="h-11 w-11" onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1) }}>→</button></div><div className="grid grid-cols-7">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-3 text-center text-xs font-medium text-[#6d7664]">{day}</div>)}{Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => <div key={`blank${i}`} />)}{Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => <div key={i} className="min-h-24 border-t border-[#edf0e6] p-2 text-sm"><span>{i + 1}</span>{birthdayMembers.filter(p => new Date(p.birthday).getUTCDate() === i + 1).map(p => <p key={p.id} className="mt-2 truncate rounded bg-[#fae7dd] p-1 text-xs text-[#934632]">{p.name}'s birthday</p>)}</div>)}</div>{!data.user && <p className="mt-5 text-sm text-[#727a6a]">Sign in to see your circle’s birthdays. Only approved members appear here.</p>}</div>}
            {view === 'Members' && <div className="grid gap-4 md:grid-cols-3">{data.members.map(p => <div key={p.id} className="rounded-2xl border border-[#e2e6d9] bg-white p-6"><Avatar person={p} /><h2 className="mt-4 font-heading text-lg font-bold">{p.name}</h2><p className="text-sm text-[#6c7562]">@{p.username}</p><p className="mt-4 text-sm">Birthday · {new Date(p.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' })}</p></div>)}{!data.members.length && <div className="col-span-full rounded-2xl border border-[#e2e6d9] bg-white p-10 text-center"><Icon name="users" className="mx-auto mb-4 h-9 w-9" /><h2 className="text-xl font-semibold">Good people belong here.</h2><p className="my-3 text-sm text-[#6d7665]">Members are visible after you sign in with an approved account.</p><button className={button} onClick={() => setModal('register')}>Request to join</button></div>}</div>}
            {view === 'Group chat' && Chat()}
          </section>
          {(view === 'Home' || view === 'Memories') && <aside className="min-w-0 space-y-6">
            {Chat()}
            <section className="rounded-2xl border border-[#e1e6d9] bg-white p-5"><div className="mb-5 flex items-center justify-between"><h2 className="font-heading text-base font-bold">A little celebration</h2><Icon name="calendar" className="text-[#7b896e]" /></div>{upcoming.length ? upcoming.map(p => <div className="mb-3 flex items-center gap-3" key={p.id}><Avatar person={p} /><div><p className="text-sm font-semibold">{p.name}'s birthday</p><p className="text-xs text-[#6c7662]">{new Date(p.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' })}</p></div></div>) : <div className="rounded-xl bg-[#f9f1e4] p-4"><p className="text-sm font-semibold text-[#7c603b]">Never miss their special day.</p><p className="mt-2 text-sm leading-relaxed text-[#796b55]">Your circle’s birthdays, all in one happy place.</p></div>}<button onClick={() => setView('Calendar')} className="mt-3 flex min-h-11 w-full items-center justify-between text-sm font-medium text-[#667957]">Open calendar<Icon name="arrow" className="h-4 w-4" /></button></section>
            <div className="flex items-center justify-center gap-2 px-3 text-center text-xs text-[#737e69]"><Icon name="lock" className="h-3.5 w-3.5" />Private memories. Real connections.</div>
          </aside>}
        </div>
        <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[#e2e6d9] pt-5 text-xs text-[#717b67]"><span>A little corner of the internet, just for us.</span><a href="/admin" className="flex min-h-11 items-center gap-1.5"><Icon name="lock" className="h-3 w-3" />Circle admin</a></footer>
      </main>
    </div>
    {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-xl bg-[#34432e] px-5 py-4 text-sm text-white shadow-lg">{notice}</div>}
    {(modal === 'login' || modal === 'register') && <Modal title={modal === 'login' ? 'Welcome back to your circle.' : 'There’s a place for you here.'} close={close}>
      <p className="mb-5 text-sm leading-relaxed text-[#6b7562]">{modal === 'login' ? 'Sign in to catch up with your favorite people.' : 'We keep things personal. An admin will approve your request before you can sign in.'}</p>
      <form action={form => submit(form, modal)} className="space-y-4">
        {modal === 'register' && <>
          <label className="block text-sm">Real name<input className={`${input} mt-1.5`} name="name" autoComplete="name" required /></label>
          <label className="block text-sm">Username<input className={`${input} mt-1.5`} name="username" autoComplete="username" required /></label>
          <label className="block text-sm">Profile picture<input className={`${input} mt-1.5`} name="avatar" type="file" accept="image/*" required /><span className="mt-1 block text-xs text-[#657357]">Choose an image up to 5 MB.</span></label>
          <label className="block text-sm">Birthday<input className={`${input} mt-1.5`} name="birthday" type="date" max={new Date().toISOString().slice(0, 10)} required /></label>
        </>}
        <label className="block text-sm">Email address<input className={`${input} mt-1.5`} name="email" type="email" autoComplete="email" required /></label>
        <label className="block text-sm">Password<input className={`${input} mt-1.5`} name="password" type="password" minLength={8} autoComplete={modal === 'register' ? 'new-password' : 'current-password'} required /></label>
        <button disabled={busy} className={`${button} w-full disabled:opacity-60`}>{busy ? 'One moment…' : modal === 'register' ? 'Request to join Circle' : 'Sign in'}</button>
      </form>
      <button className="mt-4 min-h-11 w-full text-sm text-[#9f4935]" onClick={() => setModal(modal === 'login' ? 'register' : 'login')}>{modal === 'login' ? 'New around here? Join the circle' : 'Already a member? Sign in'}</button>
    </Modal>}
    {modal === 'upload' && <Modal title="Keep this moment." close={close}><div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }} className="rounded-2xl border-2 border-dashed border-[#cdd5c1] bg-[#f5f7f0] p-8 text-center"><Icon name="photo" className="mx-auto mb-3 h-8 w-8 text-[#768c61]" /><p className="text-sm font-semibold">Drop your photos & videos here</p><p className="my-2 text-xs text-[#68775b]">Up to 30 MB per file</p><label className={`${button} mt-2 cursor-pointer`}>Choose files<input type="file" multiple accept="image/*,video/*" className="sr-only" onChange={e => addFiles(e.target.files)} /></label></div><div className="mt-5 space-y-4">{files.map((entry, i) => <div key={`${entry.file.name}${i}`} className="space-y-2 rounded-xl border border-[#e4e8db] p-4"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{entry.file.name}</p><button className="h-11 w-11 shrink-0" aria-label={`Remove ${entry.file.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button></div><input aria-label={`Description for ${entry.file.name}`} value={entry.description} placeholder="What’s the story behind this one?" className={input} onChange={e => setFiles(files.map((f, j) => j === i ? { ...f, description: e.target.value } : f))} /><input aria-label={`Date for ${entry.file.name}`} type="date" value={entry.date} className={input} onChange={e => setFiles(files.map((f, j) => j === i ? { ...f, date: e.target.value } : f))} /></div>)}</div><button disabled={busy || !files.length || files.some(f => !f.description || !f.date)} onClick={uploadAll} className={`${button} mt-5 w-full disabled:cursor-not-allowed disabled:bg-stone-200`}>{busy ? 'Sharing…' : `Share ${files.length || ''} ${files.length === 1 ? 'memory' : 'memories'}`}</button></Modal>}
    {modal === 'settings' && data.user && <Modal title="Your little space." close={close}><div className="mb-5 flex items-center gap-4"><Avatar person={data.user} /><label className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-[#9b4e3a]">Change profile picture<input type="file" accept="image/*" className="sr-only" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const form = new FormData(); form.set('action', 'avatar'); form.set('file', file); try { await mutate(form); await refresh(); setNotice('Profile picture updated.') } catch (err) { setNotice((err as Error).message) } }} /></label></div><form action={form => submit(form, 'settings')} className="space-y-4"><label className="block text-sm">Real name<input className={`${input} mt-2`} name="name" defaultValue={data.user.name} required /></label><label className="block text-sm">A little about you<textarea className={`${input} mt-2`} name="bio" defaultValue={data.user.bio || ''} /></label><button className={button} disabled={busy}>Save changes</button></form><button className="mt-5 min-h-11 text-sm text-[#a34230]" onClick={async () => { await action('logout'); close() }}>Sign out of Circle</button></Modal>}
    {lightbox && <Modal title={lightbox.description} close={close}>{lightbox.file?.mimeType?.startsWith('video') ? <video controls src={lightbox.file.url} className="max-h-[60vh] w-full" /> : <Photo media={lightbox.file} className="h-[55vh] w-full rounded-xl" />}{lightbox.file?.url && <a href={lightbox.file.url} download className={`${button} mt-4`}><Icon name="download" />Download original</a>}</Modal>}
  </div>

  function Chat() {
    return <section className="flex flex-col overflow-hidden rounded-2xl border border-[#dfe5d5] bg-white">
      <div className="flex items-center justify-between border-b border-[#e8ecdf] px-5 py-4"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf1e6] text-[#687c54]"><Icon name="chat" className="h-4 w-4" /></span><h2 className="font-heading text-base font-bold">The group chat</h2></div><button aria-label="Expand group chat" className="flex h-11 w-11 items-center justify-center text-[#79866d]" onClick={() => setView('Group chat')}><Icon name="arrow" className="h-4 w-4" /></button></div>
      <div className={`overflow-y-auto p-5 ${view === 'Group chat' ? 'h-[470px]' : 'h-[284px]'}`}>
        {data.messages.length ? data.messages.map(m => <div className="mb-5 flex items-start gap-2" key={m.id}><Avatar person={m.author} small /><div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="text-xs font-semibold">{m.author?.name || 'Friend'}</span><span className="text-xs text-[#707b65]">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>{m.replyTo?.text && <p className="mb-1 border-l-2 border-[#c3ceb6] pl-2 text-xs text-[#667459]">{m.replyTo.text}</p>}<p className={`break-words rounded-xl rounded-tl-none p-3 text-sm ${m.author?.id === data.user?.id ? 'bg-[#f9e5db]' : 'bg-[#f0f3ea]'}`}>{m.text}</p><div className="flex gap-3"><button className="min-h-11 text-xs text-[#776a5d]" onClick={() => setReply(m)}>Reply</button><button aria-label="Love message" className="flex min-h-11 items-center gap-1 text-xs text-[#a25441]" onClick={() => action('react', { message: String(m.id) })}><Icon name="heart" className="h-3.5 w-3.5" />{data.reactions.filter(r => String(r.message) === String(m.id)).length || ''}</button></div></div></div>) : <div className="flex h-full flex-col items-center justify-center text-center"><div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f2e9de]"><Icon name="chat" className="h-7 w-7 text-[#b16e51]" /><span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-[3px] border-white bg-[#9eb186]" /></div><h3 className="text-sm font-semibold">The best kind of group chat.</h3><p className="mt-2 max-w-[210px] text-sm leading-relaxed text-[#727b68]">Inside jokes, weekend plans, and all the “you had to be there” moments.</p>{!data.user && <button className="mt-3 min-h-11 text-sm font-semibold text-[#a54b36]" onClick={() => setModal('login')}>Sign in to say hello →</button>}</div>}
      </div>
      <div className="border-t border-[#e7ebdf] p-4">
        {typing.length > 0 && <div role="status" className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[#677956]">
          {typing.map(person => <span key={person.id} className="flex items-center gap-1.5"><Avatar person={person} small />{person.name}</span>)}
          <span>{typing.length > 1 ? 'are' : 'is'} typing…</span>
        </div>}
        {reply && <div className="mb-2 flex items-center justify-between rounded-lg bg-[#f1f3eb] px-3 text-sm">
          <span className="truncate">Replying to {reply.author?.name}: {reply.text}</span>
          <button className="h-11 w-11" aria-label="Cancel reply" onClick={() => setReply(null)}>×</button>
        </div>}
        <form className="flex items-center gap-2 rounded-xl border border-[#e3e8da] bg-[#fafbf7] px-3" onSubmit={async e => {
          e.preventDefault()
          if (!draft.trim()) { if (!data.user) setModal('login'); return }
          const sent = await action('message', { text: draft, ...(reply ? { replyTo: String(reply.id) } : {}) })
          if (sent) { setDraft(''); setReply(null) }
        }}>
          <input aria-label="Write a group message" placeholder="A little hello goes a long way..." value={draft} className="min-h-12 w-full min-w-0 bg-transparent text-sm outline-none" onChange={e => {
            setDraft(e.target.value)
            if (data.user && Date.now() - lastTyping.current > 4000) { lastTyping.current = Date.now(); void action('typing') }
          }} />
          <button aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center text-[#aa573f]"><Icon name="send" className="h-4 w-4" /></button>
        </form>
      </div>
    </section>
  }
}
