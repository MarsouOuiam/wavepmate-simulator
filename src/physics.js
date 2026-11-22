
// WAVELAB - Optical physics calculations
// Wavelength is expressed in micrometers (µm).

export function calculateWavelength(frequencyTHz) {
  if (frequencyTHz <= 0) return 0
  return 299.792458 / frequencyTHz
}

// Sellmeier equation for alpha-quartz.
// Coefficients: optical materials Sellmeier reference.
// Validity range used here: 0.198–2.0531 µm.
function quartzIndex(wavelength, extraordinary = false) {
  const A = extraordinary
    ? [1.381, 0.0100, 0.9992]
    : [1.354, 0.0100, 0.9994]

  const L = extraordinary
    ? [0.093505, 11.310, 9.5280]
    : [0.092612, 10.700, 9.8500]

  const l2 = wavelength * wavelength

  const n2 =
    1 +
    A[0] * l2 / (l2 - L[0] ** 2) +
    A[1] * l2 / (l2 - L[1] ** 2) +
    A[2] * l2 / (l2 - L[2] ** 2)

  return Math.sqrt(n2)
}

// Ghosh 1999 Sellmeier equations for calcite.
// Validity range: 0.204–2.172 µm.
function calciteIndex(wavelength, extraordinary = false) {
  const l2 = wavelength * wavelength

  if (extraordinary) {
    const n2 =
      1.35859695 +
      (0.82427830 * l2) / (l2 - 0.0106689543) +
      (0.14429128 * l2) / (l2 - 120)

    return Math.sqrt(n2)
  }

  const n2 =
    1.73358749 +
    (0.96464345 * l2) / (l2 - 0.0194325203) +
    (1.82831454 * l2) / (l2 - 120)

  return Math.sqrt(n2)
}

export function getMaterialIndices(material, wavelength) {
  if (!wavelength || wavelength <= 0) {
    return { no: 0, ne: 0 }
  }

  if (material === 'Quartz') {
    return {
      no: quartzIndex(wavelength, false),
      ne: quartzIndex(wavelength, true)
    }
  }

  if (material === 'Calcite') {
    return {
      no: calciteIndex(wavelength, false),
      ne: calciteIndex(wavelength, true)
    }
  }

  return { no: 0, ne: 0 }
}

export function calculateBirefringence(no, ne) {
  return Math.abs(ne - no)
}

export function calculatePhaseDifference(
  thicknessUm,
  wavelengthUm,
  no,
  ne
) {
  if (wavelengthUm <= 0) return 0

  const deltaN = calculateBirefringence(no, ne)
  const phase = (360 * deltaN * thicknessUm) / wavelengthUm

  return ((phase % 360) + 360) % 360
}

export function calculateQuarterWaveThickness(
  wavelengthUm,
  no,
  ne
) {
  const deltaN = calculateBirefringence(no, ne)

  if (deltaN === 0 || wavelengthUm <= 0) return null

  return wavelengthUm / (4 * deltaN)
}

export function calculateStokesParameters(angleDeg, phaseDeg) {
  const theta = angleDeg * Math.PI / 180
  const delta = phaseDeg * Math.PI / 180

  return {
    S0: 1,
    S1: Math.cos(2 * theta),
    S2: Math.sin(2 * theta) * Math.cos(delta),
    S3: Math.sin(2 * theta) * Math.sin(delta)
  }
}

export function getPolarization(angleDeg, phaseDeg) {
  const stokes = calculateStokesParameters(angleDeg, phaseDeg)

  if (Math.abs(stokes.S3) < 0.001) {
    return 'Linear'
  }

  if (
    Math.abs(stokes.S1) < 0.001 &&
    Math.abs(stokes.S2) < 0.001
  ) {
    return 'Circular'
  }

  return 'Elliptical'
}

export function calculateFieldComponents(
  angleDeg,
  phaseDeg,
  timeRad
) {
  const theta = angleDeg * Math.PI / 180
  const delta = phaseDeg * Math.PI / 180

  return {
    Ex: Math.cos(theta) * Math.cos(timeRad),
    Ey: Math.sin(theta) * Math.cos(timeRad + delta)
  }
}
