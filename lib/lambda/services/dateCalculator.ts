import { ValidatedParams } from '../types'
import { isHoliday } from './holidayService'

const TIMEZONE_OFFSET_HOURS = -5 // Colombia UTC-5
const WORK_HOURS = {
  START_UTC: 13,  // 8:00 AM Colombia = 13:00 UTC
  END_UTC: 22,    // 5:00 PM Colombia = 22:00 UTC
  LUNCH_START_UTC: 17, // 12:00 PM Colombia = 17:00 UTC
  LUNCH_END_UTC: 18,   // 1:00 PM Colombia = 18:00 UTC
  DAILY_HOURS: 8  // Total horas laborables por día (sin almuerzo)
} as const


export const calculateWorkingDate = async (params: ValidatedParams): Promise<string> => {
  let currentDate = new Date(params.startDate)

  currentDate = await adjustToWorkingTime(currentDate)

  if (params.days > 0) {
    currentDate = await addWorkingDays(currentDate, params.days)
  }

  if (params.hours > 0) {
    currentDate = await addWorkingHours(currentDate, params.hours)
  }

  return currentDate.toISOString()
}

const adjustToWorkingTime = async (date: Date): Promise<Date> => {
  const adjustedDate = new Date(date)

  adjustedDate.setTime(await getNextWorkingDay(adjustedDate).then(d => d.getTime()))

  const hours = adjustedDate.getUTCHours()
  const minutes = adjustedDate.getUTCMinutes()

  if (hours >= WORK_HOURS.END_UTC) {
    return await getNextWorkingDayAtTime(adjustedDate, WORK_HOURS.START_UTC)
  }

  if (hours < WORK_HOURS.START_UTC) {
    adjustedDate.setUTCHours(WORK_HOURS.START_UTC, 0, 0, 0)
    return adjustedDate
  }

  if (isDuringLunch(hours, minutes)) {
    adjustedDate.setUTCHours(WORK_HOURS.LUNCH_END_UTC, 0, 0, 0)
    return adjustedDate
  }

  return adjustedDate
}

const addWorkingDays = async (date: Date, days: number): Promise<Date> => {
  const result = new Date(date)
  let remainingDays = days

  while (remainingDays > 0) {
    result.setUTCDate(result.getUTCDate() + 1)

    if (await isWorkingDay(result)) {
      remainingDays--
    }
  }

  return result
}

const addWorkingHours = async (date: Date, hours: number): Promise<Date> => {
  const result = new Date(date)
  let remainingHours = hours

  const fullDays = Math.floor(remainingHours / WORK_HOURS.DAILY_HOURS)
  if (fullDays > 0) {
    const daysResult = await addWorkingDays(result, fullDays)
    result.setTime(daysResult.getTime())
    remainingHours = remainingHours % WORK_HOURS.DAILY_HOURS
  }

  while (remainingHours > 0) {
    result.setUTCHours(result.getUTCHours() + 1)

    if (result.getUTCHours() === WORK_HOURS.LUNCH_START_UTC) {
      result.setUTCHours(WORK_HOURS.LUNCH_END_UTC, 0, 0, 0)
    }

    if (result.getUTCHours() >= WORK_HOURS.END_UTC) {
      const nextDay = await getNextWorkingDayAtTime(result, WORK_HOURS.START_UTC)
      result.setTime(nextDay.getTime())
    }

    remainingHours--
  }

  return result
}

const isWorkingDay = async (date: Date): Promise<boolean> => {
  const colombiaDate = getColombiaDate(date)

  const dayOfWeek = colombiaDate.getUTCDay()

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }

  return !(await isHoliday(colombiaDate))
}

const getNextWorkingDay = async (date: Date): Promise<Date> => {
  const result = new Date(date)

  while (!(await isWorkingDay(result))) {
    result.setUTCDate(result.getUTCDate() + 1)
  }

  return result
}

const getNextWorkingDayAtTime = async (date: Date, hour: number): Promise<Date> => {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + 1)

  const nextWorkingDay = await getNextWorkingDay(result)
  nextWorkingDay.setUTCHours(hour, 0, 0, 0)

  return nextWorkingDay
}

const isDuringLunch = (hours: number, minutes: number): boolean => {
  return (hours === WORK_HOURS.LUNCH_START_UTC && minutes > 0) ||
    (hours > WORK_HOURS.LUNCH_START_UTC && hours < WORK_HOURS.LUNCH_END_UTC)
}

const getColombiaDate = (utcDate: Date): Date => {
  const offsetMs = TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000
  return new Date(utcDate.getTime() + offsetMs)
}