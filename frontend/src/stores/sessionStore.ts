import { useEffect, useState } from 'react'

type UserShape = any

type SessionState = {
  user: UserShape | null
  setUser: (u: UserShape) => void
  clearUser: () => void
}

let internalState: SessionState = {
  user: { status: 'anonymous' },
  setUser: (u: UserShape) => {
    internalState.user = u
    notify()
  },
  clearUser: () => {
    internalState.user = { status: 'anonymous' }
    notify()
  },
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

// Hook-like selector similar to minimal zustand
export function useSessionStore<T = any>(selector: (s: SessionState) => T = (s) => (s as unknown as T)) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const l = () => setTick((t) => t + 1)
    listeners.add(l)
    return () => { listeners.delete(l); }
  }, [])

  return selector(internalState)
}

// expose getState for non-react callers
useSessionStore.getState = () => internalState

// also expose a setState helper
useSessionStore.setState = (next: Partial<SessionState>) => {
  internalState = { ...internalState, ...next }
  notify()
}

// named export already provided above
