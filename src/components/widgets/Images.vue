<template>
  <div>
    <ImageTable :get-data="getData" :header-icon-color="headerIconColor" :download="downloadImages" :filter-on="localFilterOn" @tag-clicked="tag => { selectedTag = tag }" @filter-changed="updateLocalSelection" @data-changed="(req: PaginatedRequest, res: PaginatedResult<ViewTableImages[]>) => emit('data-changed', req, res)">
      <template #card-text>
        <v-card-text>
          <ImageTags v-model="selectedTag" />
        </v-card-text>
      </template>
    </ImageTable>
  </div>
</template>

<script setup lang="ts">
  import ImageTags from '@/components/widgets/ImageTags.vue'
  import { apiPostImages, apiPostImagesExport } from '@/plugins/api/image'
  import { FilterComparator, FilterOperator, type FilterGroup, type ImageTag, type PaginatedRequest, type PaginatedResult, type ViewTableImages } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import type { AxiosResponse } from 'axios'
  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    filterOn?: FilterGroup[]
    headerIconColor?: string
  }>()

  const store = coreStore()
  const emit = defineEmits(['data-changed'])

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

  function downloadImages (request: PaginatedRequest) {
    emitter.emit('show-loading', true)

    return new Promise<AxiosResponse<Blob>>((resolve, reject) => {
      apiPostImagesExport(request, result => {
        store.addAsyncJobUuids(result.map(r => r.uuid))

        // Show the sidebar
        emitter.emit('toggle-aside', 'download')
        emitter.emit('show-loading', false)
      }).finally(() => reject())
    })
  }

  function getData (data: PaginatedRequest) {
    return apiPostImages(data)
  }
</script>
