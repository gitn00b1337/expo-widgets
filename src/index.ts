import ExpoWidgetsModule from './ExpoWidgetsModule';

export { ExpoWidgetsModule }

let allowedKeys: string[] = []

export function setAllowedKeys(keys: string[]) {
  allowedKeys = keys
}

export function setValue(key: string, ...args: any) {
  if (allowedKeys.indexOf(key) === -1) {
    throw new Error(`Invalid key ${key} sent to ExpoWidgetsModule.setValue.`)
  }

  return ExpoWidgetsModule.setValue(key, ...args);
}

export function setUKBreakdown(
    version: string, 
    totalPct: number, 
    date: number, 
    month: number, 
    year: number, 
    wind: number, 
    solar: number, 
    hydro: number, 
    thermal: number, 
    tidal: number, 
    bio: number
  ) {
  ExpoWidgetsModule.setUKBreakdown(
    version,
    totalPct,
    date,
    month,
    year,
    wind,
    solar,
    hydro,
    thermal,
    tidal,
    bio
  )
}