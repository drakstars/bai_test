import { del, get, set } from 'idb-keyval'
import { nanoid } from 'nanoid'
import { saveAs } from 'file-saver'


const RRWEB_SESSION_INDEX_KEY = 'rrweb-session-index'


const MAX_EVENTS_PER_SESSION = 10000


const MAX_SESSIONS = 10

export type RrwebSessionMeta = {
  
  id: string
  
  startedAt: string
  
  endedAt?: string
  
  eventCount: number
}

export type RrwebSession = RrwebSessionMeta & {
  events: any[]
}


function sessionKey(id: string) {
  return `rrweb-session-${id}`
}


async function getSessionIndex(): Promise<RrwebSessionMeta[]> {
  const raw = await get<RrwebSessionMeta[]>(RRWEB_SESSION_INDEX_KEY)
  return Array.isArray(raw) ? raw : []
}


async function updateSessionIndex(meta: RrwebSessionMeta): Promise<void> {
  const index = await getSessionIndex()
  const existingIdx = index.findIndex(s => s.id === meta.id)
  if (existingIdx !== -1) {
    index[existingIdx] = meta
  } else {
    index.push(meta)
  }


  if (index.length > MAX_SESSIONS) {
    const sorted = [...index].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    const toDelete = sorted.slice(0, index.length - MAX_SESSIONS)
    for (const old of toDelete) {
      await del(sessionKey(old.id))
    }
    const deleteIds = new Set(toDelete.map(s => s.id))
    const newIndex = index.filter(s => !deleteIds.has(s.id))
    await set(RRWEB_SESSION_INDEX_KEY, newIndex)
  } else {
    await set(RRWEB_SESSION_INDEX_KEY, index)
  }
}


async function persistSession(session: RrwebSession): Promise<void> {

  session.eventCount = session.events.length
  await set(sessionKey(session.id), session)
  await updateSessionIndex({
    id: session.id,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    eventCount: session.events.length,
  })
}


let stopFn: (() => void) | null = null
let isRecording = false


export async function startRrwebRecording(): Promise<void> {
  if (isRecording) return
  if (!import.meta.client) return


  const { record } = await import('@rrweb/record')

  const sessionId = nanoid()
  const startedAt = new Date().toISOString()
  const events: any[] = []

  const session: RrwebSession = {
    id: sessionId,
    startedAt,
    eventCount: 0,
    events,
  }

  isRecording = true

  stopFn =
    record({
      emit(event) {
        if (!isRecording) return

        events.push(event)


        if (events.length % 50 === 0 || events.length === 1) {
          persistSession(session).catch(console.error)
        }


        if (events.length >= MAX_EVENTS_PER_SESSION) {
          stopCurrentSession()
        }
      },

      sampling: {

        mousemove: false,

        mouseInteraction: false,
        scroll: 150,
        // set the interval of media interaction event
        media: 800,
        input: 'last',
      },
    }) ?? null


  const onVisibilityChange = () => {
    if (document.hidden) {

      if (stopFn) {
        stopFn()
        stopFn = null
        isRecording = false

        persistSession(session).catch(console.error)
      }
    } else {

      if (!isRecording && events.length < MAX_EVENTS_PER_SESSION) {
        isRecording = true
        stopFn =
          record({
            emit(event) {
              if (!isRecording) return
              events.push(event)
              if (events.length % 50 === 0) {
                persistSession(session).catch(console.error)
              }
              if (events.length >= MAX_EVENTS_PER_SESSION) {
                stopCurrentSession()
                document.removeEventListener('visibilitychange', onVisibilityChange)
              }
            },
            sampling: { mousemove: 50, scroll: 150, input: 'last' },
          }) ?? null
      }
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
}


function stopCurrentSession(): void {
  if (stopFn) {
    stopFn()
    stopFn = null
  }
  isRecording = false
}


export async function exportRrwebSessions(): Promise<void> {
  if (!import.meta.client) return

  const index = await getSessionIndex()
  if (index.length === 0) return

  const sessions: RrwebSession[] = []
  for (const meta of index) {
    const session = await get<RrwebSession>(sessionKey(meta.id))
    if (session) sessions.push(session)
  }

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `rrweb-sessions-${dateStr}.json`
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), sessions }, null, 2)], {
    type: 'application/json',
  })
  saveAs(blob, filename)
}


export async function getRrwebSessionStats(): Promise<{
  sessionCount: number
  totalEventCount: number
  latestStartedAt: string | null
}> {
  const index = await getSessionIndex()
  if (index.length === 0) {
    return { sessionCount: 0, totalEventCount: 0, latestStartedAt: null }
  }
  const totalEventCount = index.reduce((sum, s) => sum + (s.eventCount ?? 0), 0)
  const sorted = [...index].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  return {
    sessionCount: index.length,
    totalEventCount,
    latestStartedAt: sorted[0]?.startedAt ?? null,
  }
}


export async function deleteRrwebSession(id: string): Promise<void> {
  await del(sessionKey(id))
  const index = await getSessionIndex()
  const newIndex = index.filter(s => s.id !== id)
  await set(RRWEB_SESSION_INDEX_KEY, newIndex)
}


export async function getAllRrwebSessions(): Promise<RrwebSession[]> {
  const index = await getSessionIndex()
  const sessions: RrwebSession[] = []
  for (const meta of index) {
    const session = await get<RrwebSession>(sessionKey(meta.id))
    if (session) sessions.push(session)
  }

  return sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}