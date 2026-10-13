const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const clockFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function formatIndonesianDate(date: Date): string {
  return dateFormatter.format(date)
}

export function formatIndonesianDateTime(date: Date): string {
  const parts = clockFormatter.formatToParts(date)
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'

  return `${formatIndonesianDate(date)}, ${hour}:${minute}`
}
