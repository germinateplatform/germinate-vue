<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableGermplasm} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :sort-by="compProps.sortBy"
    :selection-type="selectionType"
    item-key="germplasmId"
    table-key="germplasm"
    marked-item-type="germplasm"
    header-icon="mdi-sprout"
    :show-details="true"
    :header-title="$t('pageGermplasmTitle')"
  >
    <template #header.pdci="{ column }">
      {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipGermplasmPdci')">
        <template #activator="{ props }">
          <v-icon v-bind="props" size="small" color="muted" icon="mdi-help-circle" />
        </template>
      </v-tooltip>
    </template>

    <!-- HEAD: Trials data -->
    <template #header.hasTrialsData>
      <v-icon :icon="datasetTypes.trials.path" v-tooltip:bottom="$t('tableColumnHasTrialsData')" />
    </template>
    <!-- HEAD: Genotypic data -->
    <template #header.hasGenotypicData>
      <v-icon :icon="datasetTypes.genotype.path" v-tooltip:bottom="$t('tableColumnHasGenotypicData')" />
    </template>
    <!-- HEAD: Allelefreq data -->
    <template #header.hasAllelefreqData>
      <v-icon :icon="datasetTypes.allelefreq.path" v-tooltip:bottom="$t('tableColumnHasAllelefreqData')" />
    </template>
    <!-- HEAD: Allelefreq data -->
    <template #header.hasPedigreeData>
      <v-icon :icon="datasetTypes.pedigree.path" v-tooltip:bottom="$t('tableColumnHasPedigreeData')" />
    </template>

    <template #item.germplasmId="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmId }}</router-link>
    </template>
    <template #item.germplasmName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmName }}</router-link>
    </template>
    <template #item.germplasmDisplayName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmDisplayName }}</router-link>
    </template>
    <template #item.germplasmGid="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmGid }}</router-link>
    </template>
    <template #item.germplasmNumber="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmNumber }}</router-link>
    </template>
    <template #item.entityTypeName="{ item }">
      <v-chip label :color="entityTypes[item.entityTypeName].color()" :prepend-icon="entityTypes[item.entityTypeName].path">{{ entityTypes[item.entityTypeName].text() }}</v-chip>
    </template>

    <!-- Institutions -->
    <template #item.institutions="{ item, value }">
      <template v-if="item.institutions && item.institutions.length > 0">
        <span :title="value" v-if="value">{{ truncateAfterWords(value, 6) }}</span>
        <a href="#" class="ms-2 table-icon-link" @click.prevent="showInstitutionModal(item)" v-if="isTruncatedAfterWords(value, 6)">
          <v-icon icon="mdi-page-next" />
        </a>
      </template>
    </template>

    <!-- Biological status popover -->
    <template #item.biologicalStatusName="{ item }">
      <span v-if="item.biologicalStatusName" v-tooltip:top="item.biologicalStatusName">{{ item.biologicalStatusName.split(" (")[0] }}</span>
    </template>
    <template #item.synonyms="{ item }">
      <span v-if="item.synonyms">{{ item.synonyms.join(', ') }}</span>
    </template>

    <!-- Country flag -->
    <template #item.countryName="{ item }">
      <span class="text-no-wrap" v-tooltip:top="item.countryName" v-if="item.countryCode">
        <i :class="'fi fi-' + item.countryCode.toLowerCase()" /> <span> {{ item.countryCode }}</span>
      </span>
      <span v-else>
        {{ item.countryName }}
      </span>
    </template>

    <!-- Dataset types -->
    <template #item.hasTrialsData="{ item }">
      <v-icon v-if="item.hasTrialsData" :color="datasetTypes.trials.color()" v-tooltip:top="datasetTypes.trials.text()" :icon="datasetTypes.trials.path" />
    </template>
    <template #item.hasGenotypicData="{ item }">
      <v-icon v-if="item.hasGenotypicData" :color="datasetTypes.genotype.color()" v-tooltip:top="datasetTypes.genotype.text()" :icon="datasetTypes.genotype.path" />
    </template>
    <template #item.hasAllelefreqData="{ item }">
      <v-icon v-if="item.hasAllelefreqData" :color="datasetTypes.allelefreq.color()" v-tooltip:top="datasetTypes.allelefreq.text()" :icon="datasetTypes.allelefreq.path" />
    </template>
    <template #item.hasPedigreeData="{ item }">
      <v-icon v-if="item.hasPedigreeData" :color="datasetTypes.pedigree.color()" v-tooltip:top="datasetTypes.pedigree.text()" :icon="datasetTypes.pedigree.path" />
    </template>

    <template #item.imageCount="{ item }">
      <v-menu v-if="item.imageCount" location="bottom">
        <template #activator="{ props }">
          <v-icon
            icon="mdi-camera"
            v-bind="props"
            v-tooltip:top="$t('tableTooltipGermplasmImage')"
          /> {{ item.imageCount }}
        </template>

        <v-card>
          <v-card-text>
            <v-img :src="getSrc(item)" height="300px" width="300px" />
          </v-card-text>
        </v-card>
      </v-menu>
    </template>

    <template #item.pdci="{ item }">
      <div class="d-flex flex-column align-center ga-1" v-if="item.pdci !== undefined">
        <v-progress-circular size="18" width="4" :model-value="(item.pdci || 0) * 10" />
        <span>{{ item.pdci.toFixed(2) }}</span>
      </div>
    </template>

    <template #item.data-table-expand="{ item, internalItem, toggleExpand }">
      <v-chip label @click="toggleExpand(internalItem)" v-if="item.latitude && item.longitude" prepend-icon="mdi-map-marker" v-tooltip:top="$t('tableTooltipGermplasmLocation')" :text="item.location" />
      <v-chip label v-else prepend-icon="mdi-map-marker" :text="item.location" />
    </template>

    <template #expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length" class="pa-0">
          <v-sheet>
            <LocationMap
              :rounded="false"
              :locations="[{
                locationId: item.locationId,
                locationType: 'collectingsites',
                locationLatitude: item.latitude,
                locationLongitude: item.longitude,
                locationName: item.location,
                countryCode2: item.countryCode,
                countryName: item.countryName
              }]"
            />
          </v-sheet>
        </td>
      </tr>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>

    <template #bottom-sheet-content>
      <InstitutionTable :get-data="getInstitutionData" v-if="selectedGermplasm" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import LocationMap from '@/components/map/LocationMap.vue'
  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { Pages } from '@/plugins/pages'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import { datasetTypes, entityTypes } from '@/plugins/util/types'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableGermplasm } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'
  import { getImageUrl } from '@/plugins/util/image'
  import InstitutionTable from '@/components/tables/InstitutionTable.vue'
  import { apiPostGermplasmInstitutionTable } from '@/plugins/api/misc'
  import { columns } from '@/plugins/util/table-columns'
  import type { DataTableSortItem } from 'vuetify'

  interface GermplasmTableProps {
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableGermplasm[]>>> }
    getIds: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    sortBy?: DataTableSortItem[]
    selectionType?: TableSelectionType
    tableMode?: 'base' | 'distance'
  }

  const compProps = withDefaults(defineProps<GermplasmTableProps>(), {
    tableMode: 'base',
  })

  const baseTable = useTemplateRef('baseTable')
  const store = coreStore()
  const { t } = useI18n()
  const bottomVisible = ref(false)
  const selectedGermplasm = ref<ViewTableGermplasm>()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const result = columns.germplasm.map(c => {
      c.title = t(c.title || '')
      return c
    })

    if (compProps.tableMode === 'distance') {
      result.unshift({
        key: 'distance',
        title: t('tableColumnGermplasmDistance'),
        dataType: 'float',
      })
    }

    return result
  })

  function showInstitutionModal (item: ViewTableGermplasm) {
    selectedGermplasm.value = item

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  function getInstitutionData (data: PaginatedRequest) {
    return apiPostGermplasmInstitutionTable(selectedGermplasm.value?.germplasmId || -1, data)
  }

  function getSrc (item: ViewTableGermplasm) {
    return getImageUrl(item.firstImagePath, {
      name: item.firstImagePath,
      type: 'database',
      size: 'small',
      token: store.storeToken ? store.storeToken.imageToken : '',
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
