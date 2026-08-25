// ── COMPONENT SCREEN tier ─────────────────────────────────────────────────────
//
// This is the own-UI tier for a PROJECT-SCOPED studio screen. register.yaml
// declares it as:
//
//     screens:
//       - id: example-screen-component
//         component: ui/dist/screen.js   ← this file, built
//
// Same mounting mechanism as the component page (the studio serves the bundle at
// /plugin-assets/example/ui/dist/screen.js, dynamic-imports it, calls mount(el, keel))
// — the ONE difference is scope: a screen belongs to the focused project, so the
// studio threads that project's path as keel.dir, and keel.call runs OUR action
// AGAINST that project. A component page has keel.dir undefined; a component
// screen always has it.
//
// We demonstrate exactly that: show keel.dir, and run keel.call('echo', …) which
// keel executes with the focused project in the environment (KEEL_PROJECT_DIR).

import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './example.css'

function Screen({ keel }) {
  const [result, setResult] = useState('result appears here…')
  const [busy, setBusy] = useState(false)

  // keel.call threads keel.dir automatically (see pluginmount.tsx: it posts `dir`
  // when set), so bin/echo runs with THIS project as KEEL_PROJECT_DIR. We pass a
  // note in the payload just to show the round-trip.
  async function runAgainstProject() {
    setBusy(true)
    setResult('calling…')
    try {
      const r = await keel.call('echo', { text: 'ran against the focused project' })
      setResult(JSON.stringify(r, null, 2))
    } catch (e) {
      setResult('error: ' + (e && e.message ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ex-root">
      <span className="ex-tier">component-screen tier</span>
      <h1>◈ Example (component screen)</h1>
      <p className="ex-sub">
        A project-scoped studio screen shipped as a built React ES module (<code>ui/dist/screen.js</code>).
        Because it belongs to a project, the studio threads that project as{' '}
        <code>keel.dir</code>, and <code>keel.call</code> runs against it.
      </p>

      <div className="ex-card">
        <h2>keel.dir — the focused project</h2>
        {keel.dir ? (
          <p className="ex-dir">{keel.dir}</p>
        ) : (
          <p className="ex-note">
            keel.dir is undefined — that only happens on a global page. On a screen it is always the
            focused project's path.
          </p>
        )}
      </div>

      <div className="ex-card">
        <h2>Run a project action — keel.call('echo', …) threaded to keel.dir</h2>
        <div className="ex-row">
          <button onClick={runAgainstProject} disabled={busy}>
            Run against this project
          </button>
        </div>
        <pre>{result}</pre>
        <p className="ex-note">
          keel runs our <code>echo</code> action (<code>bin/echo</code>) with the focused project in the
          environment (<code>KEEL_PROJECT_DIR</code>). A real screen would run a scan, a status check, a
          migration — always scoped to <code>keel.dir</code>.
        </p>
      </div>
    </div>
  )
}

// One React root per mounted element, so unmount can tear it down cleanly.
const roots = new WeakMap()

// mount is the required export — the studio calls it with our node and the keel
// bridge (keel.dir is set here because this is a project screen).
export function mount(el, keel) {
  let root = roots.get(el)
  if (!root) {
    root = createRoot(el)
    roots.set(el, root)
  }
  root.render(<Screen keel={keel} />)
}

// unmount tears the React tree down; the studio calls it on navigate-away.
export function unmount(el) {
  const root = roots.get(el)
  if (root) {
    root.unmount()
    roots.delete(el)
  }
}
