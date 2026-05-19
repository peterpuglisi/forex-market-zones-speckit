import type { TradingSession, OverlapWindow } from './types'

export const TRADING_SESSIONS: TradingSession[] = [
  { id: 'sydney',   name: 'Sydney',   openHour: 22, closeHour: 7,  color: 'bg-amber-500'  },
  { id: 'tokyo',    name: 'Tokyo',    openHour: 0,  closeHour: 9,  color: 'bg-red-500'    },
  { id: 'london',   name: 'London',   openHour: 8,  closeHour: 17, color: 'bg-blue-500'   },
  { id: 'new-york', name: 'New York', openHour: 13, closeHour: 22, color: 'bg-green-500'  },
]

export const OVERLAP_WINDOWS: OverlapWindow[] = [
  { sessions: ['sydney',  'tokyo'],    openHour: 0,  closeHour: 7,  label: 'Sydney / Tokyo'    },
  { sessions: ['tokyo',   'london'],   openHour: 8,  closeHour: 9,  label: 'Tokyo / London'    },
  { sessions: ['london',  'new-york'], openHour: 13, closeHour: 17, label: 'London / New York' },
]
