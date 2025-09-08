<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageGroupsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageGroupsText')" />

    <GroupTable :get-data="getData" :filter-on="filterOn" />
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostGroupTable } from '@/plugins/api/group'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import type { GroupType } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'

  const store = coreStore()

  const selectedGroupType = ref<GroupType>()

  const filterOn: ComputedRef<FilterGroup[]> = computed(() => {
    const filter = []
    if (store.storeSelectedProjects && store.storeSelectedProjects.length > 0) {
      filter.push({
        column: 'projectIds',
        comparator: FilterComparator.arrayContains,
        values: store.storeSelectedProjects.map(n => `${n}`),
        canBeChanged: false,
      })
    }
    if (selectedGroupType.value) {
      filter.push({
        column: 'groupType',
        comparator: FilterComparator.equals,
        values: [selectedGroupType.value.id],
        canBeChanged: false,
      })
    }
    return filter.length > 0
      ? [{
        filters: filter,
        operator: FilterOperator.and,
      }]
      : []
  })

  function getData (data: PaginatedRequest) {
    return apiPostGroupTable(data)
  }
</script>
