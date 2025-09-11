<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableNews} -->
    <BaseTable
      ref="baseTable"
      :get-data="compProps.getData"
      :get-ids="compProps.getIds"
      :download="compProps.download"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      :display-type="compProps.displayType"
      supports-grid-cards
      item-key="newsId"
      table-key="news"
      header-icon="mdi-newspaper"
      :header-title="$t('pageNewsLatestNewsTitle')"
      v-bind="$attrs"
    >
      <template #header v-if="store.storeUserIsAuthenticated">
        <v-btn variant="outlined" :text="$t('buttonAddNews')" prepend-icon="mdi-plus" @click="addItem" />
      </template>

      <template #item.newstypeName="{ item }">
        <v-chip label :color="newsTypes[item.newstypeName].color()" :prepend-icon="newsTypes[item.newstypeName].path">{{ newsTypes[item.newstypeName].text() }}</v-chip>
      </template>

      <template #item.newsContent="{ item, value }">
        <template v-if="item.newsContent && item.newsContent.length > 0">
          <span class="news-content" :title="value" v-if="value" v-html="truncateAfterWords(value, 20)" />
          <a href="#" class="ms-2 table-icon-link" @click.prevent="showNewsContent(item)" v-if="isTruncatedAfterWords(value, 20)">
            <v-icon icon="mdi-page-next" />
          </a>
        </template>
      </template>

      <template #item.newsImage="{ item }">
        <v-img width="200" height="200" :cover="item.newsImageFit === 'cover'" :src="getSrc(item)" v-if="item.newsImage" />
        <TableCardNews width="200" height="200" class="g-svg align-self-center" v-else />
      </template>

      <template #item.newsHyperlink="{ value }">
        <v-btn :href="value" v-if="value" target="_blank" rel="noopener noreferrer" prepend-icon="mdi-open-in-new">{{ $t('buttonShow') }}</v-btn>
      </template>

      <template #card-item="{ item }">
        <v-card class="flex-grow-1 d-flex justify-space-between flex-column">
          <div class="d-flex flex-column">
            <v-img
              height="200"
              :cover="item.newsImageFit === 'cover'"
              :src="getSrc(item)"
              v-if="item.newsImage"
            />
            <TableCardNews class="g-svg align-self-center" width="200" height="200" v-else />
            <v-card-title>{{ item.newsTitle }}</v-card-title>
            <v-card-subtitle class="text-wrap" v-if="item.createdOn">{{ new Date(item.createdOn).toLocaleDateString() }}</v-card-subtitle>
            <v-card-text>
              <v-chip label :color="newsTypes[item.newstypeName].color()" :prepend-icon="newsTypes[item.newstypeName].path">{{ newsTypes[item.newstypeName].text() }}</v-chip>
            </v-card-text>
            <v-card-text class="text-wrap">
              <span class="g-trim-rows-5" v-html="item.newsContent" />
              <a href="#" class="table-icon-link" @click.prevent="showNewsContent(item)">
                <v-icon icon="mdi-page-next" />
              </a>
            </v-card-text>
          </div>

          <template #actions>
            <v-btn
              color="primary"
              v-if="item.newsHyperlink && !item.newsHyperlink.startsWith('#')"
              :href="item.newsHyperlink"
              target="_blank"
              rel="noopener noreferrer"
              :text="$t('buttonReadMore')"
            />

            <v-spacer />

            <v-btn
              v-if="store.storeUserIsDataCurator"
              @click="deleteNews(item)"
              color="error"
              :text="$t('buttonDelete')"
            />
          </template>
        </v-card>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableNews} -->
    <GenericAddEditFormModal
      title="modalTitleEditNews"
      :item="newNews"
      :notify="onSendNews"
      :fields="newsFields"
      @items-changed="baseTable?.refresh()"
      ref="newsModal"
    />
  </div>
</template>

