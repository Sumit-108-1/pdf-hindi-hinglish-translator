import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, Download, FileText, Globe2, Languages, LockKeyhole, Sparkles, UploadCloud, X } from 'lucide-react';
import './index.css';

const API = import.meta.env.VITE_API_URL || '';
const modes = [
  {
    id: 'hindi',
    name: 'हिंदी',
    sub: 'अपनी भाषा, अपनी समझ 🇮🇳',
    icon: 'अ',
    tint: 'mint',
    sample: 'अब हर मुश्किल विषय को अपनी भाषा में समझना हुआ आसान।'
  },
  {
    id: 'hinglish',
    name: 'Hinglish',
    sub: 'English + Hindi = Perfect Mix ✨',
    icon: 'Aa',
    tint: 'lilac',
    sample: 'Ab difficult topics ko samajhna hua super easy!'
  },
  {
    id: 'easy',
    name: 'Easy Hinglish',
    sub: 'No Confusion, Just Clarity 🚀',
    icon: '✦',
    tint: 'peach',
    sample: 'Koi bhi tough topic ho, hum use simple words mein explain karenge!'
  }
];
export default function App() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('hindi');
  const [pages, setPages] = useState('');
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const input = useRef(null);
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);
  const selected = modes.find(m => m.id === mode);
  function pick(f) {
    if (!f) return;
    if (!(f.type === 'application/pdf' || /\.pdf$/i.test(f.name))) { setError('Please choose a PDF document.'); return; }
    setFile(f); setStatus('idle'); setError(''); setPdfUrl(null);
  }
  async function translate() {
    if (!file) return;
    if (!API) { setError('Translation is not connected yet. The website is live, but a translation engine must be configured first.'); return; }
    setStatus('working'); setError(''); setPdfUrl(null);
    const data = new FormData(); data.append('file', file); data.append('mode', mode); data.append('pages', pages);
    try {
      const response = await fetch(`${API.replace(/\/$/, '')}/api/translate`, { method: 'POST', body: data });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || `Server error (${response.status})`); }
      setPdfUrl(URL.createObjectURL(await response.blob())); setStatus('done');
    } catch (e) { setError(e.message || 'Could not translate this document.'); setStatus('error'); }
  }
  return <div className="site-shell">
    <header className="nav wrap"><a href="#home" className="brand"><span className="brand-mark"><Languages size={23}/></span>PDF<span>Lingo</span><span className="brand-dot">.</span></a><nav className="nav-links"><a href="#how">How it works</a><a href="#features">Features</a><a href="#translator">Translate</a></nav><a href="#translator" className="nav-cta">Get started <ArrowRight size={16}/></a></header>
    <main id="home">
      <section className="hero wrap"><div className="hero-copy"><span className="eyebrow"><Sparkles size={15}/> Your words. Your language.</span><h1>Every PDF.<br/><span>Your language.</span></h1><p>Turn complicated English documents into easy-to-read Hindi and Hinglish. Made for curious minds, built for everyday learning.</p><div className="hero-actions"><a href="#translator" className="btn btn-dark">Translate a PDF <ArrowRight size={19}/></a><a href="#how" className="text-link">See how it works <ArrowRight size={17}/></a></div><div className="hero-note"><span className="note-check"><Check size={14}/></span> Free to explore <span className="note-sep">•</span> No sign-up needed</div></div>
        <div className="hero-art" aria-label="Decorative illustration of a document being translated"><div className="art-blob"></div><div className="art-cloud cloud-one"></div><div className="art-cloud cloud-two"></div><div className="float-chip chip-hi">नमस्ते <span>✦</span></div><div className="float-chip chip-en">Hello! <span>↗</span></div><div className="doc-illustration"><div className="doc-fold"></div><div className="doc-icon"><FileText size={35}/></div><div className="doc-line wide"></div><div className="doc-line"></div><div className="doc-line medium"></div><div className="doc-language"><Languages size={24}/> EN <ArrowRight size={18}/> HI</div></div><div className="art-sparkle spark-a">✳</div><div className="art-sparkle spark-b">✦</div><div className="art-sparkle spark-c">✧</div></div></section>
      <section className="translate-section" id="translator"><div className="wrap"><div className="section-heading"><span className="mini-label">THE TRANSLATOR</span><h2>Let's make it <em>easy.</em></h2><p>Choose a PDF, pick your language, and you're on your way.</p></div><div className="workspace"><div className="workspace-head"><div><span className="step-number">01</span><strong>Upload your document</strong></div><span className="secure-tag"><LockKeyhole size={14}/> No account required</span></div>
      <div className={`dropzone ${dragging ? 'dragging' : ''}`} role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}><input ref={input} hidden type="file" accept=".pdf,application/pdf" onChange={e => pick(e.target.files[0])}/><div className="upload-icon"><UploadCloud size={29}/></div>{file ? <><strong className="file-name">{file.name}</strong><span>{(file.size / 1048576).toFixed(2)} MB · Click to change</span></> : <><strong>Drop your PDF here</strong><span>or <b>browse your files</b> to choose a document</span></>}<small>PDF format supported</small></div>
      <div className="workspace-head mode-heading"><div><span className="step-number">02</span><strong>Choose your language</strong></div></div><div className="mode-grid" role="radiogroup" aria-label="Translation language">{modes.map(m => <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} className={`mode-card ${m.tint} ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}><span className="mode-top"><span className="mode-symbol">{m.icon}</span><span className="mode-radio">{mode === m.id && <Check size={14}/>}</span></span><strong>{m.name}</strong><span>{m.sub}</span></button>)}</div><div className="sample"><span>PREVIEW OF STYLE</span><p>{selected.sample}</p><small>Example only — not a live translation.</small></div><div className="bottom-row"><label htmlFor="pages">Page range <span>(optional)</span><div className="input-wrap"><BookOpen size={17}/><input id="pages" placeholder="e.g. 1-5, 8" value={pages} onChange={e => setPages(e.target.value)}/></div></label><button type="button" className="btn btn-dark translate-btn" disabled={!file || status === 'working'} onClick={translate}>{status === 'working' ? 'Working…' : 'Translate PDF'} <ArrowRight size={18}/></button></div>{error && <div className="message error" role="alert">{error}</div>}{status === 'done' && pdfUrl && <div className="result"><strong><Check size={18}/> PDF generated</strong><div className="result-actions"><a href={pdfUrl} target="_blank" rel="noreferrer">Preview</a><a href={pdfUrl} download={`${file.name.replace(/\.pdf$/i, '')}-${mode}.pdf`}><Download size={17}/> Download PDF</a></div></div>}<p className="disclaimer">Translation backend is not connected on GitHub Pages yet. This is the homepage preview; translation features will be enabled in a later phase.</p></div></div></section>
      <section className="how wrap" id="how"><div className="section-heading"><span className="mini-label">SIMPLE AS 1, 2, 3</span><h2>From English to <em>understood.</em></h2></div><div className="how-grid"><div className="how-card"><span className="how-icon mint"><UploadCloud/></span><span className="how-num">01</span><h3>Upload</h3><p>Pick your English PDF document.</p></div><div className="how-card"><span className="how-icon lilac"><Globe2/></span><span className="how-num">02</span><h3>Choose</h3><p>Select Hindi, Hinglish, or an easier reading style.</p></div><div className="how-card"><span className="how-icon peach"><Download/></span><span className="how-num">03</span><h3>Read</h3><p>Preview and download when translation is ready.</p></div></div></section>
      <section className="feature-banner wrap" id="features"><div><span className="mini-label">BUILT FOR LEARNING</span><h2>Big ideas deserve<br/>simple words.</h2><p>From lecture notes to technical PDFs, we're building a more approachable way to read and learn.</p><a href="#translator" className="btn btn-dark">Try the interface <ArrowRight size={18}/></a></div><div className="banner-decor"><span>अ</span><span>Aa</span><span>✳</span></div></section>
    </main><footer className="footer wrap"><a href="#home" className="brand"><span className="brand-mark"><Languages size={18}/></span>PDF<span>Lingo</span><span className="brand-dot">.</span></a><p>Made for better understanding. © {new Date().getFullYear()} PDFLingo.</p><a href="#home">Back to top ↑</a></footer>
  </div>;
}
