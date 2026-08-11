<template>
  <div>
    <v-row>
      <!-- @vue-ignore -->
      <v-col
        v-for="item in items"
        :key="`item-${item[itemValue]}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <!-- @vue-ignore -->
        <slot name="card-item" v-bind="{ item, isSelected: selectedIds.has(itemId ? itemId(item) : item[itemKey]), toggleItem }" />
      </v-col>
    </v-row>

    <div class="v-data-table-footer d-flex justify-end flex-wrap" v-if="!compProps.hideFooter">
      <slot name="footer.prepend" />
      <v-spacer />
      <div class="d-flex align-center g-items-per-page">
        <div class="pe-2">{{ t('$vuetify.dataFooter.itemsPerPageText') }}</div>
        <v-select
          :items="perPageOptions"
          v-model="localItemsPerPage"
          hide-details
          variant="outlined"
          density="compact"
          class="flex-shrink-0"
        />
      </div>
      <div class="v-data-table-footer__info">
        {{ t('$vuetify.dataFooter.pageText', !itemsLength ? 0 : startIndex + 1, stopIndex, itemsLength) }}
      </div>
      <v-pagination v-model="localPage" :length="totalPages" :total-visible="0" show-first-last-page />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
  import { useLocale, type DataTableSortItem } from 'vuetify'

  const compProps = defineProps<{
    itemsPerPage: number
    page: number
    itemId?: (item: T) => string
    itemKey: string
    sortBy: DataTableSortItem[] | undefined
    // Other things
    items: T[]
    itemsLength: number
    loading: boolean
    itemValue: string
    search: string
    hideFooter?: boolean
  }>()

  const emit = defineEmits([
    'update:page',
    'update:items-per-page',
    'update:options',
  ])

  const model = defineModel<number[]>({
    default: () => [],
  })

  const selectedIds = computed(() => {
    let ids = new Set<number>()
    if (model.value) {
      ids = new Set(model.value)
    }
    return ids
  })

  const { t } = useLocale()
  const localPage = ref(1)
  const localItemsPerPage = ref(12)

  const totalPages = computed(() => Math.ceil(compProps.itemsLength / compProps.itemsPerPage))
  const perPageOptions = computed(() => {
    return [
      { value: 12, title: '12' },
      { value: 24, title: '24' },
      { value: 48, title: '48' },
      { value: 96, title: '96' },
    ]
  })
  const startIndex = computed(() => (localPage.value - 1) * localItemsPerPage.value)
  const stopIndex = computed(() => Math.min(startIndex.value + localItemsPerPage.value, compProps.itemsLength))

  function toggleItem (item: T) {
    // @ts-expect-error
    const id = item ? (compProps.itemId ? compProps.itemId(item) : item[compProps.itemKey]) : undefined

    if (id === undefined) {
      return
    }

    if (selectedIds.value.has(id)) {
      model.value = model.value.filter(mv => mv !== id)
    } else {
      model.value = [...model.value, id]
    }
  }

  watch(() => compProps.page, async (newValue: number) => {
    localPage.value = newValue
  })
  watch(() => compProps.itemsPerPage, async (newValue: number) => {
    localItemsPerPage.value = newValue
  })
  watch(() => compProps.search, async () => {
    localPage.value = 1
    emit('update:options', {
      page: localPage.value,
      itemsPerPage: localItemsPerPage.value,
      sortBy: compProps.sortBy,
    })
  })
  watch(localPage, async (newValue: number) => {
    emit('update:page', newValue)
    emit('update:options', {
      page: newValue,
      itemsPerPage: localItemsPerPage.value,
      sortBy: compProps.sortBy,
    })
  })
  watch(localItemsPerPage, async (newValue: number) => {
    emit('update:items-per-page', newValue)
    emit('update:options', {
      page: localPage.value,
      itemsPerPage: newValue,
      sortBy: compProps.sortBy,
    })
  })

  onMounted(() => {
    localPage.value = compProps.page
    localItemsPerPage.value = compProps.itemsPerPage

    emit('update:options', {
      page: localPage.value,
      itemsPerPage: localItemsPerPage.value,
      sortBy: compProps.sortBy,
    })
  })
</script>

<style>
.g-items-per-page > .v-select {
  width: 90px;
}
</style>