<script setup lang="ts">
  import TableCardNews from '@/assets/img/table-card-news.svg'

  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, News, PaginatedRequest, PaginatedResult, ViewTableNews } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { newsTypeImageFit, newsTypes } from '@/plugins/util/types'
  import { getImageUrl } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { apiDeleteNews, apiPostNews } from '@/plugins/api/misc'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableNews[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
  }>()

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const newsModal = useTemplateRef('newsModal')
  const { t } = useI18n()
  const newNews = ref<News>({})

  const newsFields = computed(() => {
    return [{
      key: 'newstypeId',
      title: 'formLabelNewsType',
      type: 'select' as const,
      required: true,
      width: 1,
      selectOptions: Object.keys(newsTypes).map(nt => {
        return {
          value: newsTypes[nt].id,
          title: newsTypes[nt].text(),
        }
      }),
    }, {
      key: 'title',
      title: 'formLabelNewsTitle',
      type: 'text' as const,
      required: true,
      width: 1,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'createdOn',
      title: 'formLabelNewsDate',
      type: 'date' as const,
      required: false,
      width: 1,
    }, {
      key: 'hyperlink',
      title: 'formLabelNewsUrl',
      type: 'text' as const,
      inputType: 'url',
      required: false,
      width: 1,
    }, {
      key: 'image',
      title: 'formLabelNewsImage',
      type: 'file' as const,
      required: false,
      width: 1,
      visible: (item: News) => item.newstypeId === newsTypes.Projects.id,
      accepts: '.jpeg, .png, .jpg',
    }, {
      key: 'imageFit',
      title: 'formLabelNewsImageFit',
      type: 'select' as const,
      required: false,
      width: 1,
      visible: (item: News) => item.newstypeId === newsTypes.Projects.id,
      selectOptions: newsTypeImageFit.map(nt => {
        return {
          value: nt.value,
          title: nt.text(),
        }
      }),
    }, {
      key: 'content',
      title: 'formLabelNewsContent',
      type: 'textarea' as const,
      required: true,
      width: 2,
    }]
  })

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'newsId',
      title: t('tableColumnNewsId'),
      dataType: 'integer',
    }, {
      key: 'newstypeName',
      title: t('tableColumnNewsType'),
      dataType: 'newsType',
    }, {
      key: 'newsTitle',
      title: t('tableColumnNewsTitle'),
      dataType: 'string',
    }, {
      key: 'newsContent',
      title: t('tableColumnNewsContent'),
      dataType: 'string',
    }, {
      key: 'newsHyperlink',
      title: t('tableColumnNewsHyperlink'),
      dataType: 'string',
      value: (value: ViewTableNews) => (value.newsHyperlink && !value.newsHyperlink.startsWith('#')) ? value.newsHyperlink : undefined,
    }, {
      key: 'createdOn',
      dataType: 'date',
      title: t('tableColumnNewsCreatedOn'),
      value: (value: ViewTableNews) => value.createdOn ? new Date(value.createdOn).toLocaleDateString() : undefined,
    }, {
      key: 'newsImage',
      dataType: undefined,
      sortable: false,
      title: '',
    }]

    return headers
  })

  function deleteNews (item: ViewTableNews) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteNews(item.newsId || -1, result => {
            if (result) {
              baseTable.value?.refresh()
            }
          })
        }
      },
    })
  }

  function toBase64 (file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener('load', () => resolve(reader.result as string))
      reader.addEventListener('error', error => reject(error))
    })
  }

  function onSendNews (item: News) {
    return new Promise<boolean>(async resolve => {
      if (item.newstypeId !== newsTypes.Projects.id) {
        delete item.image
        delete item.imageFit
      } else if (item.image) {
        item.image = await toBase64(item.image as File)
      }

      apiPostNews(item, () => {
        resolve(true)
      })
    })
  }

  function getSrc (item: ViewTableNews) {
    return getImageUrl(item.newsImage || '', {
      name: item.newsImage,
      token: store.storeToken ? store.storeToken.imageToken : undefined,
      type: 'news',
      size: 'small',
    })
  }

  function showNewsContent (news: ViewTableNews) {
    emitter.emit('show-confirm', {
      title: t('tableColumnNewsContent'),
      message: news.newsContent,
      okTitle: t('genericOk'),
      cancelTitle: undefined,
      okOnly: true,
      okVariant: 'primary',
      width: 750,
    })
  }

  function addItem () {
    newNews.value = {}

    console.log(newsModal.value)

    nextTick(() => newsModal.value?.show())
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style>
.news-content ul,
.news-content ol {
  white-space: nowrap;
  display: inline;
  list-style-type: none;
}
</style>
