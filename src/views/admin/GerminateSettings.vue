<template>
  <div>
    <h1>{{ $t('pageGerminateSettingsTitle') }}</h1>
    <b-button @click="reload"><i class="mdi mdi-18px mdi-reload" /> {{ $t('buttonReload') }}</b-button>
    <p>{{ $t('pageGerminateSettingsText') }}</p>
    <b-form id="admin-form" @submit.prevent="saveSettings" autocomplete="off" v-if="settings">
      <b-row>
        <b-col cols=12 xl=6>
          <b-card :title="$t('pageGerminateSettingsCardColors')">
            <b-form-group :label="$t('formLabelAdminSettingsColorPrimary')" label-for="primary-color">
              <b-form-input type="color" v-model="settings.colorPrimary" class="d-inline" id="primary-color" />
            </b-form-group>

            <b-form-group :label="$t('formLabelAdminSettingsColorChart')" label-for="chart-color">
              <draggable v-model="settings.colorsCharts">
                <span class="badge b-form-tag d-inline-flex align-items-baseline mw-100 p-1 m-1 badge-secondary" :style="{ backgroundColor: color, color: getHighContrastTextColor(color) }" v-for="(color, index) in settings.colorsCharts" :key="`chart-color-${index}-${color}`">
                  <span class="b-form-tag-content flex-grow-1 text-truncate">{{ color }}</span>
                  <button type="button" class="close b-form-tag-remove" @click="removeChartColor(index)">×</button>
                </span>
              </draggable>
              <b-input-group class="d-inline-flex align-items-center w-auto mt-2">
                <b-form-input type="color" v-model="tempChartColor" class="d-inline" />
                <b-input-group-addon>
                  <b-button @click="addTempChartColor"><i class="mdi mdi-plus-box" /></b-button>
                </b-input-group-addon>
              </b-input-group>
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsColorTemplate')" label-for="template-color">
              <draggable v-model="settings.colorsTemplate">
                <span class="badge b-form-tag d-inline-flex align-items-baseline mw-100 p-1 m-1 badge-secondary" :style="{ backgroundColor: color, color: getHighContrastTextColor(color) }" v-for="(color, index) in settings.colorsTemplate" :key="`template-color-${index}-${color}`">
                  <span class="b-form-tag-content flex-grow-1 text-truncate">{{ color }}</span>
                  <button type="button" class="close b-form-tag-remove" @click="removeTemplateColor(index)">×</button>
                </span>
              </draggable>
              <b-input-group class="d-inline-flex align-items-center w-auto mt-2">
                <b-form-input type="color" v-model="tempTemplateColor" class="d-inline" />
                <b-input-group-addon>
                  <b-button @click="addTempTemplateColor"><i class="mdi mdi-plus-box" /></b-button>
                </b-input-group-addon>
              </b-input-group>
            </b-form-group>
          </b-card>
        </b-col>
        <b-col cols=12 xl=6>
          <b-card :title="$t('pageGerminateSettingsCardToggles')">
            <b-row>
              <b-col cols=6>
                <b-card :class="`toggle-card ${settings.brapiEnabled ? 'active' : null}`" :style="{ backgroundColor: settings.brapiEnabled ? settings.colorsTemplate[0] : null }" @click="settings.brapiEnabled = !settings.brapiEnabled">
                  <div class="d-flex justify-content-between">
                    <svg class="toggle-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.999 60">
                      <path d="M14.4 0A14.4 14.4 0 0 0 0 14.4a14.4 14.4 0 0 0 14.4 14.4h14.4V14.4A14.4 14.4 0 0 0 14.4 0ZM45.6 0A14.4 14.4 0 0 1 60 14.4a14.4 14.4 0 0 1-14.4 14.4H31.2V14.4A14.4 14.4 0 0 1 45.6 0ZM14.4 60A14.4 14.4 0 0 1 0 45.6a14.4 14.4 0 0 1 14.4-14.4h14.4v14.4A14.4 14.4 0 0 1 14.4 60ZM45.6 60A14.4 14.4 0 0 0 60 45.6a14.4 14.4 0 0 0-14.4-14.4H31.2v14.4A14.4 14.4 0 0 0 45.6 60z" />
                    </svg>
                    <div class="text-right">
                      <b-card-title>{{ $t('formLabelAdminSettingsToggleBrapi') }}</b-card-title>
                      <b-form-checkbox disabled id="brapi" v-model="settings.brapiEnabled" switch />
                    </div>
                  </div>
                </b-card>
              </b-col>

              <b-col cols=6>
                <b-card :class="`toggle-card ${settings.commentsEnabled ? 'active' : null}`" :style="{ backgroundColor: settings.commentsEnabled ? settings.colorsTemplate[1] : null }" @click="settings.commentsEnabled = !settings.commentsEnabled">
                  <div class="d-flex justify-content-between">
                    <i class="toggle-card-icon mdi mdi-48px mdi-comment-text-multiple-outline" />
                    <div class="text-right">
                      <b-card-title>{{ $t('formLabelAdminSettingsToggleComments') }}</b-card-title>
                      <b-form-checkbox disabled id="comments" v-model="settings.commentsEnabled" switch />
                    </div>
                  </div>
                </b-card>
              </b-col>

              <b-col cols=6>
                <b-card :class="`toggle-card ${settings.pdciEnabled ? 'active' : null}`" :style="{ backgroundColor: settings.pdciEnabled ? settings.colorsTemplate[2] : null }" @click="settings.pdciEnabled = !settings.pdciEnabled">
                  <div class="d-flex justify-content-between">
                    <i class="toggle-card-icon mdi mdi-48px mdi-shield-alert-outline" />
                    <div class="text-right">
                      <b-card-title>{{ $t('formLabelAdminSettingsToggleGdpr') }}</b-card-title>
                      <b-form-checkbox disabled id="gdpc" v-model="settings.pdciEnabled" switch />
                    </div>
                  </div>
                </b-card>
              </b-col>

              <b-col cols=6>
                <b-card :class="`toggle-card ${settings.showGdprNotification ? 'active' : null}`" :style="{ backgroundColor: settings.showGdprNotification ? settings.colorsTemplate[3] : null }" @click="settings.showGdprNotification = !settings.showGdprNotification">
                  <div class="d-flex justify-content-between">
                    <i class="toggle-card-icon mdi mdi-48px mdi-calculator-variant-outline" />
                    <div class="text-right">
                      <b-card-title>{{ $t('formLabelAdminSettingsTogglePdci') }}</b-card-title>
                      <b-form-checkbox disabled id="pdci" v-model="settings.showGdprNotification" switch />
                    </div>
                  </div>
                </b-card>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
        <b-col cols=12 md=6>
          <b-card :title="$t('pageGerminateSettingsCardGatekeeper')">
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperUrl')" label-for="gatekeeper-url">
              <b-form-input type="url" id="gatekeeper-url" v-model="settings.gatekeeperUrl" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperUsername')" label-for="gatekeeper-username">
              <b-form-input id="gatekeeper-username" v-model="settings.gatekeeperUsername" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperPassword')" label-for="gatekeeper-password">
              <b-form-input type="password" id="gatekeeper-password" autocomplete="new-password" v-model="settings.gatekeeperPassword" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperRegistrationEnabled')" label-for="gatekeeper-registration">
              <b-form-checkbox id="gatekeeper-registration" v-model="settings.registrationEnabled" switch />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperRegistrationRequiresApproval')" label-for="gatekeeper-registration-req">
              <b-form-checkbox id="gatekeeper-registration-req" v-model="settings.gatekeeperRegistrationRequiresApproval" switch />
            </b-form-group>
          </b-card>
        </b-col>
        <b-col cols=12 md=6>
          <b-card :title="$t('pageGerminateSettingsCardTemplate')">
            <b-form-group :label="$t('formLabelAdminSettingsTemplateDashboardCategories')" label-for="dashboard-categories">
              <b-form-checkbox-group stacked :options="statCategories" v-model="settings.dashboardCategories" id="dashboard-categories" />
            </b-form-group>
            <a href="#" @click.prevent="selectAllCategories(true)">{{ $t('buttonSelectAll') }}</a> | <a href="#" @click.prevent="selectAllCategories(false)">{{ $t('buttonDeselectAll') }}</a>
          </b-card>
        </b-col>
        <b-col cols=12 md=6>
          <b-card border-variant="danger">
            <b-card-title class="text-danger">{{ $t('pageGerminateSettingsCardAdvanced') }}</b-card-title>

            <b-card-sub-title class="mb-3">{{ $t('pageGerminateSettingsCardAdvancedWarning') }}</b-card-sub-title>

            <b-form-group :label="$t('formLabelAdminSettingsAuthMode')" label-for="data-import-mode" :description="authModeDescription ? $t(authModeDescription) : null">
              <b-form-select :options="authenticationModes" v-model="settings.authMode" id="data-import-mode" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsDataImportMode')" label-for="auth-mode" :description="dataImportModeDescription ? $t(dataImportModeDescription) : null">
              <b-form-select :options="dataImportModes" v-model="settings.dataImportMode" id="auth-mode" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsGoogleAnalytics')" label-for="google-analytics">
              <b-form-input id="google-analytics" v-model="settings.googleAnalyticsKey" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsPlausibleDomain')" label-for="plausible-domain">
              <b-form-input id="plausible-domain" v-model="settings.plausibleDomain" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsPlausibleApiHost')" label-for="plausible-api-host">
              <b-form-input id="plausible-api-host" v-model="settings.plausibleApiHost" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsExternalLinkId')" label-for="external-link-id">
              <b-form-input id="external-link-id" v-model="settings.externalLinkIdentifier" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsExternalLinkTemplate')" label-for="external-link-template">
              <b-form-input id="external-link-template" v-model="settings.externalLinkTemplate" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsFilesDeletedAfterAsync')" label-for="delete-async-files">
              <b-form-input type="number" v-model.number="settings.filesDeleteAfterHoursAsync" id="delete-async-files" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsFilesDeletedAfterTemp')" label-for="delete-temp-files">
              <b-form-input type="number" v-model.number="settings.filesDeleteAfterHoursTemp" id="delete-temp-files" />
            </b-form-group>
          </b-card>
        </b-col>
      </b-row>
      <b-button type="submit" variant="primary"><i class="mdi mdi-18px mdi-upload" /> {{ $t('buttonSubmit') }}</b-button>
    </b-form>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

