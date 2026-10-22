<template>
  <div>
    <ImageTable ref="imageTable" :get-data="getData" :header-icon-color="headerIconColor" :download="downloadImages" :filter-on="localFilterOn" @tag-clicked="tag => { selectedTag = tag }" @filter-changed="updateLocalSelection" @data-changed="(req: PaginatedRequest, res: PaginatedResult<ViewTableImages[]>) => emit('data-changed', req, res)">
      <template #header v-if="canCreateNew">
        <v-btn variant="outlined" :prepend-icon="mdiFilePlus" @click="bottomSheetVisible = true">{{ $t('tableButtonAddImages') }}</v-btn>
      </template>
      <template #card-text>
        <v-card-text>
          <ImageTags v-model="selectedTag" />
        </v-card-text>
      </template>
    </ImageTable>

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      max-height="75vh"
      v-if="canCreateNew"
    >
      <v-card
        :title="$t('modalTitleImageUpload')"
        class="pb-10"
      >
        <v-card-text>
          {{ $t('modalTextImageUpload') }}

          <ImageUpload
            :reference-table="referenceTable ?? ''"
            :foreign-id="foreignId ?? -1"
            @finished="update()"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
  import ImageTags from '@/components/widgets/ImageTags.vue'
  import { apiPostImages, apiPostImagesExport } from '@/plugins/api/image'
  import { FilterComparator, FilterOperator, type FilterGroup, type ImageTag, type PaginatedRequest, type PaginatedResult, type ViewTableImages } from '@/plugins/types/germinate'
  import { mdiFilePlus } from '@mdi/js'
  import type { AxiosResponse } from 'axios'
  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    headerIconColor?: string
    referenceTable?: string
    foreignId?: number
  }>()

  const store = useCoreStore()
  const emit = defineEmits(['data-changed'])

  const imageTable = useTemplateRef('imageTable')

  const selectedTag = ref<ImageTag>()
  const bottomSheetVisible = ref(false)

  const canCreateNew = computed(() => store.storeUserIsDataCurator && compProps.foreignId && compProps.referenceTable)

  const baseFilter = computed(() => {
    if (compProps.referenceTable && compProps.foreignId) {
      return [{
        filters: [{
          column: 'imageForeignId',
          comparator: FilterComparator.equals,
          values: [`${compProps.foreignId}`],
          canBeChanged: false,
        }, {
          column: 'imageRefTable',
          comparator: FilterComparator.equals,
          values: [compProps.referenceTable],
          canBeChanged: false,
        }],
        operator: FilterOperator.and,
      }]
    } else {
      return []
    }
  })

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

    if (baseFilter.value) {
      baseFilter.value.forEach(fg => {
        result.push(fg)
      })
    }

    if (result.length === 1 && result[0].filters?.length === 0) {
      return []
    } else {
      return result
    }
  })

  function update () {
    bottomSheetVisible.value = false
    imageTable.value?.refresh()
  }

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
