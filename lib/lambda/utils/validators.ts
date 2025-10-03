import { WorkingDaysParams, ValidatedParams } from '../types'

export const validateParams = (params: WorkingDaysParams): ValidatedParams => {
  const { days, hours, date } = params
  let startDate: Date

  if (!days && !hours) {
    throw new Error('At least one of "days" or "hours" parameters is required')
  }

  const parseDay = days ? Number(days) : 0
  if (days && (isNaN(parseDay) || parseDay < 0)) {
    throw new Error('Parameter "days" must be a positive integer')
  }

  const parseHours = hours ? Number(hours) : 0
  if (hours && (isNaN(parseHours) || parseHours < 0)) {
    throw new Error('Parameter "hours" must be a positive integer')
  }

  if (date) {
    startDate = new Date(date)
    if (isNaN(startDate.getTime())) {
      throw new Error('Parameter "date" must be a valid date')
    }
  } else {
    startDate = new Date()
  }

  return {
    days: parseDay,
    hours: parseHours,
    startDate: startDate,
  }
}