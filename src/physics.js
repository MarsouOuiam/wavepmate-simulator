
export function calculateWavelength(frequencyTHz) {
  if (frequencyTHz <= 0) return 0
  return 299.792458 / frequencyTHz
}

export function calculateBirefringence(no, ne) {
  return Math.abs(ne - no)
}

export function calculatePhaseDifference(thicknessUm, wavelengthUm, no, ne) {
  if (wavelengthUm <= 0) return 0

  const deltaN = calculateBirefringence(no, ne)
  const phase = (360 * deltaN * thicknessUm) / wavelengthUm

  return ((phase % 360) + 360) % 360
}

export function calculateQuarterWaveThickness(wavelengthUm, no, ne) {
  const deltaN = calculateBirefringence(no, ne)

  if (deltaN === 0 || wavelengthUm <= 0) return null

  return wavelengthUm / (4 * deltaN)
}

export function getPolarization(angleDeg, phaseDeg) {
  const theta = angleDeg * Math.PI / 180
  const delta = phaseDeg * Math.PI / 180

  const condition = Math.sin(2 * theta) * Math.sin(delta)

  if (Math.abs(condition) < 0.001) {
    return 'Linear'
  }

  if (
    Math.abs(angleDeg - 45) < 0.1 &&
    Math.abs(Math.abs(Math.sin(delta)) - 1) < 0.001
  ) {
    return 'Circular'
  }

  return 'Elliptical'
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

export function calculateFieldComponents(angleDeg, phaseDeg, timeRad) {
  const theta = angleDeg * Math.PI / 180
  const delta = phaseDeg * Math.PI / 180

  return {
    Ex: Math.cos(theta) * Math.cos(timeRad),
    Ey: Math.sin(theta) * Math.cos(timeRad + delta)
  }
}
