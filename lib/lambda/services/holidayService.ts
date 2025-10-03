import axios from 'axios'

let holidaysCache: Set<string> | null = null
const HOLIDAYS_URL = 'https://content.capta.co/Recruitment/WorkingDays.json'

export const getHolidays = async (): Promise<Set<string>> => {
  if (holidaysCache) {
    return holidaysCache
  }

  try {
    const response = await axios.get<string[]>(HOLIDAYS_URL)
    holidaysCache = new Set(response.data)
    return holidaysCache
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return new Set();
  }
}

export const isHoliday = async (date: Date): Promise<boolean> => {
  const holidays = await getHolidays()
  const formattedDate = formatDate(date)
  return holidays.has(formattedDate)
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
