// @TODO need to work cronjob expressions
export function dateToCron(date: Date) {
  const minutes = date.getMinutes()
  const hours = date.getHours()
  const dayOfMonth = date.getDate()
  const months = date.getMonth() + 1
  // const dayOfWeek = date.getDay()
  const year = date.getFullYear() as number

  return `cron(${minutes} ${hours} ${dayOfMonth} ${months} ? ${year})`
}
