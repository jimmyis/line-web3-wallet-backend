const $whitelist = [
  `https://hoppscotch.io`,
  `https://proxy.hoppscotch.io`,
  `http://localhost:5001`,
  `http://localhost:5002`,
]
  
export default function (whitelist: string[], options?: any) {
  return {
    origin: (origin: string, callback: Function) => {
      const _whitelist = [ ...$whitelist, ...whitelist ]

      if (!origin || _whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("CORS not allow for this origin"))
      }
    }
  }
}