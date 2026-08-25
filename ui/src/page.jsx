// ── COMPONENT PAGE tier ───────────────────────────────────────────────────────
//
// This is the modern own-UI tier for a GLOBAL studio page (no project attached).
// register.yaml declares it as:
//
//     pages:
//       - id: example
//         component: ui/dist/page.js     ← this file, built
//
// The keel studio serves the built bundle at /plugin-assets/example/ui/dist/page.js,
// dynamic-imports it (NO iframe, NO code loaded into keel itself), and calls the
// exported mount(el, keel). React and the CSS are BUNDLED into the output, so the
// file is fully self-contained; the studio never runs its markup.
//
// The `keel` object it hands us (see internal/studio/web/src/lib/pluginmount.tsx):
//   keel.plugin              — our plugin name ("example")
//   keel.dir                 — the focused project; UNDEFINED here (this is global)
//   keel.call(action, args)  — runs one of OUR declared actions, returns its JSON
//   keel.projects()          — host data: the user's tracked projects (read-only)
//
// We demonstrate the two things a global page can do: reach our own back end
// through keel.call('echo', …) → bin/echo, and read host data with keel.projects().

import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './example.css'

function Page({ keel }) {
  const [text, setText] = useState('hello from the component page')
  const [result, setResult] = useState('result appears here…')
  const [busy, setBusy] = useState(false)
  const [projects, setProjects] = useState([])

  // keel.projects() is host data the studio provides so a global page can offer a
  // project picker or list — it stays read-only and the studio keeps its token.
  useEffect(() => {
    let alive = true
    keel.projects().then((ps) => {
      if (alive) setProjects(ps || [])
    })
    return () => {
      alive = false
    }
  }, [keel])

  // The bridge: keel.call('echo', {text}) makes keel run OUR bin/echo action and
  // hand us the JSON it prints. keel only proxies the call — the work is in bin/echo.
  async function runEcho() {
    setBusy(true)
    setResult('calling…')
    try {
      const r = await keel.call('echo', { text })
      setResult(JSON.stringify(r, null, 2))
    } catch (e) {
      setResult('error: ' + (e && e.message ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ex-root">
      <span className="ex-tier">component-page tier</span>
      <h1>◈ Example (component page)</h1>
      <p className="ex-sub">
        A global studio page shipped as a built React ES module (<code>ui/dist/page.js</code>). It is
        NOT a project screen, so <code>keel.dir</code> is undefined. It reaches its own back end
        through <code>keel.call</code> and reads host data through <code>keel.projects()</code>.
      </p>

      <div className="ex-card">
        <h2>The bridge — keel.call('echo', {'{text}'}) → bin/echo</h2>
        <div className="ex-row">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="type something" />
          <button onClick={runEcho} disabled={busy}>
            Echo it
          </button>
        </div>
        <pre>{result}</pre>
        <p className="ex-note">
          keel runs our <code>echo</code> action (this plugin's own <code>bin/echo</code>), trust- and
          capability-gated, and returns its JSON here. The component never touches keel's API directly.
        </p>
      </div>

      <div className="ex-card">
        <h2>Host data — keel.projects()</h2>
        {projects.length === 0 ? (
          <p className="ex-note">No tracked projects (or none loaded yet). Track a project in keel and it appears here.</p>
        ) : (
          <ul className="ex-list">
            {projects.map((p) => (
              <li key={p.path}>
                <span>{p.name}</span>
                <span className="ex-muted">{p.framework || 'unknown'}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="ex-note">
          The studio provides the tracked-project list read-only — enough for a picker, without handing
          the plugin the API or its token.
        </p>
      </div>
    </div>
  )
}

// One React root per mounted element, so unmount can tear it down cleanly.
const roots = new WeakMap()

// mount is what the studio calls after import — it hands us our node and the keel
// bridge. This is the required export (unmount is optional).
export function mount(el, keel) {
  let root = roots.get(el)
  if (!root) {
    root = createRoot(el)
    roots.set(el, root)
  }
  root.render(<Page keel={keel} />)
}

// unmount tears the React tree down; the studio calls it on navigate-away.
export function unmount(el) {
  const root = roots.get(el)
  if (root) {
    root.unmount()
    roots.delete(el)
  }
}
