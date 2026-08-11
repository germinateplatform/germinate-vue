<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageGermplasmMatchTitle') }}</h1>
    <v-divider class="mb-3" />

    <p v-html="$t('pageGermplasmMatchText')" class="mb-5" />

    <LineNumberTextareaInput
      v-model="searchQuery"
      :label="$t('formLabelGermplasmMatchSearch')"
      :hint="$t('formDescriptionGermplasmMatchSearch')"
      persistent-hint
    />

    <v-btn @click="refresh" color="primary" class="mt-3" :prepend-icon="mdiRefresh" :text="$t('buttonUpdate')" />

    <template v-if="searchTerms && searchTerms.length > 0">
      <v-row class="my-5">
        <v-col cols="6" class="d-flex justify-space-between flex-column">
          <p>{{ $t('formDescriptionGermplasmMatchFound') }}</p>
          <LineNumberTextareaInput
            v-model="found"
            :label="$t('formLabelGermplasmMatchFound')"
            persistent-hint
            readonly
          />
        </v-col>
        <v-col cols="6" class="d-flex justify-space-between flex-column">
          <p>{{ $t('formDescriptionGermplasmMatchNotFound') }}</p>
          <LineNumberTextareaInput
            v-model="notFound"
            :label="$t('formLabelGermplasmMatchNotFound')"
            persistent-hint
            readonly
          />
        </v-col>
      </v-row>

      <GermplasmTable
        :filter-on="tableFilter"
        :get-data="getData"
        :get-ids="getIds"
        :download="downloadTable"
        disabled
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/plugins/api/germplasm'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableGermplasm } from '@/plugins/types/germinate'
  import { mdiRefresh } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  const tableFilter = ref<FilterGroup[]>([])

  const allGermplasm = ref<string[]>([])
  const searchQuery = ref<string>()
  const searchTerms = ref<string[]>([])
  const split = ref<string[]>([])
  const found = ref<string>()
  const notFound = ref<string>()

  const allGermplasmSet = computed(() => new Set(allGermplasm.value))

  function refresh () {
    if (!searchQuery.value) {
      return
    }

    split.value = searchQuery.value.split(/\r?\n/).map(s => s?.trim())
    const set = new Set(split.value.filter(s => s).filter(s => s.length > 0))

    searchTerms.value = [...set]

    tableFilter.value = [{
      operator: FilterOperator.and,
      filters: [{
        column: 'germplasmName',
        comparator: FilterComparator.inSet,
        values: searchTerms.value,
      }],
    }]
  }

  watch(allGermplasmSet, async newValue => {
    if (newValue && split.value) {
      const f: string[] = []
      const nf: string[] = []

      split.value.forEach(s => {
        if (allGermplasmSet.value.has(s.toLowerCase())) {
          f.push(s)
          nf.push('')
        } else {
          f.push('')
          nf.push(s)
        }
      })

      found.value = f.join('\n')
      notFound.value = nf.join('\n')
    }
  })

  function getData (data: PaginatedRequest) {
    const copy = JSON.parse(JSON.stringify(data))
    copy.page = 1
    copy.limit = MAX_JAVA_INTEGER
    return new Promise<AxiosResponse<PaginatedResult<ViewTableGermplasm[]>>>(resolve => {
      apiPostGermplasmTable(copy, result => {
        allGermplasm.value = result.data.map(d => d.germplasmName.toLowerCase())
        const response: Partial<AxiosResponse<PaginatedResult<ViewTableGermplasm[]>>> = {
          data: result,
        }
        resolve(response as AxiosResponse<PaginatedResult<ViewTableGermplasm[]>>)
      })
    })
  }
  function getIds (data: PaginatedRequest) {
    return apiPostGermplasmTableIds(data)
  }
  function downloadTable (data: PaginatedRequest) {
    const filter = { filters: data.filters } as PaginatedRequest
    return apiPostTableExport(filter, 'germplasm')
  }
</script>
