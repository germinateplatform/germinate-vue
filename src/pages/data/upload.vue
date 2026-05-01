<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageDataUploadTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageDataUploadText')" />

    <v-row class="my-5">
      <v-col v-for="(tab, index) in tabs" :key="`upload-tab-${tab.id}`">
        <v-card :color="selectedTab?.id === tab.id ? getTemplateColor(index) : 'muted'" @click="selectedTab = tab">
          <div class="d-flex flex-no-wrap justify-space-between align-center">
            <div>
              <v-card-title class="text-headline-small">
                {{ tab.text() }}
              </v-card-title>

              <!-- <v-card-subtitle><a class="help-link" :href="tab.helpUrl" target="_blank"><v-icon :icon="mdiHelpCircle" /></a></v-card-subtitle> -->
            </div>

            <v-avatar
              class="ma-3"
              rounded="0"
              size="64"
            >
              <v-icon size="64">{{ tab.path }}</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <template v-if="selectedTab">
      <template v-if="(tabGroups.get(selectedTab.group)?.length || 0) > 1">
        <v-row class="my-5">
          <v-col v-for="(tab, index) in tabGroups.get(selectedTab.group)" :key="`upload-tab-${tab.id}`">
            <v-card :color="selectedSubTab?.id === tab.id ? getTemplateColor(index) : 'muted'" @click="selectedSubTab = tab">
              <div class="d-flex flex-no-wrap justify-space-between align-center">
                <div>
                  <v-card-title class="text-headline-small">
                    {{ tab.text() }}
                  </v-card-title>

                  <!-- <v-card-subtitle><a class="help-link" :href="tab.helpUrl" target="_blank"><v-icon :icon="mdiHelpCircle" /></a></v-card-subtitle> -->
                </div>

                <v-avatar
                  class="ma-3"
                  rounded="0"
                  size="64"
                >
                  <v-icon size="64">{{ tab.path }}</v-icon>
                </v-avatar>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-if="selectedNestedTab">
        <v-alert
          color="info"
          :icon="mdiHelpCircle"
          density="compact"
          :text="$t('pageDataUploadHelpLink')"
          variant="tonal"
          stacked
          border="start"
        >
          <template #append>
            <v-btn :text="$t('buttonReadMore')" variant="tonal" :href="selectedNestedTab.helpUrl" target="_blank" />
          </template>
        </v-alert>

        <v-divider class="my-5" />

        <div v-if="selectedNestedTab.id === 'mcpd'">
          <v-btn-toggle
            v-model="mcpdImportUpdate"
            color="primary"
            mandatory
            variant="tonal"
          >
            <v-btn value="import" :prepend-icon="mdiUpload" :text="$t('pageDataUploadUpdateOptionInsert')" />
            <v-btn value="update" :prepend-icon="mdiRefresh" :text="$t('pageDataUploadUpdateOptionUpdate')" />
          </v-btn-toggle>
          <div class="v-input__details" role="alert" aria-live="polite">
            <div class="v-messages">
              <div class="v-messages__message">
                {{ $t(mcpdImportUpdate === 'update' ? 'pageDataUploadUpdateExplanationUpdate' : 'pageDataUploadUpdateExplanationInsert') }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedNestedTab.id === 'genotype'">
          <h4 class="mt-3 mb-0">{{ $t('formLabelDataUploadDataOrientation') }}</h4>

          <v-btn-toggle
            v-model="dataOrientation"
            color="primary"
            mandatory
            variant="tonal"
          >
            <v-btn :value="DataOrientation.GENOTYPE_GERMPLASM_BY_MARKER" :text="$t('formSelectOptionDataOrientationGermplasmAsRows')" />
            <v-btn :value="DataOrientation.GENOTYPE_MARKER_BY_GERMPLASM" :text="$t('formSelectOptionDataOrientationMarkersAsRows')" />
          </v-btn-toggle>
        </div>

        <template v-if="selectedNestedTab.id === 'shapefile'">
          <h4 class="mt-3 mb-0">{{ $t('formLabelDataUploadDataset') }}</h4>

          <v-autocomplete
            v-model="selectedDataset"
            :label="$t('formLabelDataUploadDataset')"
            hide-details
            return-object
            :items="trialsDatasets"
            item-value="datasetId"
            :item-title="(item: ViewTableDatasets) => `${item.datasetId} - ${item.datasetName}`"
          />
        </template>

        <div v-if="selectedNestedTab.group === 'genotype' || selectedNestedTab.group === 'trial' || selectedNestedTab.group === 'climate' || selectedNestedTab.group === 'pedigree'">
          <h4 class="mt-3 mb-0">{{ $t('pageDataUploadDatasetStateTitle') }}</h4>

          <v-btn-toggle
            v-model="datasetState"
            color="primary"
            mandatory
            variant="tonal"
          >
            <v-btn
              v-for="state in datasetStates"
              :key="`dataset-state-${state.id}`"
              :value="state"
              :text="state.text()"
              :prepend-icon="state.path"
            />
          </v-btn-toggle>
          <div class="v-input__details" role="alert" aria-live="polite">
            <div class="v-messages">
              <div class="v-messages__message">
                {{ datasetState.help() }}
              </div>
            </div>
          </div>
        </div>

        <v-file-upload
          class="mt-5"
          clearable
          show-size
          inset-file-list
          v-model="selectedFile"
          :filter-by-type="selectedNestedTab.accepts"
        />

        <v-btn
          @click="upload"
          :disabled="!canContinue"
          color="primary"
          :prepend-icon="mdiUpload"
          :text="$t('pageDataUploadCheckFileButton')"
        />
      </template>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiPostDataUpload } from '@/plugins/api/misc'
  import { DataOrientation, FilterComparator, FilterOperator, UserType, type ViewTableDatasets } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { type DatasetState, datasetStates, templateImportTypes, type TemplateImportType } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import { mdiHelpCircle, mdiRefresh, mdiUpload } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'

  definePage({
    meta: {
      requiredUserType: UserType.DATA_CURATOR,
    },
  })

  const store = coreStore()

  const selectedTab = ref<TemplateImportType>()
  const selectedSubTab = ref<TemplateImportType>()
  const mcpdImportUpdate = ref<'import' | 'update'>('import')
  const datasetState = ref<DatasetState>(datasetStates.public)
  const trialsDatasets = ref<ViewTableDatasets[]>([])
  const selectedDataset = ref<ViewTableDatasets>()
  const dataOrientation = ref<DataOrientation>(DataOrientation.GENOTYPE_GERMPLASM_BY_MARKER)
  const selectedFile = ref<File>()

  const selectedNestedTab = computed(() => selectedSubTab.value || selectedTab.value)

  const tabGroups = computed(() => {
    const groups = new Map<string, TemplateImportType[]>()

    Object.values(templateImportTypes).forEach(type => {
      const items = groups.get(type.group) || []
      items.push(type)
      groups.set(type.group, items)
    })

    return groups
  })

  const tabs: ComputedRef<TemplateImportType[]> = computed(() => {
    return [...tabGroups.value.keys()].map(g => templateImportTypes[g])
  })

  const canContinue = computed(() => {
    const tab = selectedSubTab.value || selectedTab.value

    if (tab && selectedFile.value) {
      if (tab.id === 'mcpd') {
        return mcpdImportUpdate.value !== undefined
      } else if (tab.id === 'shapefile') {
        return selectedDataset.value !== undefined
      }

      return true
    } else {
      return false
    }
  })

  function upload () {
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('fileToUpload', selectedFile.value)

      emitter.emit('show-loading', true)
      const type = selectedSubTab.value || selectedTab.value

      if (type) {
        apiPostDataUpload(formData, type.id, type.id === 'mcpd' && mcpdImportUpdate.value === 'update', dataOrientation.value, type.id === 'shapefile' ? selectedDataset.value?.datasetId : undefined, datasetState.value.id, result => {
          if (result) {
            store.addAsyncJobUuids(result.map(r => r.uuid))
          }

          emitter.emit('toggle-aside', 'upload')
          emitter.emit('show-loading', false)

          selectedFile.value = undefined
        })
      }
    }
  }

  onMounted(() => {
    apiPostDatasetTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'datasetType',
          comparator: FilterComparator.equals,
          values: ['trials'],
        }],
      }],
    }, result => {
      if (result && result.data) {
        trialsDatasets.value = result.data || []

        if (result.data.length > 0) {
          selectedDataset.value = result.data[0]
        }
      }
    })
  })

  watch(selectedTab, async newValue => {
    mcpdImportUpdate.value = 'import'
    selectedSubTab.value = newValue ? tabGroups.value.get(newValue.group)?.[0] : undefined
    selectedFile.value = undefined
  })
</script>
