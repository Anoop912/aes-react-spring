import { useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/aes";

const MODES = [
  { id: "ECB", desc: "Blocks encrypted independently. Leaks patterns.", secure: false },
  { id: "CBC", desc: "Each block is chained to the previous one using an IV.", secure: true },
  { id: "CTR", desc: "Turns AES into a stream cipher using a counter.", secure: true },
  { id: "GCM", desc: "Encryption plus authentication. Best choice.", secure: true },
];

const KEY_BITS = { 16: 128, 24: 192, 32: 256 };
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const randomKey = (length) =>
  Array.from(crypto.getRandomValues(new Uint32Array(length)), (n) => CHARS[n % CHARS.length]).join("");

export default function App() {
  const [form, setForm] = useState({ data: "", key: "", mode: "GCM", iv: "" });
  const [action, setAction] = useState("encrypt");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const keyBits = KEY_BITS[form.key.length];
  const needsIv = form.mode !== "ECB" && action === "decrypt";
  const canRun = form.data && keyBits && !loading;

  const run = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOutput(json);
      if (json.iv) setForm((f) => ({ ...f, iv: json.iv }));
    } catch (e) {
      setError(e instanceof TypeError ? "Cannot reach the server" : e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = (label, text) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const useAsInput = () => {
    setForm((f) => ({ ...f, data: output.result }));
    setAction("decrypt");
    setOutput(null);
  };

  return (
    <div className="app">
      <header>
        <div className="logo">🔐</div>
        <h1>AES Encryption Tool</h1>
        <p>Encrypt and decrypt text using AES-128, 192 or 256</p>
      </header>

      <main className="card">
        <label className="label">Mode of operation</label>
        <div className="modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`mode ${form.mode === m.id ? "active" : ""}`}
              onClick={() => setForm({ ...form, mode: m.id })}
            >
              <span className="mode-top">
                <strong>{m.id}</strong>
                <span className={`tag ${m.secure ? "ok" : "bad"}`}>{m.secure ? "Secure" : "Weak"}</span>
              </span>
              <small>{m.desc}</small>
            </button>
          ))}
        </div>

        <div className="tabs">
          {["encrypt", "decrypt"].map((a) => (
            <button
              key={a}
              className={action === a ? "active" : ""}
              onClick={() => {
                setAction(a);
                setOutput(null);
                setError("");
              }}
            >
              {a === "encrypt" ? "🔒 Encrypt" : "🔓 Decrypt"}
            </button>
          ))}
        </div>

        <label className="label">
          Secret key
          <span className={`badge ${keyBits ? "ok" : "bad"}`}>
            {keyBits ? `AES-${keyBits}` : `${form.key.length} chars - need 16, 24 or 32`}
          </span>
        </label>
        <div className="row">
          <input
            name="key"
            type={showKey ? "text" : "password"}
            placeholder="Enter 16, 24 or 32 characters"
            value={form.key}
            onChange={change}
          />
          <button className="ghost" onClick={() => setShowKey(!showKey)}>
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <div className="chips">
          <span>Generate:</span>
          {[16, 24, 32].map((n) => (
            <button key={n} className="chip" onClick={() => setForm({ ...form, key: randomKey(n) })}>
              AES-{KEY_BITS[n]}
            </button>
          ))}
        </div>

        <label className="label">{action === "encrypt" ? "Plaintext" : "Ciphertext (Base64)"}</label>
        <textarea
          name="data"
          rows={4}
          placeholder={action === "encrypt" ? "Type the text to encrypt..." : "Paste the Base64 ciphertext..."}
          value={form.data}
          onChange={change}
        />

        {needsIv && (
          <>
            <label className="label">IV (Base64)</label>
            <input name="iv" placeholder="Paste the IV from encryption" value={form.iv} onChange={change} />
          </>
        )}

        <button className="primary" disabled={!canRun} onClick={run}>
          {loading ? <span className="spinner" /> : action === "encrypt" ? "Encrypt" : "Decrypt"}
        </button>

        {error && <div className="error">⚠️ {error}</div>}

        {output && (
          <div className="result">
            <div className="result-head">
              <strong>{action === "encrypt" ? "Ciphertext" : "Plaintext"}</strong>
              <button className="chip" onClick={() => copy("result", output.result)}>
                {copied === "result" ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <pre>{output.result}</pre>

            {output.iv && (
              <>
                <div className="result-head">
                  <strong>IV</strong>
                  <button className="chip" onClick={() => copy("iv", output.iv)}>
                    {copied === "iv" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <pre>{output.iv}</pre>
              </>
            )}

            {action === "encrypt" && (
              <button className="ghost full" onClick={useAsInput}>
                Use as input and decrypt →
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}