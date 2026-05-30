export type ModalEntry = { id: string | number; close: () => any }


const g = globalThis as any
const KEY = '__typewords_modalStack__'

if (!g[KEY]) g[KEY] = []

export const modalStack: ModalEntry[] = g[KEY]
