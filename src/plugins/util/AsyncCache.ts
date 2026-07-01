export type Fetcher<T, K> = (id: K) => Promise<T>
export type KeySerializer<K> = (id: K) => string

interface CacheEntry<T> {
  value: T
  cachedAt: number
  expiresAt: number | null
}

interface AsyncCacheOptions<K> {
  /** Time-to-live in milliseconds. If omitted, entries never expire. */
  ttl?: number
  /**
   * Maximum number of entries to keep in the cache. When the limit is reached
   * the least-recently-used entry is evicted to make room. If omitted the
   * cache grows without bound.
   */
  maxSize?: number
  /**
   * Converts the key type K into a string for use as the cache lookup key.
   * Defaults to String(id) when omitted, which is sufficient for primitives.
   *
   * @example (ids: number[]) => ids.join(",")
   */
  serializeKey?: KeySerializer<K>
}

/**
 * A generic async cache that stores server responses keyed by ID.
 *
 * Two type parameters:
 *  - T  — the shape of the cached value
 *  - K  — the type passed to the fetcher (and all public methods)
 *
 * K is converted to a string internally for cache lookups via `serializeKey`.
 * This lets the fetcher receive the original rich key (e.g. number[], object)
 * while the store uses a stable string representation.
 *
 * On the first request for a given key the provided fetcher is called and the
 * result is stored. Subsequent requests for the same key are served from the
 * cache until the entry expires (if a TTL was configured).
 *
 * In-flight requests are deduplicated: if two callers request the same key
 * simultaneously, only one fetch is made and both callers receive the same
 * result.
 *
 * @example
 * // Simple string key — no serializeKey needed
 * const userCache = new AsyncCache<User, string>(
 *   (id) => api.getUser(id),
 *   { ttl: 60_000, maxSize: 500 }
 * );
 *
 * @example
 * // Composite key passed as a number array
 * const tileCache = new AsyncCache<Tile, number[]>(
 *   (coords) => api.getTile(coords),
 *   { serializeKey: (coords) => coords.join(",") }
 * );
 * const tile = await tileCache.get([12, 34, 5]);
 */
export class AsyncCache<T, K = string> {
  private readonly fetcher: Fetcher<T, K>
  private readonly ttl: number | null
  private readonly maxSize: number | null
  private readonly serializeKey: KeySerializer<K>
  private readonly store = new Map<string, CacheEntry<T>>()
  private readonly inflight = new Map<string, Promise<T>>()

  constructor (fetcher: Fetcher<T, K>, options: AsyncCacheOptions<K> = {}) {
    this.fetcher = fetcher
    this.ttl = options.ttl ?? null
    this.maxSize = options.maxSize ?? null
    this.serializeKey = options.serializeKey ?? (id => String(id))
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Return the cached value for `id`, fetching it first if necessary.
   */
  async get (id: K): Promise<T> {
    const cacheKey = this.serializeKey(id)
    const entry = this.store.get(cacheKey)

    if (entry && !this.isExpired(entry)) {
      // Refresh insertion order so this entry is treated as most-recently-used.
      this.store.delete(cacheKey)
      this.store.set(cacheKey, entry)
      return entry.value
    }

    // Deduplicate concurrent requests for the same key.
    const pending = this.inflight.get(cacheKey)
    if (pending) {
      return pending
    }

    const request = this.fetcher(id).then(value => {
      this.store.set(cacheKey, {
        value,
        cachedAt: Date.now(),
        expiresAt: this.ttl !== null ? Date.now() + this.ttl : null,
      })
      this.evictIfNeeded()
      this.inflight.delete(cacheKey)
      return value
    }).catch(err => {
      // Don't cache failed responses; remove the in-flight entry so
      // the next caller can retry.
      this.inflight.delete(cacheKey)
      throw err
    })

    this.inflight.set(cacheKey, request)
    return request
  }

  /**
   * Return the cached value for `id` synchronously, or `undefined` if it is
   * absent or expired.
   */
  peek (id: K): T | undefined {
    const entry = this.store.get(this.serializeKey(id))
    if (!entry || this.isExpired(entry)) {
      return undefined
    }
    return entry.value
  }

  /**
   * Force-populate the cache for `id` with `value` without calling the
   * fetcher. Useful for seeding the cache from data you already have.
   */
  set (id: K, value: T): void {
    this.store.set(this.serializeKey(id), {
      value,
      cachedAt: Date.now(),
      expiresAt: this.ttl !== null ? Date.now() + this.ttl : null,
    })
    this.evictIfNeeded()
  }

  /**
   * Evict the cached entry for `id`. The next call to `get` will fetch fresh
   * data.
   */
  invalidate (id: K): void {
    this.store.delete(this.serializeKey(id))
  }

  /** Evict all cached entries. */
  clear (): void {
    this.store.clear()
  }

  /** Remove all entries that have passed their TTL. */
  prune (): void {
    for (const [cacheKey, entry] of this.store) {
      if (this.isExpired(entry)) {
        this.store.delete(cacheKey)
      }
    }
  }

  /** Number of (potentially stale) entries currently in the cache. */
  get size (): number {
    return this.store.size
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private isExpired (entry: CacheEntry<T>): boolean {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt
  }

  /**
   * If the store exceeds maxSize, evict the least-recently-used entries.
   * Map iteration order reflects insertion order, so the first key is the LRU.
   */
  private evictIfNeeded (): void {
    if (this.maxSize === null) {
      return
    }
    while (this.store.size > this.maxSize) {
      const lruKey = this.store.keys().next().value!
      this.store.delete(lruKey)
    }
  }
}
