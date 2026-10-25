import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractPDFText(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });

  const pdf = await loadingTask.promise;
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const text = textContent.items
        .map((item) => {
          if (!("str" in item)) return "";
          return item.str + (item.hasEOL ? "\n" : " ");
        })
        .join("")
        .trim();

      pages.push({
        pageNumber,
        text,
      });

      if (onProgress) {
        onProgress({
          currentPage: pageNumber,
          totalPages: pdf.numPages,
          percentage: Math.round(
            (pageNumber / pdf.numPages) * 100
          ),
        });
      }
    }

    return {
      fileName: file.name,
      totalPages: pdf.numPages,
      pages,
      fullText: pages.map((page) => page.text).join("\n\n"),
    };
  } finally {
    await pdf.destroy();
  }
}
