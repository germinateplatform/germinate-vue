<template>
  <v-chip-group class="mb-3" v-if="datasets">
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
          <v-chip label :color="datasetTypes[dataset.datasetType || ''].color()" :prepend-icon="datasetTypes[dataset.datasetType || ''].path" :text="datasetTypes[dataset.datasetType || ''].text()" />
        </v-card-text>
      </v-card>
    </v-menu>
  </v-chip-group>
</template>

<script setup lang="ts">
  import type { ViewTableDatasets } from '@/plugins/types/germinate'
  import { datasetTypes } from '@/plugins/util/types'
  import { mdiCloseCircle, mdiDatabase } from '@mdi/js'

  const menus = ref<{ [index: number]: boolean }>({})

  const compProps = defineProps<{
    datasets: ViewTableDatasets[]
  }>()
</script>
