export function formatMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number)
  const label = new Intl.DateTimeFormat('sr-Latn-RS', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthNumber - 1, 1))

  return label.charAt(0).toUpperCase() + label.slice(1)
}
