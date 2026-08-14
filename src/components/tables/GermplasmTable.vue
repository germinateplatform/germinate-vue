<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableGermplasm} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :disabled="compProps.disabled"
    :headers="headers"
    :filter-on="filterOn"
    :sort-by="compProps.sortBy"
    :selection-type="selectionType"
    item-key="germplasmId"
    table-key="germplasm"
    marked-item-type="germplasm"
    :header-icon="mdiSprout"
    :show-details="true"
    :header-title="$t('pageGermplasmTitle')"
    @filter-cleared="emit('filter-cleared')"
  >
    <template #header.pdci="{ column }">
      {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipGermplasmPdci')">
        <template #activator="{ props }">
          <v-icon v-bind="props" size="small" color="muted" :icon="mdiHelpCircle" />
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
    <template #header.hasPedigreeData>
      <v-icon :icon="datasetTypes.pedigree.path" v-tooltip:bottom="$t('tableColumnHasPedigreeData')" />
    </template>

    <template #header.marking.append>
      <v-divider />
      <v-list-item :title="$t('tableContextMarkEntityParents')" :prepend-icon="mdiChevronUpBox" @click="markEntityParents(true)" />
      <v-list-item :title="$t('tableContextUnmarkEntityParents')" :prepend-icon="mdiChevronUpBoxOutline" @click="markEntityParents(false)" />
      <v-list-item :title="$t('tableContextMarkEntityChildren')" :prepend-icon="mdiChevronDownBox" @click="markEntityChildren(true)" />
      <v-list-item :title="$t('tableContextUnmarkEntityChildren')" :prepend-icon="mdiChevronDownBoxOutline" @click="markEntityChildren(false)" />
    </template>
    <template #item.marking.append="{ item }">
      <!-- Visual divider to separate the chip body from the dropdown arrow -->
      <v-divider
        vertical
        class="mx-2 my-1"
      />

      <!-- Dropdown icon slot -->
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiChevronDown"
            size="small"
            @click.stop
          />
        </template>

        <v-list slim>
          <v-list-item :title="$t('tableContextMarkEntityParents')" :prepend-icon="mdiChevronUpBox" @click="markEntityParents(true, item)" />
          <v-list-item :title="$t('tableContextUnmarkEntityParents')" :prepend-icon="mdiChevronUpBoxOutline" @click="markEntityParents(false, item)" />
          <v-list-item :title="$t('tableContextMarkEntityChildren')" :prepend-icon="mdiChevronDownBox" @click="markEntityChildren(true, item)" />
          <v-list-item :title="$t('tableContextUnmarkEntityChildren')" :prepend-icon="mdiChevronDownBoxOutline" @click="markEntityChildren(false, item)" />
        </v-list>
      </v-menu>
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
      <div class="d-flex align-center pa-2" v-if="item.institutions && item.institutions.length > 0">
        <span :title="value" v-if="value">{{ truncateAfterWords(value, 6) }}</span>
        <a href="#" class="ms-2 table-icon-link" @click.prevent="showInstitutionModal(item)" v-if="isTruncatedAfterWords(value, 6)">
          <v-icon :icon="mdiPageNext" />
        </a>
      </div>
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
    <template #item.hasPedigreeData="{ item }">
      <v-icon v-if="item.hasPedigreeData" :color="datasetTypes.pedigree.color()" v-tooltip:top="datasetTypes.pedigree.text()" :icon="datasetTypes.pedigree.path" />
    </template>

    <template #item.imageCount="{ item }">
      <v-menu v-if="item.imageCount" location="bottom">
        <template #activator="{ props }">
          <v-icon
            :icon="mdiCamera"
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
      <v-chip label @click="toggleExpand(internalItem)" v-if="item.latitude && item.longitude" :prepend-icon="mdiMapMarker" v-tooltip:top="$t('tableTooltipGermplasmLocation')" :text="item.location" />
      <v-chip label v-else :prepend-icon="mdiMapMarker" :text="item.location" />
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
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import { datasetTypes, entityTypes } from '@/plugins/util/types'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableGermplasm } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'
  import { getImageUrl } from '@/plugins/util/image'
  import InstitutionTable from '@/components/tables/InstitutionTable.vue'
  import { columns } from '@/plugins/util/table-columns'
  import type { DataTableSortItem } from 'vuetify'
  import { mdiCamera, mdiHelpCircle, mdiMapMarker, mdiPageNext, mdiSprout, mdiChevronDownBox, mdiChevronDownBoxOutline, mdiChevronUpBox, mdiChevronUpBoxOutline, mdiChevronDown } from '@mdi/js'
  import { apiPostGermplasmInstitutionTable } from '@/plugins/api/institution'
  import { apiPostEntityIds } from '@/plugins/api/germplasm'

  import emitter from 'tiny-emitter/instance'

  interface GermplasmTableProps {
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableGermplasm[]>>> }
    getIds: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    sortBy?: DataTableSortItem[]
    selectionType?: TableSelectionType
    tableMode?: 'base' | 'distance'
    disabled?: boolean
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

  function markEntityParents (mark: boolean, item?: ViewTableGermplasm) {
    if (item) {
      // Easy, just get the parent id and add/remove
      if (item.entityParentId) {
        if (mark) {
          store.addMarkedIds('germplasm', [item.entityParentId])
        } else {
          store.removeMarkedIds('germplasm', [item.entityParentId])
        }
      }
    } else {
      // Get from server
      if (baseTable.value && baseTable.value.currentRequest) {
        emitter.emit('show-loading', true)

        // Get all the ids of items currently in the table
        compProps.getIds(baseTable.value.currentRequest as PaginatedRequest)
          .then(axiosResponse => {
            if (axiosResponse?.data?.data) {
              // Then exchange them for their entity parents
              apiPostEntityIds(axiosResponse.data.data, 'up', result => {
                if (result && result.length > 0) {
                  if (mark) {
                    store.addMarkedIds('germplasm', result)
                  } else {
                    store.removeMarkedIds('germplasm', result)
                  }
                }
              }).finally(() => emitter.emit('show-loading', false))
            }
          })
          .catch(() => emitter.emit('show-loading', false))
      }
    }
  }

  function markEntityChildren (mark: boolean, item?: ViewTableGermplasm) {
    if (item) {
      emitter.emit('show-loading', true)

      // Exchange the current germplasm id for their entity children
      apiPostEntityIds([item.germplasmId], 'down', result => {
        if (result && result.length > 0) {
          if (mark) {
            store.addMarkedIds('germplasm', result)
          } else {
            store.removeMarkedIds('germplasm', result)
          }
        }
      }).finally(() => emitter.emit('show-loading', false))
    } else {
      // Get from server
      if (baseTable.value && baseTable.value.currentRequest) {
        emitter.emit('show-loading', true)

        // Get all the ids of items currently in the table
        compProps.getIds(baseTable.value.currentRequest as PaginatedRequest)
          .then(axiosResponse => {
            if (axiosResponse?.data?.data) {
              // Then exchange them for their entity children
              apiPostEntityIds(axiosResponse.data.data, 'down', result => {
                if (result && result.length > 0) {
                  if (mark) {
                    store.addMarkedIds('germplasm', result)
                  } else {
                    store.removeMarkedIds('germplasm', result)
                  }
                }
              }).finally(() => emitter.emit('show-loading', false))
            }
          })
          .catch(() => emitter.emit('show-loading', false))
      }
    }
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
    forceFilter: (filters: FilterGroup[]) => baseTable.value?.forceFilters(filters),
  })

  const emit = defineEmits(['filter-cleared'])
</script>

<style scoped>
</style>
