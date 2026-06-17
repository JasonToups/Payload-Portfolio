import { getSocialSettings } from './getSocialSettings'

interface GetNextPublishDateArgs {
  hourOffset?: number
}

export async function getNextPublishDate({ hourOffset = 0 }: GetNextPublishDateArgs = {}): Promise<Date> {
  const settings = await getSocialSettings()
  const timeZone = settings.timezone ?? 'America/Chicago'
  const targetHour = Number(settings.dailyPublishHour ?? '9') + hourOffset

  const now = new Date()
  const zonedNow = new Date(now.toLocaleString('en-US', { timeZone }))
  const target = new Date(zonedNow)
  target.setHours(targetHour, 0, 0, 0)
  if (target <= zonedNow) target.setDate(target.getDate() + 1)
  const utcOffsetMs = now.getTime() - zonedNow.getTime()
  return new Date(target.getTime() + utcOffsetMs)
}
