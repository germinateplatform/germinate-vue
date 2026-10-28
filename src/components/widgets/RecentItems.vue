<template>
  <div class="mb-5" v-if="ordered.length > 0">
    <h4 class="mb-0">{{ $t('widgetRecentItemsTitle') }}</h4>

    <div class="d-flex justify-space-between align-center">
      <div class="d-flex flex-wrap" style="gap: 8px;">
        <v-chip
          v-for="item in ordered"
          :key="`recent-item-${itemType}-${item.id}`"
          label
          :prepend-icon="item.icon"
          :text="item.name"
          :color="item.color"
          variant="tonal"
          :to="typeConfig.page ? Pages.getPath(typeConfig.page, `${item.id}`) : undefined"
          closable
          @click:close="removeItem(item.id)"
        />
      </div>
      <v-chip
        :prepend-icon="mdiDelete"
        label
        variant="tonal"
        :text="$t('widgetRecentItemsClear')"
        @click="clearItems()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { apiPostMarkerTable } from '@/plugins/api/genotype'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { apiPostLocationTable } from '@/plugins/api/location'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type MarkedItemType, type PaginatedRequest } from '@/plugins/types/germinate'
  import type { Page } from '@/plugins/types/Page'
  import { entityTypes } from '@/plugins/util/types'
  import { mdiDelete, mdiLabelVariant, mdiMapMarker } from '@mdi/js'

  const compProps = defineProps<{
    itemType: MarkedItemType
  }>()

  const store = useCoreStore()

  interface Item {
    id: number
    name: string
    icon?: string
    color?: string
  }

  // id -> item, filled incrementally
  const cache = reactive(new Map<number, Item>())
  // ids already requested (prevents duplicate in-flight requests and
  // endless refetching of ids the server doesn't return)
  const requested = new Set<number>()

  // Derived from the ids + cache: removals update instantly, no fetch needed.
  // Newest id first (same order as your previous sort). Doesn't mutate anything.
  const ordered = computed(() => {
    return [...typeConfig.value.recentIds]
      .reverse()
      .map(id => cache.get(id))
      .filter((i): i is Item => !!i)
  })

  interface TypeConfig {
    recentIds: number[]
    filterColumn: string
    page?: Page
  }

  const typeConfig: ComputedRef<TypeConfig> = computed(() => {
    switch (compProps.itemType) {
      case 'germplasm':
        return {
          recentIds: store.storeRecentGermplasm,
          filterColumn: 'germplasmId',
          page: Pages.passport,
        }
      case 'markers':
        return {
          recentIds: store.storeRecentMarkers,
          filterColumn: 'markerId',
          page: Pages.markerDetails,
        }
      case 'locations':
        return {
          recentIds: store.storeRecentLocations,
          filterColumn: 'locationId',
        }
    }
  })

  watch(() => typeConfig.value.recentIds, ids => {
    loadMissing(ids)

    const keep = new Set(ids)
    for (const id of cache.keys()) {
      if (!keep.has(id)) {
        cache.delete(id)
        requested.delete(id)
      }
    }
  }, { immediate: true, deep: true })

  // if the same component instance can switch type, reset the cache
  watch(() => compProps.itemType, () => {
    cache.clear()
    requested.clear()
  }, { flush: 'pre' })

  function removeItem (id: number) {
    store.removeRecentId(compProps.itemType, id)
  }

  function clearItems () {
    store.clearRecentIds(compProps.itemType)
  }

  function loadMissing (ids: number[]) {
    const missing = ids.filter(id => !cache.has(id) && !requested.has(id))

    // nothing new (e.g. an id was removed) -> no server call
    if (missing.length === 0) {
      return
    }

    missing.forEach(id => requested.add(id))

    const filter: PaginatedRequest = {
      page: 1,
      limit: missing.length,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: typeConfig.value.filterColumn,
          comparator: FilterComparator.inSet,
          values: missing.map(String),
        }],
      }],
    }

    fetchItems(filter, loaded => loaded.forEach(i => cache.set(i.id, i)))
  }

  function fetchItems (filter: PaginatedRequest, cb: (items: Item[]) => void) {
    switch (compProps.itemType) {
      case 'germplasm':
        apiPostGermplasmTable(filter, result => cb((result?.data ?? []).map(g => ({
          id: g.germplasmId,
          name: g.germplasmDisplayName ?? g.germplasmName,
          icon: entityTypes[g.entityTypeName || 'Accession'].path,
          color: entityTypes[g.entityTypeName || 'Accession'].color(),
        }))))
        break
      case 'markers':
        apiPostMarkerTable(filter, result => cb((result?.data ?? []).map(m => ({
          id: m.markerId,
          name: m.markerName,
          icon: mdiLabelVariant,
        }))))
        break
      case 'locations':
        apiPostLocationTable(filter, result => cb((result?.data ?? []).map(l => ({
          id: l.locationId,
          name: l.locationName,
          icon: mdiMapMarker,
        }))))
        break
    }
  }
</script>
