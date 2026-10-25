import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractPDFText(file, onProgress) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const task = pdfjsLib.getDocument({ data: bytes });
  const pdf = await task.promise;
  const pages = [];
  try {
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      const text = content.items.map(item => {
        if (!('str' in item)) return '';
        return item.str + (item.hasEOL ? '\n' : ' ');
      }).join('').trim();
      pages.push({ pageNumber: number, text });
      onProgress?.({ currentPage: number, totalPages: pdf.numPages, percentage: Math.round(number / pdf.numPages * 100) });
      page.cleanup();
    }
    return { fileName: file.name, totalPages: pdf.numPages, pages, fullText: pages.map(p => p.text).join('\n\n') };
  } finally {
    await pdf.destroy();
  }
}
