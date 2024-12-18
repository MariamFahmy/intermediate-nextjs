import 'server-only'
import { db } from '@/db/db'
import { attendees, events, rsvps } from '@/db/schema'
import { delay } from './delay'
import { memoize } from 'nextjs-better-unstable-cache'
import { and, asc, count, desc, eq, ne, not } from 'drizzle-orm'

export const getGuestList = memoize(
  async (userId: string) => {
    await delay()

    const uniqueAttendees = await db
      .selectDistinct({
        id: attendees.id,
        name: attendees.name,
        email: attendees.email,
      })
      .from(events)
      .leftJoin(rsvps, eq(rsvps.eventId, events.id))
      .leftJoin(attendees, eq(attendees.id, rsvps.attendeeId))
      .where(eq(events.createdById, userId))
      .execute()

    return uniqueAttendees
  },
  {
    persist: true,
    revalidateTags: () => ['guests'],
    suppressWarnings: true,
    log: ['datacache', 'verbose'],
    logid: 'guests',
  }
)
