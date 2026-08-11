<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageGerminateSettingsTitle') }}</h1>
    <v-divider class="mb-3" />

    <p>{{ $t('pageGerminateSettingsText') }}</p>

    <template v-if="settings">
      <div class="masonry" :style="{ columnCount }">
        <v-card class="mb-5" :title="$t('pageGerminateSettingsCardColors')" :prepend-icon="mdiTune">
          <template #text>
            <v-color-input
              v-model="settings.colorPrimary"
              hide-details
              pip-variant="tonal"
              color-pip
              :mode="colorMode"
              autocomplete="off"
              :label="$t('formLabelAdminSettingsColorPrimary')"
              :picker-props="{
                'onUpdate:mode': (m: any) => { colorMode = m },
              }"
            />
            <!-- TEMPLATE COLORS -->
            <h3>{{ $t('formLabelAdminSettingsColorTemplate') }}</h3>
            <v-sheet border rounded ref="colorsTemplateParent" class="flex-grow-1 pa-2">
              <v-chip
                v-for="(color, index) in colorsTemplate"
                :key="`template-chip-${color}-${index}`"
                label
                class="me-2 mb-1"
                :text="color"
                :color="color"
                variant="flat"
                :closable="colorsTemplate.length > 1"
                @click:close="removeTemplateColor(index)"
              />
            </v-sheet>
            <v-color-input
              v-model="newTemplateColor"
              class="mt-2"
              hide-details
              pip-variant="tonal"
              color-pip
              :mode="colorMode"
              autocomplete="off"
              :label="$t('formLabelChartColorsNew')"
              :picker-props="{
                'onUpdate:mode': (m: any) => { colorMode = m },
              }"
            >
              <template #append>
                <v-btn :icon="mdiEyedropperPlus" @click="addTemplateColor" :disabled="!newTemplateColor" />
              </template>
            </v-color-input>
            <!-- CHART COLORS -->
            <h3>{{ $t('formLabelAdminSettingsColorChart') }}</h3>
            <v-sheet border rounded ref="colorsChartsParent" class="flex-grow-1 pa-2">
              <v-chip
                v-for="(color, index) in colorsCharts"
                :key="`template-chip-${color}-${index}`"
                label
                class="me-2 mb-1"
                :text="color"
                :color="color"
                variant="flat"
                :closable="colorsCharts.length > 1"
                @click:close="removeChartColor(index)"
              />
            </v-sheet>
            <v-color-input
              v-model="newChartColor"
              class="mt-2"
              hide-details
              pip-variant="tonal"
              color-pip
              :mode="colorMode"
              autocomplete="off"
              :label="$t('formLabelChartColorsNew')"
              :picker-props="{
                'onUpdate:mode': (m: any) => { colorMode = m },
              }"
            >
              <template #append>
                <v-btn :icon="mdiEyedropperPlus" @click="addChartColor" :disabled="!newChartColor" />
              </template>
            </v-color-input>
          </template>
        </v-card>
        <v-card class="mb-5" :title="$t('pageGerminateSettingsCardToggles')" :prepend-icon="mdiTune">
          <template #text>
            <v-list slim density="compact">
              <v-list-item :base-color="getTemplateColor(0)" :title="$t('formLabelAdminSettingsToggleBrapi')" prepend-icon="$brapi" @click="settings.brapiEnabled = !settings.brapiEnabled">
                <template #append><v-switch density="compact" :model-value="settings.brapiEnabled" :color="getTemplateColor(0)" hide-details /></template>
              </v-list-item>
              <v-list-item :base-color="getTemplateColor(1)" :title="$t('formLabelAdminSettingsTogglePdci')" :prepend-icon="mdiCalculatorVariant" @click="settings.pdciEnabled = !settings.pdciEnabled">
                <template #append><v-switch density="compact" :model-value="settings.pdciEnabled" :color="getTemplateColor(1)" hide-details /></template>
              </v-list-item>
              <v-list-item :base-color="getTemplateColor(2)" :title="$t('formLabelAdminSettingsToggleGdpr')" :prepend-icon="mdiCookieLock" @click="settings.showGdprNotification = !settings.showGdprNotification">
                <template #append><v-switch density="compact" :model-value="settings.showGdprNotification" :color="getTemplateColor(2)" hide-details /></template>
              </v-list-item>
              <v-list-item :base-color="getTemplateColor(3)" :title="$t('formLabelAdminSettingsToggleComments')" :prepend-icon="mdiCommentTextMultiple" @click="settings.commentsEnabled = !settings.commentsEnabled">
                <template #append><v-switch density="compact" :model-value="settings.commentsEnabled" :color="getTemplateColor(3)" hide-details /></template>
              </v-list-item>
            </v-list>
          </template>
        </v-card>
        <v-card class="mb-5" :title="$t('formLabelAdminSettingsTemplateDashboardCategories')" :prepend-icon="mdiViewDashboardVariant">
          <template #text>
            <v-row>
              <v-col cols="12" md="6" class="d-flex flex-column">
                <h3>{{ $t('formLabelAdminSettingsTemplateDashboardCategories') }}</h3>
                <v-sheet border rounded ref="usedCategoryParent" class="flex-grow-1 pa-3">
                  <v-chip
                    v-for="element in usedDashboardCategories"
                    :key="`category-chip-${element.value}`"
                    label
                    class="me-2 mb-1"
                    :text="$t(element.text)"
                    :prepend-icon="element.path"
                  />
                </v-sheet>
                <v-btn :text="$t('buttonShowAll')" :prepend-icon="mdiChevronDoubleLeft" class="mt-3" @click="toggleCategories('show')" />
              </v-col>
              <v-col cols="12" md="6" class="d-flex flex-column">
                <h3>{{ $t('formLabelAdminSettingsTemplateDashboardCategoriesHidden') }}</h3>
                <v-sheet border rounded ref="unusedCategoryParent" class="flex-grow-1 pa-3">
                  <v-chip
                    v-for="element in unusedDashboardCategories"
                    :key="`category-chip-${element.value}`"
                    label
                    class="me-2 mb-1"
                    :text="$t(element.text)"
                    :prepend-icon="element.path"
                  />
                </v-sheet>
                <v-btn :text="$t('buttonHideAll')" :append-icon="mdiChevronDoubleRight" class="mt-3" @click="toggleCategories('hide')" />
              </v-col>
            </v-row>
          </template>
        </v-card>
        <v-card class="mb-5" :title="$t('formLabelAdminSettingsTemplateDashboardCategories')" :prepend-icon="mdiViewDashboardVariant">
          <template #text>
            <v-row>
              <v-col cols="12" md="6" class="d-flex flex-column">
                <h3>{{ $t('formLabelAdminSettingsTemplateDashboardSections') }}</h3>
                <v-sheet border rounded ref="usedSectionParent" class="flex-grow-1 pa-2">
                  <v-chip
                    v-for="element in usedDashboardSections"
                    :key="`section-chip-${element.value}`"
                    label
                    class="me-2 mb-1"
                    :text="$t(element.text)"
                    :prepend-icon="element.path"
                  />
                </v-sheet>
                <v-btn :text="$t('buttonShowAll')" :prepend-icon="mdiChevronDoubleLeft" class="mt-3" @click="toggleSections('show')" />
              </v-col>
              <v-col cols="12" md="6" class="d-flex flex-column">
                <h3>{{ $t('formLabelAdminSettingsTemplateDashboardSectionsHidden') }}</h3>
                <v-sheet border rounded ref="unusedSectionParent" class="flex-grow-1 pa-2">
                  <v-chip
                    v-for="element in unusedDashboardSections"
                    :key="`section-chip-${element.value}`"
                    label
                    class="me-2 mb-1"
                    :text="$t(element.text)"
                    :prepend-icon="element.path"
                  />
                </v-sheet>
                <v-btn :text="$t('buttonHideAll')" :append-icon="mdiChevronDoubleRight" class="mt-3" @click="toggleSections('hide')" />
              </v-col>
            </v-row>
          </template>
        </v-card>
        <v-card class="mb-5" :title="$t('pageGerminateSettingsCardBackups')" :prepend-icon="mdiBackupRestore">
          <template #text>
            <v-number-input
              v-model="settings.databaseBackupEveryDays"
              class="mb-3"
              :label="$t('formLabelAdminSettingsBackupEveryDays')"
              :hint="$t('formDescriptionAdminSettingsBackupEveryDays')"
              persistent-hint
              :min="1"
              :max="30"
              :step="1"
              control-variant="stacked"
            >
              <template #append-inner><span class="me-2">{{ $t('genericDays') }}</span></template>
            </v-number-input>

            <v-number-input
              v-model="settings.databaseBackupMaxSizeGB"
              class="mb-3"
              :label="$t('formLabelAdminSettingsBackupMaxSizeGb')"
              :hint="$t('formDescriptionAdminSettingsBackupMaxSizeGb')"
              persistent-hint
              :min="0.001"
              :precision="null"
              control-variant="stacked"
            >
              <template #append-inner><span class="me-2">GB</span></template>
            </v-number-input>
          </template>
        </v-card>
        <v-card class="mb-5" :title="$t('pageGerminateSettingsCardGatekeeper')" :prepend-icon="mdiAccountLockOpen">
          <template #text>
            <v-text-field
              v-model="settings.gatekeeperUrl"
              class="mb-3"
              type="url"
              :label="$t('formLabelAdminSettingsGatekeeperUrl')"
              hide-details
            />
            <v-text-field
              v-model="settings.gatekeeperUsername"
              class="mb-3"
              :label="$t('formLabelAdminSettingsGatekeeperUsername')"
              hide-details
            />
            <v-text-field
              v-model="settings.gatekeeperPassword"
              class="mb-3"
              type="password"
              :label="$t('formLabelAdminSettingsGatekeeperPassword')"
              hide-details
            />
            <v-switch
              v-model="settings.registrationEnabled"
              :label="$t('formLabelAdminSettingsGatekeeperRegistrationEnabled')"
              hide-details
              color="primary"
            />
            <v-switch
              v-model="settings.gatekeeperRegistrationRequiresApproval"
              :label="$t('formLabelAdminSettingsGatekeeperRegistrationRequiresApproval')"
              hide-details
              :disabled="settings.registrationEnabled === false"
              color="primary"
            />
          </template>
        </v-card>

        <v-card class="mb-5 text-wrap" :title="$t('pageGerminateSettingsCardAdvanced')" :prepend-icon="mdiShieldAlert" color="error" variant="outlined">
          <template #subtitle><span class="text-error">{{ $t('pageGerminateSettingsCardAdvancedWarning') }}</span></template>

          <template #text>
            <div class="text-surface-variant">
              <div class="text-title-small mt-3">{{ $t('formLabelAdminSettingsAuthMode') }}</div>
              <v-btn-toggle
                variant="tonal"
                class="d-flex"
                :direction="(xs || mdAndUp) ? 'horizontal' : 'vertical'"
                color="primary"
                mandatory
                v-model="settings.authMode"
              >
                <v-btn class="flex-grow-1" :value="AuthenticationMode.NONE" :prepend-icon="mdiLockOpenVariant" text="NONE" />
                <v-btn class="flex-grow-1" :value="AuthenticationMode.SELECTIVE" :prepend-icon="mdiLockOpen" text="SELECTIVE" />
                <v-btn class="flex-grow-1" :value="AuthenticationMode.FULL" :prepend-icon="mdiLock" text="FULL" />
              </v-btn-toggle>
              <div class="v-input__details mb-3">
                <div class="v-messages">
                  <span class="v-messages__message" v-html="authModeHint" />
                </div>
              </div>

              <div class="text-title-small mt-3">{{ $t('formLabelAdminSettingsDataImportMode') }}</div>
              <v-btn-toggle
                variant="tonal"
                class="d-flex"
                :direction="(xs || mdAndUp) ? 'horizontal' : 'vertical'"
                color="primary"
                mandatory
                divided
                v-model="settings.dataImportMode"
              >
                <v-btn class="flex-grow-1" :value="DataImportMode.NONE" :prepend-icon="mdiCancel" text="NONE" />
                <v-btn class="flex-grow-1" :value="DataImportMode.VERIFY" :prepend-icon="mdiFormatListChecks" text="VERIFY" />
                <v-btn class="flex-grow-1" :value="DataImportMode.IMPORT" :prepend-icon="mdiDatabaseImport" text="IMPORT" />
              </v-btn-toggle>
              <div class="v-input__details mb-3">
                <div class="v-messages">
                  <span class="v-messages__message" v-html="importModeHint" />
                </div>
              </div>

              <v-text-field
                v-model="settings.plausibleDomain"
                class="mb-3"
                :label="$t('formLabelAdminSettingsPlausibleDomain')"
                hide-details
              />
              <v-text-field
                v-model="settings.plausibleApiHost"
                class="mb-3"
                type="url"
                :label="$t('formLabelAdminSettingsPlausibleApiHost')"
                hide-details
              />
              <v-text-field
                v-model="settings.externalLinkIdentifier"
                class="mb-3"
                :label="$t('formLabelAdminSettingsExternalLinkId')"
                hide-details
              />
              <v-text-field
                v-model="settings.externalLinkTemplate"
                class="mb-3"
                type="url"
                :label="$t('formLabelAdminSettingsExternalLinkTemplate')"
                hide-details
              />
              <v-number-input
                v-model="settings.filesDeleteAfterHoursAsync"
                class="mb-3"
                :label="$t('formLabelAdminSettingsFilesDeletedAfterAsync')"
                persistent-hint
                :min="1"
                :step="1"
                control-variant="stacked"
              >
                <template #append-inner><span class="me-2">{{ $t('genericHours') }}</span></template>
              </v-number-input>
              <v-number-input
                v-model="settings.filesDeleteAfterHoursTemp"
                class="mb-3"
                :label="$t('formLabelAdminSettingsFilesDeletedAfterTemp')"
                persistent-hint
                :min="1"
                :step="1"
                control-variant="stacked"
              >
                <template #append-inner><span class="me-2">{{ $t('genericHours') }}</span></template>
              </v-number-input>
              <v-switch
                v-model="settings.hiddenPagesAutodiscover"
                :label="$t('formLabelAdminSettingsHiddenPagesAutodiscover')"
                color="primary"
                hide-details
              />
            </div>
          </template>
        </v-card>
      </div>

      <v-btn :text="$t('buttonSaveSettings')" :prepend-icon="mdiContentSaveAlert" color="primary" class="mt-5" @click="save" />
    </template>
  </v-container>
