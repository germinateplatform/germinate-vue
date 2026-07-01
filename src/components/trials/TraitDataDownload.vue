<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitExportTitle') }}</h2>

    <v-row>
      <v-col cols="12" md="6">
        <TraitSelection
          v-model="selectedTraits"
          can-select-all
          :traits="traits"
        >
          <template #text>
            <p>{{ $t('pageTrialsExportSelectTraitExportText') }}</p>
          </template>
        </TraitSelection>
      </v-col>
      <v-col cols="12" md="6">
        <GroupSelection
          v-model="selectedGroups"
          v-model:group-selection="groupSelection"
          :groups="groups"
          marked-item-type="germplasm"
        >
          <template #text>{{ $t('pageTrialsExportSelectGroupExportText') }}</template>
        </GroupSelection>
      </v-col>
    </v-row>

    <!-- <v-btn :disabled="!canContinue" color="primary" :prepend-icon="mdiArrowRightBox" :text="$t('buttonExport')" @click="downloadWideFormat" /> -->

    <v-row>
      <v-col cols="12" lg="6">
        <v-card
          class="card-subtitle-wrap"
          :title="$t('pageTrialsExportTraitExportLongFormatTitle')"
          :subtitle="$t('pageTrialsExportTraitExportLongFormatSubtitle')"
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
          class="card-subtitle-wrap"
          :title="$t('pageTrialsExportTraitExportWideFormatTitle')"
          :subtitle="$t('pageTrialsExportTraitExportWideFormatSubtitle')"
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
  import { FilterComparator, FilterOperator, type ViewTableGroups, type ViewTableTraits } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import emitter from 'tiny-emitter/instance'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'
  import { apiPostTrialDatasetExport } from '@/plugins/api/dataset'
  import { downloadBlob } from '@/plugins/util'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import type { AxiosResponse } from 'axios'
  import { mdiDownload, mdiFormatListGroup, mdiTableColumnWidth } from '@mdi/js'

  const compProps = defineProps<{
    datasetIds: number[]
    traits: ViewTableTraits[]
    groups: ViewTableGroups[]
    max?: number
  }>()

  const store = coreStore()

  const selectedTraits = ref<ViewTableTraits[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const canContinue = computed(() => {
    return selectedTraits.value.length > 0 && selectedTraits.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })

  function downloadLongFormat () {
    emitter.emit('show-loading', true)

    // Download the current table data
    apiPostTableExport({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      datasetIds: compProps.datasetIds,
      germplasmIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined,
      germplasmGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'variableId',
          comparator: FilterComparator.inSet,
          values: selectedTraits.value.map(t => `${t.variableId}`),
        }],
      }],
    }, 'dataset/data/trial').then((result: AxiosResponse<Blob>) => {
      downloadBlob({
        blob: result.data,
        filename: 'trials-long-dataset-' + compProps.datasetIds.join('-'),
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
      traitIds: selectedTraits.value.map(t => t.variableId),
      germplasmIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined,
      germplasmGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    apiPostTrialDatasetExport(query, result => {
      const downloadRequest = {
        blob: result,
        filename: 'trials-wide-dataset-' + compProps.datasetIds.join('-'),
        extension: 'txt',
      }

      downloadBlob(downloadRequest)
      emitter.emit('show-loading', false)
    })
  }
</script>
