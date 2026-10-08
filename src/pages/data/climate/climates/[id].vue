<template>
  <v-container fluid v-if="climate">
    <Teleport to="#breadcrumb-last" defer>
      <v-chip label :color="dataTypes[climate.dataType].color()" :prepend-icon="dataTypes[climate.dataType].path" :text="dataTypes[climate.dataType].text()" />
    </Teleport>

    <ClimateDetails :climate="climate" />
  </v-container>
</template>

<route lang="yaml">
name: climateDetails
</route>

<script setup lang="ts">
  import { apiPostClimateTable } from '@/plugins/api/climate'
  import { useBreadcrumbTitle } from '@/plugins/composables/breadcrumbs'
  import { FilterComparator, FilterOperator, type ViewTableClimates } from '@/plugins/types/germinate'
  import { dataTypes } from '@/plugins/util/types'

  const route = useRoute('climateDetails')

  const climate = ref<ViewTableClimates>()
  const climateId = ref<number>()

  useBreadcrumbTitle(() => climate.value?.climateName)

  onMounted(() => {
    if (route && route.params && route.params.id) {
      climateId.value = +route.params.id

      apiPostClimateTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'climateId',
            comparator: FilterComparator.equals,
            values: [`${climateId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          climate.value = result.data[0]
        }
      })
    }
  })
</script>
