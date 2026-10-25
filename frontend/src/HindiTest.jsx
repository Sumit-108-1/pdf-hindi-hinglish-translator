import { useState } from "react";
import { translateToHindi } from "./utils/hindiTranslator";

export default function HindiTest() {
  const [english, setEnglish] = useState(
    "A Raspberry Pi is a small computer used in electronics projects."
  );

  const [hindi, setHindi] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTranslate() {
    setLoading(true);
    setHindi("");
    setStatus("Loading translation model...");

    try {
      const result = await translateToHindi(
        english,
        (progress) => {
          if (progress.status === "progress") {
            setStatus(
              `Downloading model: ${Math.round(progress.progress || 0)}%`
            );
          }
        }
      );

      setHindi(result);
      setStatus("Translation completed!");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "60px auto",
        padding: 30,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>PDFLingo — Hindi Translation Test</h1>

      <p>Enter a short English sentence:</p>

      <textarea
        value={english}
        onChange={(e) => setEnglish(e.target.value)}
        rows={5}
        style={{
          width: "100%",
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 10
        }}
      />

      <button
        onClick={handleTranslate}
        disabled={loading || !english.trim()}
        style={{
          marginTop: 20,
          padding: "14px 25px",
          background: "#232a23",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer"
        }}
      >
        {loading ? "Please wait..." : "Translate to Hindi"}
      </button>

      <p aria-live="polite">{status}</p>

      {hindi && (
        <div
          style={{
            marginTop: 25,
            padding: 20,
            background: "#e9f8d9",
            borderRadius: 15
          }}
        >
          <h3>Hindi Translation</h3>
          <p lang="hi">{hindi}</p>
        </div>
      )}
    </div>
  );
}
