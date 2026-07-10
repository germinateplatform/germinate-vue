<template>
  <v-container fluid v-if="climate">
    <h1 class="text-headline-large my-3 ">{{ climate.climateName }}</h1>
    <v-divider class="mb-3" />

    <ClimateDetails :climate="climate" />
  </v-container>
</template>

<route lang="yaml">
name: climateDetails
</route>

<script setup lang="ts">
  import { apiPostClimateTable } from '@/plugins/api/climate'
  import { FilterComparator, FilterOperator, type ViewTableClimates } from '@/plugins/types/germinate'

  const route = useRoute('climateDetails')

  const climate = ref<ViewTableClimates>()
  const climateId = ref<number>()

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
