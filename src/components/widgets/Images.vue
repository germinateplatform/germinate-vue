<template>
  <div>
    <ImageTags v-model="selectedTag" />

    <ImageTable :get-data="getData" :filter-on="localFilterOn" @tag-clicked="tag => { selectedTag = tag }" @filter-changed="updateLocalSelection" />
  </div>
</template>

<script setup lang="ts">
  import ImageTags from '@/components/widgets/ImageTags.vue'
  import { apiPostImages } from '@/plugins/api/misc'
  import { FilterComparator, FilterOperator, type FilterGroup, type ImageTag, type PaginatedRequest } from '@/plugins/types/germinate'

  const compProps = defineProps<{
    filterOn?: FilterGroup[]
  }>()

  const selectedTag = ref<ImageTag>()

  const localFilterOn: ComputedRef<FilterGroup[]> = computed(() => {
    const result: FilterGroup[] = [{
      filters: [],
      operator: FilterOperator.and,
    }]

    if (selectedTag.value) {
      result[0].filters?.push({
        column: 'tags',
        comparator: FilterComparator.contains,
        values: [selectedTag.value.tagName],
      })
    }

    if (compProps.filterOn) {
      compProps.filterOn.forEach(fg => {
        result.push(fg)
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
      selectedTag.value = undefined
    }
  }

  function getData (data: PaginatedRequest) {
    return apiPostImages(data)
  }
</script>
