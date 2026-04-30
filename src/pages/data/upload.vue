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

        <template v-if="selectedNestedTab.id === 'mcpd'">
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
        </template>

        <template v-if="selectedNestedTab.group === 'genotype' || selectedNestedTab.group === 'trial' || selectedNestedTab.group === 'climate' || selectedNestedTab.group === 'pedigree'">
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
        </template>

        <v-file-upload
          class="mt-5"
          clearable
          :filter-by-type="selectedNestedTab.accepts"
        />
      </template>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { UserType } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { type DatasetState, datasetStates, templateImportTypes, type TemplateImportType } from '@/plugins/util/types'
  import { mdiHelpCircle, mdiRefresh, mdiUpload } from '@mdi/js'

  definePage({
    meta: {
      requiredUserType: UserType.DATA_CURATOR,
    },
  })

  const selectedTab = ref<TemplateImportType>()
  const selectedSubTab = ref<TemplateImportType>()
  const mcpdImportUpdate = ref<'import' | 'update'>('import')
  const datasetState = ref<DatasetState>(datasetStates.public)

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

  watch(selectedTab, async newValue => {
    mcpdImportUpdate.value = 'import'
    selectedSubTab.value = newValue ? tabGroups.value.get(newValue.group)?.[0] : undefined
  })
</script>
