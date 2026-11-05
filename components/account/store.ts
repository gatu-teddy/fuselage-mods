'use client'

import { useSyncExternalStore } from 'react'

// Saved reels, persisted in localStorage. Accounts live in Supabase (AccountProvider);
// saves move there once reels are real database rows (uploads), since a saved row
// must reference a reel. Swap these functions for API calls then; the UI stays the same.

interface State {
  saved: string[] // reel ids, most recently saved first
}

const KEY = 'fuselage:v1'
const listeners = new Set<() => void>()
let state: State | null = null

function read(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { saved: Array.isArray(s.saved) ? s.saved : [] }
  } catch {
    return { saved: [] }
  }
}

const getState = () => (state ??= read())

function setState(next: State) {
  state = next
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach(l => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep other tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    state = read()
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** `null` until hydrated on the client (server render has no localStorage). */
export const useStore = (): State | null => useSyncExternalStore(subscribe, getState, () => null)

export function toggleSaved(id: string) {
  const { saved } = getState()
  setState({ saved: saved.includes(id) ? saved.filter(x => x !== id) : [id, ...saved] })
}
