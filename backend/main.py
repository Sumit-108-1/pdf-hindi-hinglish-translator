import re
from html import escape

import fitz  # PyMuPDF
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from weasyprint import HTML

MAX_BYTES = 20 * 1024 * 1024  # 20 MB upload cap
MAX_PAGES = 30                # compute cap per request
MODES = {"hindi", "hinglish", "easy"}

app = FastAPI(title="PDF Hindi/Hinglish translator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # add your deployed frontend URL later
    allow_methods=["POST"],
    allow_headers=["*"],
)


def parse_pages(spec: str, total: int) -> list[int]:
    """'1-3, 5' -> [0, 1, 2, 4]. Empty means all pages."""
    if not spec.strip():
        return list(range(total))
    out: set[int] = set()
    for part in spec.split(","):
        m = re.fullmatch(r"\s*(\d+)\s*(?:-\s*(\d+))?\s*", part)
        if not m:
            raise HTTPException(400, "Page range should look like 1-3, 5")
        a, b = int(m[1]), int(m[2] or m[1])
        if a < 1 or b < a or b > total:
            raise HTTPException(400, f"Pages must be between 1 and {total}")
        out.update(range(a - 1, b))
    return sorted(out)


def translate_blocks(blocks: list[str], mode: str) -> list[str]:
    """PLACEHOLDER. Returns the text unchanged.
    Next step: protect glossary terms/code/formulas, then call the model
    (IndicTrans2 for Hindi; LLM or transliteration for Hinglish)."""
    return blocks


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/translate")
async def translate(
    file: UploadFile = File(...),
    mode: str = Form("hindi"),
    pages: str = Form(""),
):
    if mode not in MODES:
        raise HTTPException(400, "Unknown language option")
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File is larger than 20 MB")

    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception:
        raise HTTPException(400, "This file could not be read as a PDF")

    selected = parse_pages(pages, doc.page_count)
    if len(selected) > MAX_PAGES:
        raise HTTPException(400, f"Choose at most {MAX_PAGES} pages at a time")

    sections = []
    for i in selected:
        raw = [b[4].strip() for b in doc[i].get_text("blocks") if b[6] == 0]
        translated = translate_blocks([t for t in raw if t], mode)
        paras = "".join(f"<p>{escape(t).replace(chr(10), ' ')}</p>" for t in translated)
        sections.append(f"<section><h6>Page {i + 1}</h6>{paras}</section>")
    doc.close()  # everything stays in memory, so there are no temp files to clean up

    html = f"""<html><head><meta charset="utf-8"><style>
      @page {{ size: A4; margin: 18mm; }}
      body {{ font-family: 'Noto Sans Devanagari', 'Noto Sans', sans-serif; font-size: 11pt; line-height: 1.6; }}
      section {{ page-break-after: always; }}
      h6 {{ color: #666; font-size: 9pt; margin: 0 0 8pt; }}
    </style></head><body>{''.join(sections)}</body></html>"""

    pdf = HTML(string=html).write_pdf()
    return Response(pdf, media_type="application/pdf")
