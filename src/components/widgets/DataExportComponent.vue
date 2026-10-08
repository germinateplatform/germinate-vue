<template>
  <v-container fluid>
    <div v-if="datasetType">
      <!-- Table showing all datasets of the type -->
      <DatasetTable :get-data="getData" :get-ids="getIds" :filter-on="filterOn" :selection-type="selectionMode" class="mb-3" ref="datasetTable" @selection-changed="setSelection" />
      <!-- Continue button -->
      <v-btn color="primary" @click="checkLicenses" :disabled="!canContinue" :prepend-icon="mdiArrowRightBox" :text="$t('buttonNext')" />
    </div>
    <div v-else>
      <p>{{ $t('pageDatasetSelectorInvalidTypeText') }}</p>
      <v-chip
        v-for="(dsType, name) in allDatasetType"
        class="me-2"
        :key="`experiment-type-${name}`"
        :to="Pages.getPath(Pages.exportType, name as string)"
        :prepend-icon="dsType.path"
        :text="dsType.text()"
        :color="dsType.color()"
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable, apiPostDatasetTableIds, apiPostLicenseTable } from '@/plugins/api/dataset'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { datasetTypes, type DatasetType } from '@/plugins/util/types'
  import { mdiArrowRightBox } from '@mdi/js'
  import { useBreadcrumbIcon, useBreadcrumbTitle } from '@/plugins/composables/breadcrumbs'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const router = useRouter()
  const store = useCoreStore()

  const compProps = defineProps<{
    datasetType?: string
  }>()

  const selectedDatasets = ref<number[]>([])

  useBreadcrumbTitle(() => compProps.datasetType ? datasetTypes[compProps.datasetType].text() : undefined)
  useBreadcrumbIcon(() => compProps.datasetType ? datasetTypes[compProps.datasetType].path : undefined)

  const filterOn = computed(() => {
    const result: FilterGroup[] = [{
      filters: [{
        column: 'datasetType',
        comparator: FilterComparator.equals,
        values: [compProps.datasetType || ''],
        canBeChanged: false,
      }, {
        column: 'isExternal',
        comparator: FilterComparator.equals,
        values: ['0'],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]

    if (store.storeSelectedProjects && store.storeSelectedProjects.length > 0) {
      result[0].filters?.push({
        column: 'projectId',
        comparator: FilterComparator.equals,
        values: store.storeSelectedProjects.map(String),
        canBeChanged: false,
      })
    }

    return result
  })

  const canContinue = computed(() => selectedDatasets.value && selectedDatasets.value.length > 0)
  const selectionMode = computed(() => (compProps.datasetType === 'allelefreq' || compProps.datasetType === 'pedigree') ? TableSelectionType.single : TableSelectionType.all)
  const allDatasetType = computed(() => {
    const result: { [key: string]: DatasetType } = {}

    Object.keys(datasetTypes).forEach(key => {
      if (datasetTypes[key].pageName && Pages.isAvailable(datasetTypes[key].pageName)) {
        result[key] = datasetTypes[key]
      }
    })

    return result
  })

  function getData (data: PaginatedRequest) {
    return apiPostDatasetTable(data)
  }
  function getIds (data: PaginatedRequest) {
    return apiPostDatasetTableIds(data)
  }
  function setSelection (selectedIds: number[]) {
    selectedDatasets.value = selectedIds
  }
  function checkLicenses () {
    const query: PaginatedRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        filters: [{
          column: 'datasetId',
          comparator: FilterComparator.inSet,
          values: selectedDatasets.value.map(String),
        }],
        operator: FilterOperator.and,
      }],
    }

    apiPostLicenseTable(query, result => {
      if (result && result.data && result.data.length > 0) {
        const toAccept = result.data.filter(l => {
          let result = true

          if (l.acceptedBy !== undefined && l.acceptedBy !== null && l.acceptedBy.length > 0) {
            if (store.storeToken && l.acceptedBy.includes(store.storeToken.id)) {
              result = false
            } else if (!store.storeToken && l.acceptedBy.includes(-1000)) {
              result = false
            }
          }

          return result
        })

        if (toAccept.length > 0) {
          // Show toast
          emitter.emit('show-snackbar', {
            text: t('toastTextAcceptLicense'),
            color: 'error',
          })
        } else {
          // Navigate to the export page
          navigateToExportPage()
        }
      } else {
        // Navigate to the export page
        navigateToExportPage()
      }
    })
  }

  function navigateToExportPage () {
    switch (compProps.datasetType) {
      case 'trials':
        router.push(Pages.getPath(Pages.exportTraits, selectedDatasets.value.join(',')))
        break
      case 'genotype':
        router.push(Pages.getPath(Pages.exportGenotypes, selectedDatasets.value.join(',')))
        break
      // case 'allelefreq':
      //   router.push(Pages.getPath(Pages.exportAlleleFrequency, selectedDatasets.value.join(',')))
      //   break
      case 'climate':
        router.push(Pages.getPath(Pages.exportClimates, selectedDatasets.value.join(',')))
        break
      case 'pedigree':
        router.push(Pages.getPath(Pages.exportPedigrees, selectedDatasets.value.join(',')))
        break
    }
  }
</script>
