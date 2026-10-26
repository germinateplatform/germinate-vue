<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableImages} -->
    <BaseTable
      ref="baseTable"
      class="image-table"
      v-model:bottom-sheet-visible="bottomVisible"
      v-model:bottom-sheet-persistent="bottomPersistent"
      :get-data="compProps.getData"
      :get-ids="compProps.getIds"
      :download="compProps.download"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      item-key="imageId"
      table-key="images"
      :display-type="compProps.displayType"
      :header-icon="mdiImageMultiple"
      :header-title="$t('pageImagesTitle')"
      :supports-grid-cards="true"
      v-bind="$attrs"
    >
      <!-- Reference table -->
      <template #item.imageRefTable="{ item }">
        <v-chip label :color="imageTypes[item.imageRefTable].color()" :prepend-icon="imageTypes[item.imageRefTable].path">{{ $t(imageTypes[item.imageRefTable].text) }}</v-chip>
      </template>

      <!-- Show whether it's a trait reference image. -->
      <template #item.imageIsReference="{ item }">
        <v-icon :icon="mdiBookInformationVariant" color="primary" v-tooltip:top="$t('tableTooltipImagesIsReference')" v-if="item.imageIsReference === true" />
        <v-icon :icon="mdiBookInformationVariant" color="muted" v-else />
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
          <v-btn @click="showExif(item)" :prepend-icon="mdiImageText" :text="$t('buttonShow')" />
        </template>
      </template>

      <template #item.image="{ item }">
        <v-img width="200" height="200" cover :src="getSrc(item, 'small')" @click="showImage(item)" />
      </template>

      <template #item.actions="{ item }">
        <v-btn-group variant="tonal">
          <v-btn size="x-small" color="primary" :icon="mdiSquareEditOutline" v-tooltip:top="$t('tableTooltipImageEdit')" @click="editImage(item)" />
          <v-btn size="x-small" color="error" :icon="mdiDelete" v-tooltip:top="$t('tableTooltipImageDelete')" @click="deleteImage(item)" />
        </v-btn-group>
      </template>

      <template #card-item="{ item }">
        <v-card class="flex-grow-1">
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
            <v-chip label :color="imageTypes[item.imageRefTable].color()" :prepend-icon="imageTypes[item.imageRefTable].path">{{ $t(imageTypes[item.imageRefTable].text) }}</v-chip>
          </v-card-text>
          <v-card-text class="text-wrap">{{ item.imageDescription }}</v-card-text>

          <v-card-text v-if="item.tags">
            <v-chip label variant="flat" size="small" v-for="(tag, index) in item.tags" :key="`image-tag-${item.imageId}-${index}`" class="me-2 mb-1" href="#" @click.prevent="emit('tag-clicked', tag)" :color="getTagColor(tag)" :text="tag.tagName" />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" :prepend-icon="mdiSquareEditOutline" :text="$t('tableTooltipImageEdit')" @click="editImage(item)" />
            <v-btn color="error" :prepend-icon="mdiDelete" :text="$t('tableTooltipImageDelete')" @click="deleteImage(item)" />
          </v-card-actions>
        </v-card>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>

      <template #bottom-sheet-content v-if="selectedImage">
        <ExifInfo :image="selectedImage" v-if="bottomSheetType === 'exif'" />
        <div v-else>
          <v-card-title class="mx-0 px-0 d-flex justify-space-between align-center">
            <span>{{ $t('pageImagesTitleEdit') }}</span>
            <div class="d-flex ga-2">
              <v-btn @click="bottomVisible = false" :prepend-icon="mdiClose" :text="$t('buttonClose')" />
              <v-btn @click="saveImageChanges" :prepend-icon="mdiContentSave" :text="$t('buttonSave')" color="primary" />
            </div>
          </v-card-title>
          <v-textarea
            :label="$t('tableColumnImageDescription')"
            hide-details
            v-model="selectedImage.imageDescription"
          />

          <v-switch
            :label="$t('tableColumnImageIsReference')"
            hide-details
            v-model="selectedImage.imageIsReference"
            color="primary"
          />

          <TagInput
            :label="$t('tableColumnImageTags')"
            hide-details
            v-model="selectedImage.tags"
          />
        </div>
      </template>
    </BaseTable>

    <v-overlay class="align-center justify-center image-wrapper" v-model="lightboxVisible">
      <v-img :src="getSrc(selectedImage, 'large')" contain v-if="selectedImage" @click="lightboxVisible = false" />
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, ImageTag, PaginatedRequest, PaginatedResult, ViewTableImages } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { imageTypes } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'
  import { getTemplateColor } from '@/plugins/util/colors'
  import ExifInfo from '@/components/widgets/ExifInfo.vue'
  import { getImageUrl } from '@/plugins/util/image'
  import { mdiBookInformationVariant, mdiClose, mdiContentSave, mdiDelete, mdiImageMultiple, mdiImageText, mdiSquareEditOutline } from '@mdi/js'
  import { apiDeleteImage, apiPatchImage, apiPatchImageTags } from '@/plugins/api/image'
  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableImages[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
  }>()

  const store = useCoreStore()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const selectedImage = ref<ViewTableImages>()
  const bottomVisible = ref(false)
  const bottomPersistent = ref(false)
  const lightboxVisible = ref(false)

  const bottomSheetType = ref<'exif' | 'edit'>()

  const tags: { [key: number]: string } = {}

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
      quickSearchable: true,
    }, {
      key: 'imageForeignId',
      dataType: 'integer',
      visibleInTable: false,
      title: t('tableColumnImageForeignId'),
      visibleInFilter: true,
    }, {
      key: 'imageRefTable',
      dataType: 'string',
      title: t('tableColumnImageReferenceTable'),
      quickSearchable: true,
    }, {
      key: 'imageDescription',
      dataType: 'string',
      title: t('tableColumnImageDescription'),
      quickSearchable: true,
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
      quickSearchable: true,
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

    if (store.storeUserIsDataCurator) {
      headers.push({
        key: 'actions',
        dataType: undefined,
        sortable: false,
        title: '',
      })
    }

    return headers
  })

  function deleteImage (image: ViewTableImages) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteImage(image.imageId, () => {
            baseTable.value?.refresh()
          })
        }
      },
    })
  }

  async function saveImageChanges () {
    if (!selectedImage.value) {
      return
    }

    await Promise.all([
      apiPatchImage(selectedImage.value),
      apiPatchImageTags(selectedImage.value.imageId, selectedImage.value.tags),
    ])
      .then(() => {
        baseTable.value?.refresh()
      })
      .finally(() => {
        bottomVisible.value = false
      })
  }

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

  function editImage (item: ViewTableImages) {
    selectedImage.value = { ...item }
    bottomSheetType.value = 'edit'
    bottomPersistent.value = true

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  function showExif (item: ViewTableImages) {
    selectedImage.value = item
    bottomSheetType.value = 'exif'
    bottomPersistent.value = false

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  function getTagColor (tag: ImageTag) {
    if (!tags[tag.tagId]) {
      tags[tag.tagId] = getTemplateColor(Object.keys(tags).length)
    }
    return tags[tag.tagId]
  }

  const emit = defineEmits(['tag-clicked'])

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
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
