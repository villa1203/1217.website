export function formaterDate(stringDate: string): string {
  const date = new Date(stringDate)
  if (isNaN(date.getTime())) {
    throw new Error("Date invalide")
  }
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)
}
