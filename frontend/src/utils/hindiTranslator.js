let translatorPromise = null;

async function loadHindiModel(onProgress) {
  if (!translatorPromise) {
    translatorPromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");

      return pipeline(
        "translation",
        "Xenova/opus-mt-en-hi",
        {
          device: "wasm",
          dtype: "q8",
          progress_callback: (progress) => {
            if (typeof onProgress === "function") {
              onProgress(progress);
            }
          }
        }
      );
    })().catch((error) => {
      translatorPromise = null;
      throw error;
    });
  }

  return translatorPromise;
}

export async function translateToHindi(text, onProgress) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Please enter some English text.");
  }

  const translator = await loadHindiModel(onProgress);

  const result = await translator(text.trim(), {
    max_new_tokens: 256
  });

  const translatedText = result?.[0]?.translation_text;

  if (!translatedText) {
    throw new Error("The model did not return a translation.");
  }

  return translatedText;
}
