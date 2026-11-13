import type { RouteLocationRaw } from 'vue-router'
import emitter from 'tiny-emitter/instance'

// Module-level, so every component shares the same queue
let queue: Promise<unknown> = Promise.resolve()

export function useRouteUpdate () {
  const router = useRouter()

  function updateRouter (patch: { params?: Record<string, any>, query?: Record<string, any> }) {
    const run = () => {
      // Read the route at run time, after any earlier update has finished
      const r = router.currentRoute.value
      return router.replace({
        params: patch.params, // router merges these over the current params
        query: { ...r.query, ...patch.query }, // query isn't merged for you
        hash: r.hash,
      } as RouteLocationRaw)
    }
    const result = queue.then(run, run)
    queue = result

    emitter.emit('show-loading', false)
    return result
  }

  return { updateRouter }
}
