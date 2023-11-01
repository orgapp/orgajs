/**
 * @see https://github.com/JakeGinnivan/merge-refs-hook
 */
import React from 'react'

function setRefs<T>(ref: React.Ref<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ref as any).current = value
  }
}

export function useMergeRefs<ForwardRef, LocalRef extends ForwardRef>(
  forwardedRef: React.Ref<ForwardRef>,
  localRef: React.Ref<LocalRef>
): (instance: LocalRef | null) => void {
  return React.useCallback(
    (value) => {
      setRefs(forwardedRef, value)
      setRefs(localRef, value)
    },
    [forwardedRef, localRef]
  )
}
