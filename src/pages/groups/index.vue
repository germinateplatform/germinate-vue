<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageGroupsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageGroupsText')" />

    <v-btn-toggle
      v-model="selectedGroupType"
      class="mb-3"
      variant="tonal"
    >
      <v-btn value="germinatebase" :color="groupTypes.germinatebase.color()" :text="groupTypes.germinatebase.text()">
        <template #prepend>
          <v-icon :icon="groupTypes.germinatebase.path" :color="groupTypes.germinatebase.color()" />
        </template>
      </v-btn>
      <v-btn value="markers" :color="groupTypes.markers.color()" :text="groupTypes.markers.text()">
        <template #prepend>
          <v-icon :icon="groupTypes.markers.path" :color="groupTypes.markers.color()" />
        </template>
      </v-btn>
      <v-btn value="locations" :color="groupTypes.locations.color()" :text="groupTypes.locations.text()">
        <template #prepend>
          <v-icon :icon="groupTypes.locations.path" :color="groupTypes.locations.color()" />
        </template>
      </v-btn>
    </v-btn-toggle>

    <GroupTable :get-data="getData" :filter-on="filterOn" />
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostGroupTable } from '@/plugins/api/group'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import { groupTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'

  const store = coreStore()

  const selectedGroupType = ref<string>()

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
        values: [selectedGroupType.value],
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
