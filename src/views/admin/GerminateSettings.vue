<template>
  <div>
    <h1>{{ $t('pageGerminateSettingsTitle') }}</h1>
    <p>{{ $t('pageGerminateSettingsText') }}</p>
    <b-row v-if="settings" id="admin-form">
      <b-col cols=12 md=6>
        <b-card :title="$t('pageGerminateSettingsCardColors')">
          <b-form-group :label="$t('formLabelAdminSettingsColorPrimary')" label-for="primary-color">
            <b-form-input type="color" v-model="settings.colorPrimary" class="d-inline" id="primary-color" />
          </b-form-group>

          <b-form-group :label="$t('formLabelAdminSettingsColorChart')" label-for="chart-color">
            <b-form-tag v-for="(color, index) in settings.colorsCharts"
                          class="p-1 m-1"
                          id="chart-color"
                          :key="`chart-color-${color}`"
                          :style="{ backgroundColor: color, color: getHighContrastTextColor(color) }"
                          @remove="removeChartColor(index)">
                {{ color }}
              </b-form-tag>
          </b-form-group>
          <b-form-group :label="$t('formLabelAdminSettingsColorTemplate')" label-for="template-color">
            <b-form-tag v-for="(color, index) in settings.colorsTemplate"
                          class="p-1 m-1"
                          id="template-color"
                          :key="`template-color-${color}`"
                          :style="{ backgroundColor: color, color: getHighContrastTextColor(color) }"
                          @remove="removeTemplateColor(index)">
                {{ color }}
              </b-form-tag>
          </b-form-group>
        </b-card>
      </b-col>
      <b-col cols=12 md=6>
        <b-card :title="$t('pageGerminateSettingsCardToggles')">
          <b-form-group :label="$t('formLabelAdminSettingsToggleBrapi')" label-for="brapi">
            <b-form-checkbox id="brapi" v-model="settings.brapiEnabled" switch />
          </b-form-group>
          <b-form-group :label="$t('formLabelAdminSettingsToggleComments')" label-for="comments">
            <b-form-checkbox id="comments" v-model="settings.commentsEnabled" switch />
          </b-form-group>
          <b-form-group :label="$t('formLabelAdminSettingsToggleGdpr')" label-for="gdpr">
            <b-form-checkbox id="gdpr" v-model="settings.showGdprNotification" switch />
          </b-form-group>
          <b-form-group :label="$t('formLabelAdminSettingsTogglePdci')" label-for="pdci">
            <b-form-checkbox id="pdci" v-model="settings.pdciEnabled" switch />
          </b-form-group>
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
            <b-form-input type="password" id="gatekeeper-password" v-model="settings.gatekeeperPassword" />
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
  </div>
</template>

<script>
import colorMixin from '@/mixins/colors.js'
import typeMixin from '@/mixins/types.js'
import miscApi from '@/mixins/api/misc.js'

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
      }]
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
    removeChartColor: function (index) {
      this.settings.colorsCharts.splice(index, 1)
    },
    removeTemplateColor: function (index) {
      this.settings.colorsTemplate.splice(index, 1)
    }
  },
  mounted: function () {
    this.apiGetAdminSettings(result => {
      this.settings = Object.assign(defaults, result)
    })
  }
}
</script>

<style scoped>
#admin-form input[type=color] {
  width: 50px;
}
</style>