<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageImagesTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageImagesText')" />

    <ImageTags v-model="selectedTag" />

    <ImageTable :get-data="getData" :filter-on="filterOn" @tag-clicked="tag => { selectedTag = tag }" @filter-changed="updateLocalSelection" />
  </v-container>
</template>

<script setup lang="ts">
  import ImageTags from '@/components/widgets/ImageTags.vue'
  import { apiPostImages } from '@/plugins/api/misc'
  import { FilterComparator, FilterOperator, type FilterGroup, type ImageTag, type PaginatedRequest } from '@/plugins/types/germinate'

  const selectedTag = ref<ImageTag>()

  const filterOn: ComputedRef<FilterGroup[]> = computed(() => {
    if (selectedTag.value) {
      return [{
        filters: [{
          column: 'tags',
          comparator: FilterComparator.contains,
          values: [selectedTag.value.tagName]
        }],
        operator: FilterOperator.and,
      }]
    } else {
      return []
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
