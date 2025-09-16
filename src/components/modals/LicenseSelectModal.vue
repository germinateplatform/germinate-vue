<template>
  <div>
    <v-dialog v-model="dialog" max-width="min(90vw, 1024px)">
      <v-card :title="$t('modalTitleLicenseCreation')">
        <v-card-text>
          <v-form @submit.prevent>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  :items="licenses"
                  v-model="selectedLicense"
                  return-object
                  append-icon="mdi-square-edit-outline"
                  item-title="licenseName"
                  @click:append="toggleDetails"
                />

                <v-btn prepend-icon="mdi-plus-box" variant="tonal" @click="addNewLicense" color="success" :text="$t('buttonLicenseCreateNew')" />
              </v-col>
              <v-col cols="12" v-if="selectedLicense">
                <v-expansion-panels
                  v-model="detailsVisible"
                >
                  <v-expansion-panel value="details">
                    <template #text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="selectedLicense.licenseName"
                            :label="$t('formLabelLicenseName')"
                            required
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="selectedLicense.licenseDescription"
                            :label="$t('formLabelLicenseDescription')"
                          />
                        </v-col>

                        <v-col cols="12" v-if="selectedLicense.licenseData">
                          <v-tabs
                            v-model="localeTab"
                            fixed-tabs
                            center-active
                            grow
                          >
                            <v-tab
                              v-for="(locale, localeIndex) in locales"
                              :key="`locale-tab-${locale.locale}`"
                              :value="localeIndex + 1"
                            >
                              <template #prepend>
                                <v-icon><i :class="'fi fi-' + locale.flag"/></v-icon>
                              </template> <span>{{ locale.name || locale.locale }}</span>
                            </v-tab>
                          </v-tabs>
                          <v-tabs-window v-model="localeTab">
                            <v-tabs-window-item
                              v-for="(locale, localeIndex) in locales"
                              :key="`locale-tab-content-${locale.locale}`"
                              :value="localeIndex + 1"
                            >
                              <v-row>
                                <v-col cols="12" md="6">
                                  <v-textarea
                                    class="license-modal-height"
                                    :placeholder="$t('formPlaceholderLicenseHtml')"
                                    v-model="selectedLicense.licenseData[locale.locale]"
                                  />
                                </v-col>
                                <v-col cols="12" md="6">
                                  <div v-html="selectedLicense.licenseData[locale.locale] || $t('formPlaceholderLicenseHtmlPreview')" class="license-modal-height-preview" />
                                </v-col>
                              </v-row>
                            </v-tabs-window-item>
                          </v-tabs-window>
                        </v-col>
                      </v-row>

                      <v-btn color="primary" @click="saveLicense" :disabled="!canSaveLicense" prepend-icon="mdi-content-save" :text="$t('buttonSave')" />
                    </template>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn :text="$t('buttonCancel')" @click="hide" />
          <v-btn :disabled="!formValid" color="success" variant="flat" @click="onSubmit">{{ $t('buttonSave') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { apiGetLicenses, apiPatchLicense, apiPutLicense } from '@/plugins/api/dataset'
  import { apiGetLocales } from '@/plugins/api/misc'
  import type { LocaleConfig, ViewTableLicenseDefinitions } from '@/plugins/types/germinate'
  import { isAnyMissing } from '@/plugins/util/formatting'
  import { useI18n } from 'vue-i18n'

  const compProps = defineProps<{
    licenseId?: number
  }>()

  const emit = defineEmits(['license-changed'])

  const { t } = useI18n()

  const dialog = ref(false)
  const detailsVisible = ref<string>()
  const localeTab = ref(1)

  const locales = ref<LocaleConfig[]>([])
  const licenses = ref<ViewTableLicenseDefinitions[]>([])
  const selectedLicense = ref<ViewTableLicenseDefinitions>()

  const formValid = computed(() => {
    return selectedLicense.value !== undefined && selectedLicense.value.licenseId !== undefined
  })

  const canSaveLicense = computed(() => {
    if (detailsVisible.value) {
      // @ts-ignore
      return !isAnyMissing(selectedLicense.value?.licenseName) && selectedLicense.value?.licenseData && locales.value.some(l => !isAnyMissing(selectedLicense.value?.licenseData[l.locale]))
    } else {
      return false
    }
  })

  function addNewLicense () {
    selectedLicense.value = {
      licenseName: t('formSelectOptionLicenseNone'),
      licenseData: {},
    }

    detailsVisible.value = 'details'
  }

  function show () {
    detailsVisible.value = undefined
    dialog.value = true

    if (locales.value && locales.value.length > 0) {
      updateLicenses(compProps.licenseId)
    } else {
      apiGetLocales<LocaleConfig[]>(result => {
        locales.value = result || [{
          name: 'British English',
          locale: 'en_GB',
          flag: 'gb',
        }]

        updateLicenses(compProps.licenseId)
      })
    }
  }
  function hide () {
    dialog.value = false
  }

  function onSubmit () {
    emit('license-changed', selectedLicense.value?.licenseId)
    hide()
  }

  function saveLicense () {
    if (!selectedLicense.value) {
      return
    }

    if (selectedLicense.value.licenseId) {
      apiPatchLicense<boolean>(selectedLicense.value.licenseId, selectedLicense.value, result => {
        if (result) {
          detailsVisible.value = undefined
          updateLicenses(selectedLicense.value?.licenseId)
        }
      })
    } else {
      // Create a new license
      apiPutLicense<number>(selectedLicense.value, result => {
        if (result) {
          detailsVisible.value = undefined
          updateLicenses(result)
        }
      })
    }
  }

  function toggleDetails () {
    if (detailsVisible.value) {
      detailsVisible.value = undefined
    } else {
      detailsVisible.value = 'details'
    }
  }

  defineExpose({
    show,
    hide,
  })

  function updateLicenses (toSelect?: number) {
    apiGetLicenses<ViewTableLicenseDefinitions[]>(result => {
      licenses.value = result || []

      if (toSelect) {
        selectedLicense.value = licenses.value.find(l => l.licenseId === toSelect)
      } else {
        selectedLicense.value = undefined
      }
    })
  }
</script>

<style>
.license-modal-height textarea,
.license-modal-height-preview {
  height: 50vh;
  overflow-y: auto;
}
</style>
