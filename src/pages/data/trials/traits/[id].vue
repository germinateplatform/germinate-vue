<template>
  <v-container fluid v-if="variable">
    <TraitDetails :variable="variable" />
  </v-container>
</template>

<route lang="yaml">
name: traitDetails
</route>

<script setup lang="ts">
  import TraitDetails from '@/components/trials/TraitDetails.vue'
  import { apiPostTraitTable } from '@/plugins/api/trait'
  import { useBreadcrumbTitle } from '@/plugins/composables/breadcrumbs'
  import { FilterComparator, FilterOperator, type ViewTableTraits } from '@/plugins/types/germinate'

  const route = useRoute('traitDetails')

  const variable = ref<ViewTableTraits>()
  const traitId = ref<number>()

  useBreadcrumbTitle(() => variable.value?.variableName)

  onMounted(() => {
    if (route && route.params && route.params.id) {
      traitId.value = +route.params.id

      apiPostTraitTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'variableId',
            comparator: FilterComparator.equals,
            values: [`${traitId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          variable.value = result.data[0]
        }
      })
    }
  })
</script>
