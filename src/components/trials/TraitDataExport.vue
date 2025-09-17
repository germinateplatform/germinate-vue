<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <TraitSelection
          v-model="selectedTraits"
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
          <template #text>
            <p>{{ $t('pageTrialsExportSelectGroupExportText') }}</p>
          </template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn :disabled="!canContinue" color="primary" prepend-icon="mdi-arrow-right-box" :text="$t('buttonExport')" @click="downloadData" />
  </div>
</template>

<script setup lang="ts">
  import type { ViewTableGroups, ViewTableTraits } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import emitter from 'tiny-emitter/instance'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'
  import { apiPostTrialDatasetExport } from '@/plugins/api/dataset'
  import { downloadBlob } from '@/plugins/util'

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

  function downloadData () {
    emitter.emit('show-loading', true)

    const query = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds,
      traitIds: selectedTraits.value.map(t => t.traitId),
      germplasmIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined,
      germplasmGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    apiPostTrialDatasetExport<Blob>(query, result => {
      const downloadRequest = {
        blob: result,
        filename: 'trials-dataset-' + compProps.datasetIds.join('-'),
        extension: 'txt',
      }

      downloadBlob(downloadRequest)
      emitter.emit('show-loading', false)
    })
  }
</script>
