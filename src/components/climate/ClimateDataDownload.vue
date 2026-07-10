<template>
  <div>
    <h2>{{ $t('pageClimateExportClimateExportTitle') }}</h2>

    <v-row>
      <v-col cols="12" md="6">
        <ClimateSelection
          v-model="selectedClimates"
          can-select-all
          :climates="climates"
        >
          <template #text>
            <p>{{ $t('pageClimateExportSelectClimateExportText') }}</p>
          </template>
        </ClimateSelection>
      </v-col>
      <v-col cols="12" md="6">
        <GroupSelection
          v-model="selectedGroups"
          v-model:group-selection="groupSelection"
          :groups="groups"
          marked-item-type="locations"
        >
          <template #text>{{ $t('pageClimateExportSelectGroupExportText') }}</template>
        </GroupSelection>
      </v-col>
    </v-row>

    <!-- <v-btn :disabled="!canContinue" color="primary" :prepend-icon="mdiArrowRightBox" :text="$t('buttonExport')" @click="downloadWideFormat" /> -->

    <v-row>
      <v-col cols="12" lg="6">
        <v-card
          class="text-wrap"
          :title="$t('pageClimateExportClimateExportLongFormatTitle')"
          :subtitle="$t('pageClimateExportClimateExportLongFormatSubtitle')"
          :prepend-icon="mdiFormatListGroup"
        >
          <template #actions>
            <v-spacer />
            <v-btn color="primary" variant="tonal" :disabled="!canContinue" :prepend-icon="mdiDownload" :text="$t('buttonExport')" @click="downloadLongFormat" />
          </template>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card
          class="text-wrap"
          :title="$t('pageClimateExportClimateExportWideFormatTitle')"
          :subtitle="$t('pageClimateExportClimateExportWideFormatSubtitle')"
          :prepend-icon="mdiTableColumnWidth"
        >
          <template #actions>
            <v-spacer />
            <v-btn color="primary" variant="tonal" :disabled="!canContinue" :prepend-icon="mdiDownload" :text="$t('buttonExport')" @click="downloadWideFormat" />
          </template>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { FilterComparator, FilterOperator, type ViewTableClimates, type ViewTableGroups } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import emitter from 'tiny-emitter/instance'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'
  import { apiPostClimateDatasetExport } from '@/plugins/api/dataset'
  import { downloadBlob } from '@/plugins/util'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import type { AxiosResponse } from 'axios'
  import { mdiDownload, mdiFormatListGroup, mdiTableColumnWidth } from '@mdi/js'

  const compProps = defineProps<{
    datasetIds: number[]
    climates: ViewTableClimates[]
    groups: ViewTableGroups[]
    max?: number
  }>()

  const store = coreStore()

  const selectedClimates = ref<ViewTableClimates[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const canContinue = computed(() => {
    return selectedClimates.value.length > 0 && selectedClimates.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })

  function downloadLongFormat () {
    emitter.emit('show-loading', true)

    // Download the current table data
    apiPostTableExport({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      datasetIds: compProps.datasetIds,
      locationIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedLocations : undefined,
      locationGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'climateId',
          comparator: FilterComparator.inSet,
          values: selectedClimates.value.map(t => `${t.climateId}`),
        }],
      }],
    }, 'dataset/data/climate').then((result: AxiosResponse<Blob>) => {
      downloadBlob({
        blob: result.data,
        filename: 'climate-long-dataset-' + compProps.datasetIds.join('-'),
        extension: 'zip',
      })
      emitter.emit('show-loading', false)
    })
  }

  function downloadWideFormat () {
    emitter.emit('show-loading', true)

    const query = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds,
      climateIds: selectedClimates.value.map(t => t.climateId),
      locationIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedLocations : undefined,
      locationGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    apiPostClimateDatasetExport(query, result => {
      const downloadRequest = {
        blob: result,
        filename: 'climate-wide-dataset-' + compProps.datasetIds.join('-'),
        extension: 'txt',
      }

      downloadBlob(downloadRequest)
      emitter.emit('show-loading', false)
    })
  }
</script>
