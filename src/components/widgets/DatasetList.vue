<template>
  <v-chip-group v-if="datasets">
    <v-menu
      location="top start"
      origin="top start"
      transition="scale-transition"
      v-for="dataset in datasets"
      :key="`dataset-chip-${dataset.datasetId}`"
      v-model="menus[dataset.datasetId || -1]"
    >
      <template #activator="{ props }">
        <v-chip v-bind="props" link label size="small" :prepend-icon="mdiDatabase" :text="dataset.datasetName" />
      </template>

      <v-card max-width="300px">
        <v-list bg-color="surface-variant">
          <v-list-item
            :title="dataset.datasetName"
          >
            <template #title><span :title="dataset.datasetName">{{ dataset.datasetName }}</span></template>
            <template #subtitle><span :title="dataset.datasetDescription">{{ dataset.datasetDescription }}</span></template>
            <template #prepend><v-avatar :text="`${dataset.datasetId}`" /></template>
            <template #append>
              <v-btn variant="text" :icon="mdiCloseCircle" @click="menus[dataset.datasetId || -1] = false" />
            </template>
          </v-list-item>
        </v-list>
        <v-card-text>
          <v-chip
            label
            :color="datasetTypes[dataset.datasetType || ''].color()"
            :prepend-icon="datasetTypes[dataset.datasetType || ''].path"
            :text="$t(datasetTypes[dataset.datasetType || ''].text)"
            variant="tonal"
            v-tooltip:top="(dataset.datasetType === 'trials' && dataset.studyDetailsCore !== undefined) ? $t('widgetStudyDetailsTitle') : undefined"
            :link="(dataset.datasetType === 'trials' && dataset.studyDetailsCore !== undefined)"
            @click="(dataset.datasetType === 'trials' && dataset.studyDetailsCore !== undefined) ? showStudyDetails(dataset) : undefined"
          >
            <template #append v-if="dataset.datasetType === 'trials' && dataset.studyDetailsCore">
              <v-icon end :icon="mdiInformation" />
            </template>
          </v-chip>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      max-height="75vh"
    >
      <v-card
        class="pb-10"
      >
        <v-card-text v-if="selectedDataset && selectedDataset.studyDetailsCore">
          <h3 class="text-headline-medium">{{ $t('widgetStudyDetailsTitle') }}</h3>
          <StudyDetailsComponent :study-details="selectedDataset.studyDetailsCore" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-chip-group>
</template>

<script setup lang="ts">
  import type { ViewTableDatasets } from '@/plugins/types/germinate'
  import { datasetTypes } from '@/plugins/util/types'
  import { mdiCloseCircle, mdiDatabase, mdiInformation } from '@mdi/js'

  const menus = ref<{ [index: number]: boolean }>({})

  const bottomSheetVisible = ref(false)
  const selectedDataset = ref<ViewTableDatasets>()

  defineProps<{
    datasets: ViewTableDatasets[]
  }>()

  function showStudyDetails (item: ViewTableDatasets) {
    selectedDataset.value = item

    nextTick(() => {
      bottomSheetVisible.value = true
    })
  }
</script>