import colorMixin from '@/mixins/colors.js'
import typeMixin from '@/mixins/types.js'
import miscApi from '@/mixins/api/misc.js'

const emitter = require('tiny-emitter/instance')

const defaults = {
  colorPrimary: '#20a8d8',
  colorsCharts: ['#00a0f1', '#5ec418', '#910080', '#222183', '#ff7c00', '#c5e000', '#c83831', '#ff007a', '#fff600'],
  colorsTemplate: ['#FF9E15', '#799900', '#00748C', '#853175', '#555559', '#FFD100', '#C2002F', '#CF009E', '#6AA2B8', '#D6C200'],
  brapiEnabled: false,
  commentsEnabled: true,
  showGdprNotification: false,
  pdciEnabled: true,
  dataImportMode: 'NONE',
  authMode: 'NONE',
  filesDeleteAfterHoursAsync: 12,
  filesDeleteAfterHoursTemp: 12
}

export default {
  components: {
    draggable
  },
  data: function () {
    return {
      // Define the defaults here
      settings: null,
      dataImportModes: [{
        text: 'NONE',
        value: 'NONE',
        explanation: 'pageGerminateSettingsCardImportModeNoneExplanation'
      }, {
        text: 'VERIFY',
        value: 'VERIFY',
        explanation: 'pageGerminateSettingsCardImportModeVerifyExplanation'
      }, {
        text: 'IMPORT',
        value: 'IMPORT',
        explanation: 'pageGerminateSettingsCardImportModeImportExplanation'
      }],
      authenticationModes: [{
        text: 'NONE',
        value: 'NONE',
        explanation: 'pageGerminateSettingsCardAuthModeNoneExplanation'
      }, {
        text: 'SELECTIVE',
        value: 'SELECTIVE',
        explanation: 'pageGerminateSettingsCardAuthModeSelectiveExplanation'
      }, {
        text: 'FULL',
        value: 'FULL',
        explanation: 'pageGerminateSettingsCardAuthModeFullExplanation'
      }],
      tempTemplateColor: '#000000',
      tempChartColor: '#000000',
    }
  },
  computed: {
    dataImportModeDescription: function () {
      if (this.settings && this.settings.dataImportMode) {
        return this.dataImportModes.find(i => i.value === this.settings.dataImportMode).explanation
      } else {
        return null
      }
    },
    authModeDescription: function () {
      if (this.settings && this.settings.authMode) {
        return this.authenticationModes.find(i => i.value === this.settings.authMode).explanation
      } else {
        return null
      }
    }
  },
  mixins: [colorMixin, miscApi, typeMixin],
  methods: {
    addTempChartColor: function () {
      this.settings.colorsCharts.push(this.tempChartColor)
    },
    addTempTemplateColor: function () {
      this.settings.colorsTemplate.push(this.tempTemplateColor)
    },
    selectAllCategories: function (selectAll) {
      this.settings.dashboardCategories = selectAll ? this.statCategories.map(s => s.value) : []
    },
    saveSettings: function () {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiPostAdminSettings(this.settings, result => {
              if (result) {
                // Now get the updated settings
                this.apiGetSettings(result => {
                  this.$store.commit('ON_SETTINGS_CHANGED_MUTATION', result)

                  // Then remove the token (because the server reset them all anyway)
                  this.$store.commit('ON_TOKEN_CHANGED_MUTATION', null)

                  emitter.emit('on-stylesheet-changed')

                  // And redirect to the home/login page
                  if (this.serverSettings.authMode === 'FULL') {
                    this.$router.push({ name: 'login' })
                  } else {
                    this.$router.push({ name: 'home' })
                  }
                })
              }
            })
          }
        })
    },
    removeChartColor: function (index) {
      this.settings.colorsCharts.splice(index, 1)
    },
    removeTemplateColor: function (index) {
      this.settings.colorsTemplate.splice(index, 1)
    },
    reload: function () {
      this.apiGetAdminSettings(result => {
        this.settings = Object.assign(defaults, result)
      })
    }
  },
  mounted: function () {
    this.reload()
  }
}
</script>

<style scoped>
#admin-form input[type=color] {
  width: 50px;
  height: calc(1.5em + 0.75rem + 3px);
}
.toggle-card:hover {
  cursor: pointer;
}
.toggle-card.active,
.toggle-card.active svg.toggle-card-icon {
  color: white;
  fill: white;
}
.toggle-card,
.toggle-card svg.toggle-card-icon {
  color: inherit;
  fill: inherit;
  transition: 0.15s color ease-in-out, 0.15s background-color ease-in-out;
}
svg.toggle-card-icon {
  height: 48px;
  margin: 12px 0;
}
</style>