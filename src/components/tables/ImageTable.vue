<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableImages} -->
  <BaseTable
    ref="baseTable"
    class="image-table"
    v-model:bottom-sheet-visible="bottomVisible"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    item-key="imageId"
    table-key="images"
    header-icon="mdi-image-multiple"
    :header-title="$t('pageImagesTitle')"
    :supports-grid-cards="true"
    v-bind="$attrs"
  >
    <!-- Reference table -->
    <template #item.imageRefTable="{ item }">
      <v-chip label :color="imageTypes[item.imageRefTable].color()" :prepend-icon="imageTypes[item.imageRefTable].path">{{ imageTypes[item.imageRefTable].text() }}</v-chip>
    </template>

    <!-- Show whether it's a trait reference image. -->
    <template #item.imageIsReference="{ item }">
      <v-icon icon="mdi-book-information-variant" color="primary" v-tooltip:top="$t('tableTooltipImagesIsReference')" v-if="item.imageIsReference === true" />
      <v-icon icon="mdi-book-information-variant" color="muted" v-else />
    </template>

    <!-- Reference name -->
    <template #item.referenceName="{ item }">
      <!-- Germplasm -->
      <router-link :to="Pages.getPath(Pages.passport, item.imageForeignId)" v-if="item.imageRefTable === 'germinatebase'">{{ item.referenceName }}</router-link>
      <!-- Trait -->
      <router-link :to="Pages.getPath(Pages.traitDetails, item.imageForeignId)" v-else-if="item.imageRefTable === 'phenotypes'">{{ item.referenceName }}</router-link>
      <!-- Anything else -->
      <span v-else>{{ item.referenceName }}</span>
    </template>

    <!-- Tags -->
    <template #item.tags="{ item }">
      <div v-if="item.tags">
        <v-chip label variant="flat" size="small" v-for="(tag, index) in item.tags" :key="`image-tag-${item.imageId}-${index}`" class="me-2 mt-1" href="#" @click.prevent="emit('tag-clicked', tag)" :color="getTagColor(tag)" :text="tag.tagName" />
      </div>
    </template>

    <!-- EXIF -->
    <template #item.imageExif="{ item }">
      <template v-if="item.imageExif && Object.keys(item.imageExif).length > 0">
        <v-btn @click="showExif(item)" prepend-icon="mdi-image-text" :text="$t('buttonShow')" />
      </template>
    </template>

    <template #item.image="{ item }">
      <v-img width="200" height="200" cover :src="getSrc(item, 'small')" @click="showImage(item)" />
    </template>

    <template #card-item="{ item }">
      <v-card>
        <v-img height="200" cover :src="getSrc(item, 'small')" @click="showImage(item)" />
        <v-card-title>
          <!-- Germplasm -->
          <router-link :to="Pages.getPath(Pages.passport, item.imageForeignId)" v-if="item.imageRefTable === 'germinatebase'">{{ item.referenceName }}</router-link>
          <!-- Trait -->
          <router-link :to="Pages.getPath(Pages.traitDetails, item.imageForeignId)" v-else-if="item.imageRefTable === 'phenotypes'">{{ item.referenceName }}</router-link>
          <!-- Anything else -->
          <span v-else>{{ item.referenceName }}</span>
        </v-card-title>
        <v-card-subtitle class="text-wrap" v-if="item.createdOn">{{ new Date(item.createdOn).toLocaleDateString() }}</v-card-subtitle>
        <v-card-text>
          <v-chip label :color="imageTypes[item.imageRefTable].color()" :prepend-icon="imageTypes[item.imageRefTable].path">{{ imageTypes[item.imageRefTable].text() }}</v-chip>
        </v-card-text>
        <v-card-text class="text-wrap">{{ item.imageDescription }}</v-card-text>

        <v-card-text v-if="item.tags">
          <v-chip label variant="flat" size="small" v-for="(tag, index) in item.tags" :key="`image-tag-${item.imageId}-${index}`" class="me-2 mb-1" href="#" @click.prevent="emit('tag-clicked', tag)" :color="getTagColor(tag)" :text="tag.tagName" />
        </v-card-text>
      </v-card>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>

    <template #bottom-sheet-content>
      <ExifInfo :image="selectedImage" />
    </template>
  </BaseTable>

  <v-overlay class="align-center justify-center image-wrapper" v-model="lightboxVisible">
    <v-img :src="getSrc(selectedImage, 'large')" contain v-if="selectedImage" @click="lightboxVisible = false" />
  </v-overlay>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, ImageTag, PaginatedRequest, PaginatedResult, ViewTableImages } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { imageTypes } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'
  import { getTemplateColor } from '@/plugins/util/colors'
  import ExifInfo from '@/components/widgets/ExifInfo.vue'
  import { getImageUrl } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableImages[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const selectedImage = ref<ViewTableImages>()
  const bottomVisible = ref(false)
  const lightboxVisible = ref(false)

  const tags: string[] = []

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers: ExtendedDataTableHeader[] = [{
      key: 'imageId',
      dataType: 'integer',
      title: t('tableColumnImageId'),
    }, {
      key: 'referenceName',
      dataType: 'string',
      title: t('tableColumnImageReferenceName'),
    }, {
      key: 'imageRefTable',
      dataType: 'string',
      title: t('tableColumnImageReferenceTable'),
    }, {
      key: 'imageDescription',
      dataType: 'string',
      title: t('tableColumnImageDescription'),
    }, {
      key: 'imageIsReference',
      dataType: 'boolean',
      title: t('tableColumnImageIsReference'),
    }, {
      key: 'imagePath',
      dataType: 'string',
      title: t('tableColumnImagePath'),
    }, {
      key: 'imageExif',
      dataType: 'json',
      sortable: false,
      title: t('tableColumnImageExif'),
    }, {
      key: 'tags',
      dataType: 'json',
      sortable: false,
      title: t('tableColumnImageTags'),
    }, {
      key: 'createdOn',
      dataType: 'date',
      title: t('tableColumnImageCreatedOn'),
      // @ts-ignore
      value: (item: ViewTableImages) => item.createdOn ? new Date(item.createdOn).toLocaleDateString() : undefined,
    }, {
      key: 'image',
      dataType: undefined,
      sortable: false,
      title: '',
    }]

    return headers
  })

  function getSrc (image: ViewTableImages, size: string) {
    return getImageUrl(image.imagePath, {
      name: image.imagePath,
      type: 'database',
      size: size,
      token: store.storeToken ? store.storeToken.imageToken : '',
    })
  }

  function showImage (item: ViewTableImages) {
    selectedImage.value = item

    nextTick(() => {
      lightboxVisible.value = true
    })
  }

  function showExif (item: ViewTableImages) {
    selectedImage.value = item

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  function getTagColor (tag: ImageTag) {
    let index = tags.indexOf(tag.tagName)
    if (index === -1) {
      tags.push(tag.tagName)
      index = tags.length
    }

    return getTemplateColor(index)
  }

  const emit = defineEmits(['tag-clicked'])

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style>
.image-table img:hover,
.image-wrapper img {
  cursor: pointer;
}
.image-wrapper img {
  max-height: 100vh;
  max-width: 100vw;
  position: relative;
}
</style>
