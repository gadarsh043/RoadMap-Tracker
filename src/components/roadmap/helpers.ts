export function getSide(globalIndex: number): 'left' | 'right' {
  return globalIndex % 2 === 0 ? 'left' : 'right'
}

export function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const dy = curr.y - prev.y
    const cp1x = prev.x
    const cp1y = prev.y + dy * 0.4
    const cp2x = curr.x
    const cp2y = curr.y - dy * 0.4
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`
  }
  return d
}
