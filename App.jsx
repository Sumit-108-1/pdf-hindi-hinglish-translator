import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SOURCE = "A PLC scans its inputs, runs the program logic, then updates its outputs.";

const MODES = [
  { id: "hindi", name: "Hindi", note: "Devanagari script",
    sample: "PLC अपने इनपुट स्कैन करता है, प्रोग्राम लॉजिक चलाता है, फिर आउटपुट अपडेट करता है।" },
  { id: "hinglish", name: "Hinglish", note: "Hindi written in English letters",
    sample: "PLC apne inputs scan karta hai, program logic run karta hai, phir outputs update karta hai." },
  { id: "easy", name: "Easy Hinglish", note: "Simple, spoken-style explanation",
    sample: "PLC pehle inputs check karta hai, phir program chalata hai, phir outputs on/off karta hai." },
];

export default function App() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("hindi");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState("idle"); // idle | working | done | error
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef(null);

  useEffect(() => () => pdfUrl && URL.revokeObjectURL(pdfUrl), [pdfUrl]);

  function fail(msg) { setError(msg); setStatus("error"); }
  function pick(f) {
    if (!f) return;
    if (f.type !== "application/pdf") return fail("Choose a PDF file.");
    if (f.size > 20 * 1024 * 1024) return fail("This file is larger than 20 MB.");
    setFile(f); setPdfUrl(null); setStatus("idle"); setError("");
  }

  async function translate() {
    setStatus("working"); setError(""); setPdfUrl(null);
    const body = new FormData();
    body.append("file", file);
    body.append("mode", mode);
    body.append("pages", pages);
    try {
      const res = await fetch(`${API}/api/translate`, { method: "POST", body });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Translation failed.");
      setPdfUrl(URL.createObjectURL(await res.blob()));
      setStatus("done");
    } catch (e) { fail(e.message); }
  }

  const outName = file ? file.name.replace(/\.pdf$/i, "") + `-${mode}.pdf` : "translated.pdf";
  const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo";

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
        Read any English PDF<br />the way you speak.
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink/70">
        Upload a study PDF and get it back in Hindi or Hinglish. Free, with no signup.
      </p>

      {/* One sentence, three ways: choosing a style doubles as the preview */}
      <section className="mt-10" aria-labelledby="style">
        <h2 id="style" className="text-xl font-semibold">Pick a style</h2>
        <p className="mt-2 inline-block rounded bg-marker/70 px-2 py-1 text-sm">{SOURCE}</p>
        <div role="radiogroup" aria-labelledby="style" className="mt-4 grid gap-3 md:grid-cols-3">
          {MODES.map((m) => (
            <button key={m.id} role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
              className={`rounded-lg border-2 p-4 text-left transition ${ring} ${
                mode === m.id ? "border-indigo bg-white" : "border-ink/15 bg-white/50 hover:border-ink/40"}`}>
              <span className="text-lg font-semibold">{m.name}</span>
              <span className="block text-sm text-ink/60">{m.note}</span>
              <span className="mt-3 block leading-relaxed">{m.sample}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-[1fr_16rem]">
        <div
          onClick={() => input.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current.click()}
          tabIndex={0} role="button"
          className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center ${ring} ${
            dragging ? "border-indigo bg-white" : "border-ink/30"}`}>
          <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => pick(e.target.files[0])} />
          {file ? (
            <>
              <span className="font-semibold">{file.name}</span>
              <span className="text-sm text-ink/60">{(file.size / 1048576).toFixed(1)} MB. Click to change.</span>
            </>
          ) : (
            <>
              <span className="text-lg font-semibold">Drop your PDF here</span>
              <span className="text-sm text-ink/60">or click to choose one. Up to 20 MB.</span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold" htmlFor="pages">Pages (optional)</label>
          <input id="pages" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1-3, 5"
            className={`rounded border-2 border-ink/20 bg-white px-3 py-2 ${ring}`} />
          <p className="text-xs text-ink/60">Leave empty for the whole file. Up to 30 pages at a time.</p>
          <button onClick={translate} disabled={!file || status === "working"}
            className={`mt-auto rounded bg-indigo px-4 py-3 font-semibold text-white disabled:opacity-40 ${ring}`}>
            {status === "working" ? "Translating…" : "Translate"}
          </button>
          {pdfUrl && (
            <a href={pdfUrl} download={outName}
              className={`rounded border-2 border-ink px-4 py-3 text-center font-semibold hover:bg-ink hover:text-paper ${ring}`}>
              Download PDF
            </a>
          )}
        </div>
      </section>

      {status === "error" && <p role="alert" className="mt-4 text-red-700">{error}</p>}

      {pdfUrl && (
        <section className="mt-10" aria-label="Preview">
          <h2 className="mb-3 text-xl font-semibold">Preview</h2>
          <iframe title="Translated PDF" src={pdfUrl} className="h-[70vh] w-full rounded-lg border border-ink/15 bg-white" />
        </section>
      )}
    </main>
  );
}