</template>

<route lang="yaml">
name: germinateSettings
</route>

<script setup lang="ts">
  import { apiGetAdminSettings, apiPostAdminSettings } from '@/plugins/api/setting'
  import { AuthenticationMode, DataImportMode, type ClientAdminConfiguration } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { dashboardSections, statCategories, type IsCountState, type LinkState, type OverviewStatsState, type PathState, type TextState, type ValueState } from '@/plugins/util/types'
  import { mdiCookieLock, mdiCalculatorVariant, mdiCommentTextMultiple, mdiTune, mdiViewDashboardVariant, mdiBackupRestore, mdiLockOpenVariant, mdiLockOpen, mdiLock, mdiCancel, mdiFormatListChecks, mdiDatabaseImport, mdiAccountLockOpen, mdiShieldAlert, mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiEyedropperPlus, mdiContentSaveAlert } from '@mdi/js'
  import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
  import { useDisplay, useTheme } from 'vuetify'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'
  import { coreStore } from '@/stores/app'
  import { Pages } from '@/plugins/pages'

  const { t } = useI18n()
  const store = coreStore()
  const router = useRouter()
  const theme = useTheme()

  const { name, mdAndUp, xs } = useDisplay()
  const columnCount = computed(() => {
    switch (name.value) {
      case 'xs':
        return 1
      case 'sm':
      case 'md':
      case 'lg':
      case 'xl':
        return 2
      default:
        return 3
    }
  })

  const settings = ref<ClientAdminConfiguration>()
  const newTemplateColor = ref<string>()
  const newChartColor = ref<string>()
  const colorMode = ref<'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hex' | 'hexa'>('hex')

  type DashboardCategory = OverviewStatsState & TextState & PathState & LinkState & IsCountState
  type DashboardSection = ValueState & TextState & PathState

  const [colorsTemplateParent, colorsTemplate] = useDragAndDrop<string>([])
  const [colorsChartsParent, colorsCharts] = useDragAndDrop<string>([])

  const [usedCategoryParent, usedDashboardCategories] = useDragAndDrop<DashboardCategory>([], { group: 'categoryChips' })
  const [unusedCategoryParent, unusedDashboardCategories] = useDragAndDrop<DashboardCategory>([], { group: 'categoryChips' })

  const [usedSectionParent, usedDashboardSections] = useDragAndDrop<DashboardSection>([], { group: 'sectionChips' })
  const [unusedSectionParent, unusedDashboardSections] = useDragAndDrop<DashboardSection>([], { group: 'sectionChips' })

  const authModeHint = computed(() => {
    switch (settings.value?.authMode) {
      case AuthenticationMode.NONE:
        return t('pageGerminateSettingsCardAuthModeNoneExplanation')
      case AuthenticationMode.SELECTIVE:
        return t('pageGerminateSettingsCardAuthModeSelectiveExplanation')
      case AuthenticationMode.FULL:
        return t('pageGerminateSettingsCardAuthModeFullExplanation')
    }
  })

  const importModeHint = computed(() => {
    switch (settings.value?.dataImportMode) {
      case DataImportMode.NONE:
        return t('pageGerminateSettingsCardImportModeNoneExplanation')
      case DataImportMode.VERIFY:
        return t('pageGerminateSettingsCardImportModeVerifyExplanation')
      case DataImportMode.IMPORT:
        return t('pageGerminateSettingsCardImportModeImportExplanation')
    }
  })

  function removeTemplateColor (index: number) {
    colorsTemplate.value = colorsTemplate.value.filter((_, i) => i !== index)
  }

  function removeChartColor (index: number) {
    colorsCharts.value = colorsCharts.value.filter((_, i) => i !== index)
  }

  function addTemplateColor () {
    if (newTemplateColor.value) {
      colorsTemplate.value = [...colorsTemplate.value, newTemplateColor.value]
      newTemplateColor.value = undefined
    }
  }

  function addChartColor () {
    if (newChartColor.value) {
      colorsCharts.value = [...colorsCharts.value, newChartColor.value]
      newChartColor.value = undefined
    }
  }

  function toggleSections (direction: 'show' | 'hide') {
    if (settings.value) {
      if (direction === 'show') {
        usedDashboardSections.value = Object.values(dashboardSections)
        unusedDashboardSections.value = []
      } else {
        unusedDashboardSections.value = Object.values(dashboardSections)
        usedDashboardSections.value = []
      }
    }
  }

  function toggleCategories (direction: 'show' | 'hide') {
    if (settings.value) {
      if (direction === 'show') {
        usedDashboardCategories.value = Object.values(statCategories)
        unusedDashboardCategories.value = []
      } else {
        unusedDashboardCategories.value = Object.values(statCategories)
        usedDashboardCategories.value = []
      }
    }
  }

  function save () {
    const s = settings.value
    if (s) {
      emitter.emit('show-confirm', {
        title: t('modalTitleConfirm'),
        message: t('modalTitleSure'),
        okTitle: t('genericYes'),
        cancelTitle: t('genericNo'),
        okVariant: 'error',
        needsConfirmation: true,
        callback: (result: boolean) => {
          if (result === true) {
            apiPostAdminSettings(s, result => {
              if (result) {
                store.setServerSettings(result)
                theme.themes.value.light.colors.primary = result.colorPrimary
                theme.themes.value.dark.colors.primary = result.colorPrimary

                if (result.authMode === AuthenticationMode.FULL) {
                  router.push(Pages.login.path)
                } else {
                  router.push(Pages.home.path)
                }

                store.setToken(undefined)
              }
            })
          }
        },
      })
    }
  }

  watchEffect(() => {
    if (settings.value) {
      settings.value.dashboardCategories = usedDashboardCategories.value.map(c => c.value)
      settings.value.dashboardSections = usedDashboardSections.value.map(c => c.value)
      settings.value.colorsTemplate = colorsTemplate.value.concat()
      settings.value.colorsCharts = colorsCharts.value.concat()
    }
  })

  onMounted (() => {
    apiGetAdminSettings(result => {
      settings.value = result

      const allCategories = Object.keys(statCategories).filter(k => statCategories[k].isCount === true)
      usedDashboardCategories.value = result.dashboardCategories.map(c => statCategories[c])
      unusedDashboardCategories.value = allCategories.filter(c => !result.dashboardCategories.includes(c)).map(c => statCategories[c])

      const allSections = Object.keys(dashboardSections)
      usedDashboardSections.value = result.dashboardSections.map(c => dashboardSections[c])
      unusedDashboardSections.value = allSections.filter(c => !result.dashboardSections.includes(c)).map(c => dashboardSections[c])

      colorsTemplate.value = result.colorsTemplate.concat()
      colorsCharts.value = result.colorsCharts.concat()
    })
  })
</script>

<style scoped>
.masonry {
  column-count: 3;
  column-gap: 16px;
}

.masonry-item {
  break-inside: avoid; /* prevents a card being split across columns */
  margin-bottom: 16px;
  display: inline-block; /* helps some browsers with break-inside */
  width: 100%;
}
</style>
