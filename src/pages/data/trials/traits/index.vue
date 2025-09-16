<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageImagesTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageImagesText')" />

    <TraitTable :get-data="getData" @category-clicked="(category: Phenotypecategories) => { selectedCategory = category }" :filter-on="localFilterOn" @filter-changed="updateLocalSelection">
      <template #card-text>
        <v-card-text>
          <TraitCategories v-model="selectedCategory" />
        </v-card-text>
      </template>
    </TraitTable>
  </v-container>
</template>

<script setup lang="ts">
  import TraitTable from '@/components/tables/TraitTable.vue'
  import TraitCategories from '@/components/widgets/TraitCategories.vue'
  import { apiPostTraitTable } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type Phenotypecategories } from '@/plugins/types/germinate'

  const selectedCategory = ref<Phenotypecategories>()

  const localFilterOn: ComputedRef<FilterGroup[]> = computed(() => {
    const result: FilterGroup[] = [{
      filters: [],
      operator: FilterOperator.and,
    }]

    if (selectedCategory.value) {
      result[0].filters?.push({
        column: 'categoryId',
        comparator: FilterComparator.equals,
        values: [`${selectedCategory.value.id}`],
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
      selectedCategory.value = undefined
    }
  }

  function getData (data: PaginatedRequest) {
    return apiPostTraitTable(data)
  }
</script>
