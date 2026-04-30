<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageImagesTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageImagesText')" />

    <v-row>
      <v-col>
        <TraitClassSelector v-model="selectedTraitClasses" />
      </v-col>
      <v-col>
        <MethodClassSelector v-model="selectedMethodClasses" />
      </v-col>
      <v-col>
        <ScaleDataTypeSelector v-model="selectedScaleDataTypes" />
      </v-col>
    </v-row>

    <TraitTable class="mt-5" :get-data="getData" :filter-on="localFilterOn" @filter-changed="updateLocalSelection" />
  </v-container>
</template>

<script setup lang="ts">
  import TraitTable from '@/components/tables/TraitTable.vue'
  import { apiPostTraitTable } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'

  const selectedMethodClasses = ref<string[]>([])
  const selectedScaleDataTypes = ref<string[]>([])
  const selectedTraitClasses = ref<string[]>([])

  const localFilterOn: ComputedRef<FilterGroup[]> = computed(() => {
    const result: FilterGroup[] = [{
      filters: [],
      operator: FilterOperator.and,
    }]

    if (selectedMethodClasses.value && selectedMethodClasses.value.length > 0) {
      result[0].filters?.push({
        column: 'methodClass',
        comparator: FilterComparator.inSet,
        values: selectedMethodClasses.value.concat(),
      })
    }

    if (selectedScaleDataTypes.value && selectedScaleDataTypes.value.length > 0) {
      result[0].filters?.push({
        column: 'scaleDatatype',
        comparator: FilterComparator.inSet,
        values: selectedScaleDataTypes.value.concat(),
      })
    }

    if (selectedTraitClasses.value && selectedTraitClasses.value.length > 0) {
      result[0].filters?.push({
        column: 'traitClass',
        comparator: FilterComparator.inSet,
        values: selectedTraitClasses.value.concat(),
      })
    }

    if (result.length === 1 && result[0].filters?.length === 0) {
      return []
    } else {
      return result
    }
  })

  function updateLocalSelection (filters: FilterGroup[] | undefined) {
    if (!filters || filters.length === 0) {
      if (selectedMethodClasses.value.length > 0) {
        selectedMethodClasses.value = []
      }
      if (selectedTraitClasses.value.length > 0) {
        selectedTraitClasses.value = []
      }
    }
  }

  function getData (data: PaginatedRequest) {
    return apiPostTraitTable(data)
  }
</script>
