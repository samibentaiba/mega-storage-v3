import * as React from "react"

/**
 * Returns a debounced version of `value` that only updates after `delay` ms
 * of inactivity. Use this to defer expensive recalculations (e.g. search
 * filtering) so that they don't run on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = React.useState<T>(value)

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
