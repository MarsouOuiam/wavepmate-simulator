
import { useMemo, useState } from 'react'
import './App.css'
import {
  calculateWavelength,
  calculatePhaseDifference,
  calculateQuarterWaveThickness,
  getPolarization,
  calculateStokesParameters
} from './physics'

const materials = {
  Quartz: { no: 1.544, ne: 1.553 },
  Calcite: { no: 1.658, ne: 1.486 },
  Mica: { no: 1.600, ne: 1.594 }
}

function App() {
  const [material, setMaterial] = useState('Quartz')
  const [frequency, setFrequency] = useState(500)
  const [thickness, setThickness] = useState(16.6)
  const [angle, setAngle] = useState(45)
  const [playing, setPlaying] = useState(true)
  const [history, setHistory] = useState([])

  const { no, ne } = materials[material]
  const wavelength = calculateWavelength(frequency)
  const phase = calculatePhaseDifference(thickness, wavelength, no, ne)
  const quarterThickness = calculateQuarterWaveThickness(wavelength, no, ne)
  const polarization = getPolarization(angle, phase)
  const stokes = calculateStokesParameters(angle, phase)

  const psi = 0.5 * Math.atan2(stokes.S2, stokes.S1) * 180 / Math.PI

  const chi = 0.5 * Math.asin(
    Math.max(-1, Math.min(1, stokes.S3))
  ) * 180 / Math.PI

  const ellipticity = Math.abs(
    Math.tan(chi * Math.PI / 180)
  )

  const deltaN = Math.abs(ne - no)

  const isQuarterWave =
    Math.abs(phase - 90) < 2 ||
    Math.abs(phase - 270) < 2

  const trajectory = useMemo(() => {
    const a = angle * Math.PI / 180
    const p = phase * Math.PI / 180

    return Array.from({ length: 181 }, (_, i) => {
      const t = i / 180 * Math.PI * 2
      const x = 150 + 105 * Math.cos(a) * Math.cos(t)
      const y = 115 - 105 * Math.sin(a) * Math.cos(t + p)

      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [angle, phase])

  const reset = () => {
    setMaterial('Quartz')
    setFrequency(500)
    setThickness(16.6)
    setAngle(45)
    setPlaying(true)
  }

  const applyPreset = (type) => {
    if (quarterThickness === null) return

    setThickness(quarterThickness)

    if (type === 'Linear') {
      setAngle(0)
    } else if (type === 'Circular') {
      setAngle(45)
    } else if (type === 'Elliptical') {
      setAngle(30)
    }
  }

  const applyQuarterWave = () => {
    if (quarterThickness !== null) {
      setThickness(quarterThickness)
    }
  }

  const downloadResults = () => {
    const content = [
      'WAVELAB - QUARTER-WAVE PLATE SIMULATION',
      '----------------------------------------',
      `Material: ${material}`,
      `Frequency: ${frequency} THz`,
      `Wavelength: ${wavelength.toFixed(4)} µm`,
      `Thickness: ${thickness.toFixed(4)} µm`,
      `Incident angle: ${angle} degrees`,
      `Ordinary index (no): ${no}`,
      `Extraordinary index (ne): ${ne}`,
      `Birefringence (Delta n): ${deltaN.toFixed(4)}`,
      `Phase difference: ${phase.toFixed(2)} degrees`,
      `Polarization: ${polarization}`,
      `Quarter-wave thickness: ${quarterThickness?.toFixed(4) ?? 'N/A'} µm`,
      '',
      'STOKES PARAMETERS',
      `S0: ${stokes.S0.toFixed(3)}`,
      `S1: ${stokes.S1.toFixed(3)}`,
      `S2: ${stokes.S2.toFixed(3)}`,
      `S3: ${stokes.S3.toFixed(3)}`,
      '',
      'POLARIZATION ELLIPSE',
      `Orientation: ${psi.toFixed(2)} degrees`,
      `Ellipticity: ${ellipticity.toFixed(3)}`,
      `Ellipticity angle: ${chi.toFixed(2)} degrees`
    ].join('\n')

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'WAVELAB-results.txt'
    link.click()

    URL.revokeObjectURL(url)
  }

const copyResults = () => {
  const text = [
    `Material: ${material}`,
    `Frequency: ${frequency} THz`,
    `Wavelength: ${wavelength.toFixed(4)} µm`,
    `Thickness: ${thickness.toFixed(4)} µm`,
    `Angle: ${angle}°`,
    `Phase: ${phase.toFixed(2)}°`,
    `Polarization: ${polarization}`,
    `Stokes S0: ${stokes.S0.toFixed(3)}`,
    `Stokes S1: ${stokes.S1.toFixed(3)}`,
    `Stokes S2: ${stokes.S2.toFixed(3)}`,
    `Stokes S3: ${stokes.S3.toFixed(3)}`
  ].join('\n')

  navigator.clipboard.writeText(text)
}
const saveExperiment = () => {
  const experiment = {
    material,
    frequency,
    thickness,
    angle,
    wavelength,
    phase,
    polarization
  }

  setHistory(prev => [experiment, ...prev].slice(0, 5))
}
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="logo" href="#home">
          <span className="logo-mark">λ</span>
          <span>WAVE<span className="logo-light">LAB</span></span>
        </a>

        <nav className="top-nav">
          <a href="#simulation">Simulation</a>
          <a href="#analysis">Analysis</a>
          <a href="#theory">Theory</a>
        </nav>

        <div className="top-status">
          <span className="online-dot" />
          OPTICAL LAB / 01
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span /> INTERACTIVE PHOTONICS EXPERIMENT
            </div>

            <h1>Quarter-Wave <em>Plate</em></h1>

            <p>
              Explore birefringence, phase retardation and the transformation
              of light polarization in real time.
            </p>
          </div>

          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-core">λ/4</div>
          </div>
        </section>

        <section className="workspace" id="simulation">
          <aside className="glass-card parameter-panel">
            <div className="card-heading">
              <div>
                <span className="overline">EXPERIMENT SETUP</span>
                <h2>Parameters</h2>
              </div>
              <span className="heading-icon">⌘</span>
            </div>

            <div className="field">
              <label htmlFor="material">OPTICAL MATERIAL</label>
              <select
                id="material"
                value={material}
                onChange={e => setMaterial(e.target.value)}
              >
                {Object.keys(materials).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <div className="field-top">
                <label htmlFor="frequency">LIGHT FREQUENCY</label>
                <output>{frequency} <small>THz</small></output>
              </div>

              <input
                id="frequency"
                type="range"
                min="400"
                max="800"
                step="10"
                value={frequency}
                onChange={e => setFrequency(Number(e.target.value))}
              />

              <div className="range-ends">
                <span>400 THz</span>
                <span>800 THz</span>
              </div>
            </div>

            <div className="field">
              <div className="field-top">
                <label htmlFor="thickness">PLATE THICKNESS</label>
                <output>{thickness.toFixed(2)} <small>µm</small></output>
              </div>

              <input
                id="thickness"
                type="range"
                min="0.1"
                max="100"
                step="0.1"
                value={thickness}
                onChange={e => setThickness(Number(e.target.value))}
              />

              <div className="range-ends">
                <span>0.1 µm</span>
                <span>100 µm</span>
              </div>
            </div>

            <div className="field">
              <div className="field-top">
                <label htmlFor="angle">POLARIZATION ANGLE</label>
                <output>{angle}°</output>
              </div>

              <input
                id="angle"
                type="range"
                min="0"
                max="90"
                step="1"
                value={angle}
                onChange={e => setAngle(Number(e.target.value))}
              />

              <div className="range-ends">
                <span>0°</span>
                <span>90°</span>
              </div>
            </div>

            <div className="material-data">
              <div className="data-title">MATERIAL PROPERTIES</div>
              <div><span>Ordinary index (no)</span><b>{no}</b></div>
              <div><span>Extraordinary index (ne)</span><b>{ne}</b></div>
              <div><span>Birefringence (Δn)</span><b>{deltaN.toFixed(4)}</b></div>
            </div>

            <button className="primary-button" onClick={applyQuarterWave}>
              Apply λ / 4 thickness <span>↗</span>
            </button>

            <button className="secondary-button" onClick={reset}>
              ↺ Reset experiment
            </button>

            <div className="preset-section">
              <div className="data-title">POLARIZATION PRESETS</div>

              <div className="preset-buttons">
                <button
                  className={polarization === 'Linear' ? 'preset-active' : ''}
                  onClick={() => applyPreset('Linear')}
                >
                  Linear
                </button>

                <button
                  className={polarization === 'Circular' ? 'preset-active' : ''}
                  onClick={() => applyPreset('Circular')}
                >
                  Circular
                </button>

                <button
                  className={polarization === 'Elliptical' ? 'preset-active' : ''}
                  onClick={() => applyPreset('Elliptical')}
                >
                  Elliptical
                </button>
              </div>
            </div>
          </aside>

          <section className="glass-card simulation-panel">
            <div className="card-heading">
              <div>
                <span className="overline">LIVE EXPERIMENT</span>
                <h2>Wave propagation</h2>
              </div>
              <span className="live-indicator"><i /> LIVE</span>
            </div>

            <div className={`wave-stage ${playing ? 'is-playing' : 'is-paused'}`}>
              <div className="stage-caption">INCIDENT LIGHT</div>

              <div className="beam beam-in">
                <div className="beam-line" />
                <div className="beam-wave">∿ ∿ ∿</div>
              </div>

              <div className="plate-object">
                <div className="plate-shine" />
                <span>λ/4</span>
                <small>{material}</small>
                <div className="plate-axis" />
              </div>

              <div className="beam beam-out">
                <div className="beam-line" />
                <div className="beam-wave">∿ ∿ ∿</div>
              </div>

              <div className="stage-caption output-caption">OUTPUT LIGHT</div>
              <div className="propagation-label">PROPAGATION DIRECTION →</div>
            </div>

            <div className="legend">
              <span><i className="legend-blue" /> Incident wave</span>
              <span><i className="legend-violet" /> Birefringent plate</span>
              <span><i className="legend-green" /> Transmitted wave</span>
            </div>

            <div className="polarization-block" id="analysis">
              <div className="graph-title">
                <div>
                  <span className="overline">ELECTRIC FIELD ANALYSIS</span>
                  <h3>Polarization trajectory</h3>
                </div>
                <span className="state-pill">{polarization.toUpperCase()}</span>
              </div>

              <div className="polarization-graph">
                <svg
                  viewBox="0 0 300 230"
                  role="img"
                  aria-label="Electric field polarization trajectory"
                >
                  <defs>
                    <linearGradient
                      id="trajectoryGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#4b9cff" />
                      <stop offset="100%" stopColor="#a17bff" />
                    </linearGradient>
                  </defs>

                  <circle cx="150" cy="115" r="105" className="graph-circle" />
                  <circle cx="150" cy="115" r="70" className="graph-circle" />

                  <line
                    x1="25"
                    y1="115"
                    x2="275"
                    y2="115"
                    className="graph-axis"
                  />

                  <line
                    x1="150"
                    y1="10"
                    x2="150"
                    y2="220"
                    className="graph-axis"
                  />

                  <path d={trajectory} className="trajectory-path" />

                  <text x="280" y="110">Ex</text>
                  <text x="158" y="12">Ey</text>
                  <circle cx="150" cy="115" r="3" className="graph-center" />
                </svg>
              </div>

              <div className="ellipse-info">
                <span>ELLIPSE ORIENTATION</span>
                <strong>{psi.toFixed(2)}°</strong>
                <span>ELLIPTICITY ANGLE</span>
                <strong>{chi.toFixed(2)}°</strong>
              </div>

              <div className="graph-foot">
                <span><i /> Electric field trajectory</span>
                <span>Ex / Ey plane</span>
              </div>
            </div>

            <div className="simulation-actions">
              <button
                className="play-button"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? 'Ⅱ Pause animation' : '▶ Play animation'}
              </button>

              <span>
                {playing ? 'Animation enabled' : 'Animation paused'}
              </span>
            </div>
          </section>

          <aside className="glass-card results-panel">
            <div className="card-heading">
              <div>
                <span className="overline">COMPUTED VALUES</span>
                <h2>Results</h2>
              </div>
              <span className="result-symbol">↗</span>
            </div>

            <div className="result-item">
              <span>WAVELENGTH</span>
              <strong>{wavelength.toFixed(4)} <small>µm</small></strong>
              <div className="result-formula">λ = c / f</div>
            </div>

            <div className="result-item">
              <span>PHASE RETARDATION</span>
              <strong>{phase.toFixed(2)} <small>°</small></strong>
              <div className="result-formula">δ = 2π Δn d / λ</div>
            </div>

            <div className="result-item">
              <span>OUTPUT POLARIZATION</span>
              <strong className="state-result">{polarization}</strong>
              <div className="result-formula">Based on angle and phase</div>
            </div>

            <div className="result-item featured-result">
              <span>IDEAL λ / 4 THICKNESS</span>
              <strong>
                {quarterThickness === null
                  ? 'N/A'
                  : quarterThickness.toFixed(3)}
                <small> µm</small>
              </strong>
              <div className="result-formula">d = λ / (4 Δn)</div>
            </div>

            <div className="result-item stokes-card">
              <span>STOKES PARAMETERS</span>

              <div className="stokes-values">
                <div>S₀ <strong>{stokes.S0.toFixed(3)}</strong></div>
                <div>S₁ <strong>{stokes.S1.toFixed(3)}</strong></div>
                <div>S₂ <strong>{stokes.S2.toFixed(3)}</strong></div>
                <div>S₃ <strong>{stokes.S3.toFixed(3)}</strong></div>
              </div>

              <div className="result-formula">
                Normalized polarization state
              </div>
            </div>

            <div className="result-item">
              <span>POLARIZATION ELLIPSE</span>

              <div className="stokes-values">
                <div>Orientation <strong>{psi.toFixed(2)}°</strong></div>
                <div>Ellipticity <strong>{ellipticity.toFixed(3)}</strong></div>
                <div>Angle χ <strong>{chi.toFixed(2)}°</strong></div>
              </div>
            </div>

            <div className={`quarter-status ${isQuarterWave ? 'status-good' : ''}`}>
              <span>{isQuarterWave ? '✓' : '○'}</span>
              {isQuarterWave
                ? 'Quarter-wave condition reached'
                : 'Adjust thickness to reach 90°'}
            </div>

           
<div className="export-actions">
  <button className="download-button" onClick={downloadResults}>
    ↓ Export experiment results
  </button>

  <button className="copy-button" onClick={copyResults}>
    ⧉ Copy results
  </button>
</div>
<button className="save-button" onClick={saveExperiment}>
  + Save Experiment
</button>

<div className="history-section">
  <div className="data-title">EXPERIMENT HISTORY</div>
  <button
  className="clear-history"
  onClick={() => setHistory([])}
>
  Clear History
</button>

  {history.length === 0 ? (
    <p className="history-empty">No saved experiments yet.</p>
  ) : (
    history.map((item, index) => (
      <div className="history-item" key={index}>
        <strong>{item.material}</strong>
        <span>{item.frequency} THz · {item.angle}°</span>
        <span>{item.polarization}</span>
        <small>Phase: {item.phase.toFixed(2)}°</small>
      </div>
    ))
  )}
</div>


          </aside>
        </section>

        <section className="theory-strip" id="theory">
          <div>
            <span className="overline">THE PHYSICS BEHIND IT</span>
            <h2>How does a quarter-wave plate work?</h2>
            <p>
              The plate introduces a phase difference between two perpendicular
              components of the electric field because they experience different
              refractive indices.
            </p>
          </div>

          <div className="equation">
            <span>PHASE DIFFERENCE</span>
            <strong>δ = 2π Δn d / λ</strong>
            <small>For a quarter-wave plate: δ = π / 2</small>
          </div>
        </section>
      </main>

      <footer>
        <span>WAVELAB <b>·</b> QUARTER-WAVE PLATE SIMULATOR</span>
        <span>OPTICS PROJECT · 2026</span>
      </footer>
    </div>
  )
}

export default App
