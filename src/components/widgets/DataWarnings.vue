<template>
  <section v-if="store.storeUserIsDataCurator || (dataWarnings && dataWarnings.length > 0)" class="mb-5 g-no-gutters card-icon-avatar">
    <v-banner
      v-for="(warning, index) in dataWarnings"
      :key="`data-warning-${index}`"
      bg-color="warning"
    >
      <template #prepend>
        <v-avatar :icon="dataWarningTypes[warning.category].icon" v-tooltip:top="dataWarningTypes[warning.category].text" />
      </template>
      <template #text>
        <v-chip class="me-2" label :prepend-icon="mdiCalendar" v-if="warning.createdOn">{{ new Date(warning.createdOn).toLocaleDateString() }}</v-chip> {{ warning.description }}
      </template>
      <template #actions v-if="store.storeUserIsDataCurator">
        <v-btn size="small" :icon="mdiDelete" color="error" @click="deleteWarning(warning)" />
      </template>
    </v-banner>

    <v-btn
      :prepend-icon="mdiPlusBox"
      class="mt-3 mx-5"
      :text="$t('buttonAddDataWarning')"
      @click="addDataWarning"
      v-if="store.storeUserIsDataCurator"
    />

    <v-dialog
      v-model="addDialogVisible"
      scrollable
      max-width="min(1024px, 75vw)"
      v-if="newDataWarning"
    >
      <v-card :title="$t('modalTitleAddDataWarning')">
        <template #text>
          <v-select
            v-model="newDataWarning"
            :items="allDataWarnings"
            :label="$t('formLabelSelectDataWarning')"
            :hint="$t('formHintSelectDataWarning')"
            persistent-hint
            item-value="id"
            item-title="description"
            return-object
            clearable
            @click:clear="resetNewDataWarning"
            v-if="allDataWarnings && allDataWarnings.length > 0"
          >
            <template #selection="{ item }">
              <v-list-item density="compact" :prepend-icon="dataWarningTypes[item.category].icon" :title="item.description" v-if="item.id" />
            </template>
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :prepend-icon="dataWarningTypes[item.category].icon" />
            </template>
          </v-select>

          <template v-if="!newDataWarning.id">
            <v-textarea
              :label="$t('formLabelDataWarningDescription')"
              v-model="newDataWarning.description"
              required
            />

            <v-select
              v-model="newDataWarning.category"
              :label="$t('formLabelDataWarningCategory')"
              :items="Object.keys(dataWarningTypes)"
            >
              <template #selection="{ item }">
                <v-list-item density="compact" :prepend-icon="dataWarningTypes[item].icon" :title="dataWarningTypes[item].text" />
              </template>
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps" :prepend-icon="dataWarningTypes[item].icon" :title="dataWarningTypes[item].text" />
              </template>
            </v-select>
          </template>
        </template>

        <template #actions>
          <v-spacer />
          <v-btn :text="$t('buttonCancel')" :prepend-icon="mdiCancel" @click="resetNewDataWarning(); addDialogVisible = false;" />
          <v-btn @click="sendDataWarning" :text="$t('buttonSave')" :prepend-icon="mdiContentSave" color="primary" variant="tonal" :disabled="!(newDataWarning.id || (newDataWarning.description && newDataWarning.category))" />
        </template>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
  import { apiDeleteGermplasmDataWarning, apiGetDataWarnings, apiGetGermplasmDataWarnings, apiPutGermplasmDataWarning } from '@/plugins/api/germplasm'
  import { DatawarningsCategory, type Datawarnings } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import { mdiAlert, mdiCalendar, mdiCancel, mdiContentSave, mdiDelete, mdiFileCertificate, mdiFileDocumentAlert, mdiHelpRhombus, mdiHistory, mdiInvoiceTextArrowRight, mdiPlusBox } from '@mdi/js'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    germplasmId: number
  }>()

  const store = coreStore()
  const dataWarnings = ref<Datawarnings[]>([])
  const addDialogVisible = ref(false)
  const newDataWarning = ref<Datawarnings>()
  const allDataWarnings = ref<Datawarnings[]>([])

  const { t } = useI18n()

  interface DataWarningConfig {
    icon: string
    text: string
  }

  const dataWarningTypes: ComputedRef<{ [key: string]: DataWarningConfig }> = computed(() => {
    return {
      generic: {
        icon: mdiAlert,
        text: t('widgetDataWarningTypeGeneric'),
      },
      quality: {
        icon: mdiFileCertificate,
        text: t('widgetDataWarningTypeQuality'),
      },
      source: {
        icon: mdiInvoiceTextArrowRight,
        text: t('widgetDataWarningTypeSource'),
      },
      deprecated: {
        icon: mdiHistory,
        text: t('widgetDataWarningTypeDeprecated'),
      },
      missing: {
        icon: mdiHelpRhombus,
        text: t('widgetDataWarningTypeMissing'),
      },
      inaccuracy: {
        icon: mdiFileDocumentAlert,
        text: t('widgetDataWarningTypeInaccuracy'),
      },
    }
  })

  function resetNewDataWarning () {
    newDataWarning.value = {
      id: undefined,
      description: '',
      category: DatawarningsCategory.generic,
    }
  }

  function sendDataWarning () {
    if (!newDataWarning.value) {
      return
    }
    apiPutGermplasmDataWarning(compProps.germplasmId, newDataWarning.value, () => {
      update()
      resetNewDataWarning()
      addDialogVisible.value = false
    })
  }

  function addDataWarning () {
    resetNewDataWarning()

    if (allDataWarnings.value.length === 0) {
      apiGetDataWarnings(result => {
        const existing = new Set<number>()
        dataWarnings.value.forEach(dw => existing.add(dw.id || -1))
        allDataWarnings.value = result.filter(r => !existing.has(r.id || -1))

        nextTick(() => {
          addDialogVisible.value = true
        })
      })
    } else {
      nextTick(() => {
        addDialogVisible.value = true
      })
    }
  }

  function deleteWarning (item: Datawarnings) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteGermplasmDataWarning(compProps.germplasmId, item.id || -1, () => {
            update()
          }, {
            codes: [404],
            callback: () => {
              // Do nothing here, it just means there is nothing to delete
            },
          })
        }
      },
    })
  }

  function update () {
    apiGetGermplasmDataWarnings(compProps.germplasmId, result => {
      dataWarnings.value = result
    })
  }

  onMounted(() => update())
</script>
