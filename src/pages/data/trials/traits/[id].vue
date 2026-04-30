<template>
  <v-container fluid v-if="variable">
    <h1 class="text-headline-large my-3 ">{{ variable.variableName }}</h1>
    <v-divider class="mb-3" />

    <TraitDetails :variable="variable" />
  </v-container>
</template>

<script setup lang="ts">
  import TraitDetails from '@/components/trials/TraitDetails.vue'
  import { apiPostTraitTable } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type ViewTableTraits } from '@/plugins/types/germinate'

  const route = useRoute('/data/trials/traits/[id]')

  const variable = ref<ViewTableTraits>()
  const traitId = ref<number>()

  onMounted(() => {
    if (route && route.params && route.params.id) {
      traitId.value = +route.params.id

      apiPostTraitTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'traitId',
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
