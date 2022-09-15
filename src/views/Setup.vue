<template>
  <b-container class="my-5">
    <div class="setup-header bg-light p-5 mb-4">
      <b-row>
        <b-col cols=12 md=4 class="text-center text-md-right" order="1" order-md="2">
          <b-img src="./img/germinate-square-name.svg" fluid  alt="Germinate logo" />
        </b-col>
        <b-col cols=12 md=8 order="2" order-md="1">
          <h1 class="display-4 text-center text-md-left">{{ $t('pageSetupHeader') }}</h1>
          <p class="lead text-center text-md-left">{{ $t('pageSetupLead') }}</p>
          <b-navbar-nav>
            <LocaleDropdown position="left" />
          </b-navbar-nav>
        </b-col>
      </b-row>
    </div>

    <!-- Germinate database setup -->
    <b-row>
      <b-col cols=12 md=6>
        <b-card :title="$t('pageSetupDatabaseTitle')" :sub-title="$t('pageSetupDatabaseSubtitle')" :border-variant="dbBorder" class="mb-4" ref="dbCard">
          <b-form @submit.prevent="checkDatabaseSetup" class="mt-3">
            <b-form-group :label="$t('formLabelSetupDatabaseHost')" label-for="database-host">
              <b-form-input id="database-host" v-model="dbConfig.host" />
            </b-form-group>
            <b-form-group :label="$t('formLabelSetupDatabaseName')" label-for="database-name">
              <b-form-input id="database-name" v-model="dbConfig.database" />
            </b-form-group>
            <b-form-group :label="$t('formLabelSetupDatabasePort')" label-for="database-port">
              <b-form-input id="database-port" type="number" :min="0" :step="1" v-model="dbConfig.port" />
            </b-form-group>
            <b-form-group :label="$t('formLabelSetupDatabaseUsername')" label-for="database-username">
              <b-form-input id="database-username" v-model="dbConfig.username" />
            </b-form-group>
            <b-form-group :label="$t('formLabelSetupDatabasePassword')" label-for="database-password">
              <b-form-input type="password" id="database-password" v-model="dbConfig.password" />
            </b-form-group>
            <b-button :variant="dbConfig.checked ? 'success' : 'primary'" type="submit" :disabled="dbConfig.checked">{{ $t('buttonCheckDetails') }}</b-button>

            <p class="text-danger" v-if="dbConfig.feedback">{{ dbConfig.feedback }}</p>
          </b-form>
        </b-card>
      </b-col>
      <b-col cols=12 md=6>
        <!-- Gatekeeper config -->
        <b-card :class="`mb-4 ${gkConfig.used ? '' : 'bg-light text-muted'}`" :border-variant="gkBorder" ref="gkCard">
          <b-card-title>{{ $t('pageSetupGatekeeperTitle') }}</b-card-title>
          <b-card-sub-title><b-checkbox switch v-model="gkConfig.used" class="d-inline-block">{{ $t('pageSetupGatekeeperSubtitle') }}</b-checkbox></b-card-sub-title>
          <b-form @submit.prevent="checkGatekeeperSetup" class="mt-3">
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperUrl')" label-for="gatekeeper-url">
              <b-form-input type="url" id="gatekeeper-url" v-model="gkConfig.url" :disabled="!gkConfig.used" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperUsername')" label-for="gatekeeper-username">
              <b-form-input id="gatekeeper-username" v-model="gkConfig.username" :disabled="!gkConfig.used" />
            </b-form-group>
            <b-form-group :label="$t('formLabelAdminSettingsGatekeeperPassword')" label-for="gatekeeper-password">
              <b-form-input type="password" id="gatekeeper-password" autocomplete="new-password" v-model="gkConfig.password" :disabled="!gkConfig.used" />
            </b-form-group>

            <b-button :variant="gkConfig.checked ? 'success' : 'primary'" type="submit" :disabled="!gkConfig.used || gkConfig.checked">{{ $t('buttonCheckDetails') }}</b-button>

            <p class="text-danger" v-if="gkConfig.feedback">{{ gkConfig.feedback }}</p>
          </b-form>
        </b-card>
      </b-col>
    </b-row>

    <b-card :title="$t('pageSetupFinishTitle')" :sub-title="$t('pageSetupFinishSubtitle')" class="mb-4" v-if="dbConfig.checked && gkChecked" ref="finishCard">
      <b-button variant="primary" @click="finishSetup">{{ $t('buttonSubmit') }}</b-button>
      <p class="text-danger" v-if="feedback">{{ feedback }}</p>
    </b-card>
  </b-container>
</template>

<script>
import LocaleDropdown from '@/components/dropdowns/LocaleDropdown'

import { apiSetupCheckGatekeeper, apiSetupCheckDatabase, apiSetupStore } from '@/mixins/api/auth'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    LocaleDropdown
  },
  data: function () {
    return {
      feedback: null,
      dbConfig: {
        host: null,
        database: null,
        username: null,
        password: null,
        checked: false,
        feedback: null
      },
      gkConfig: {
        used: true,
        url: null,
        username: null,
        password: null,
        checked: false,
        feedback: null
      }
    }
  },
  watch: {
    'dbConfig.host': function () {
      this.dbConfig.checked = false
    },
    'dbConfig.name': function () {
      this.dbConfig.checked = false
    },
    'dbConfig.port': function () {
      this.dbConfig.checked = false
    },
    'dbConfig.username': function () {
      this.dbConfig.checked = false
    },
    'dbConfig.password': function () {
      this.dbConfig.checked = false
    },
    'gkConfig.url': function () {
      this.gkConfig.checked = false
    },
    'gkConfig.username': function () {
      this.gkConfig.checked = false
    },
    'gkConfig.password': function () {
      this.gkConfig.checked = false
    }
  },
  computed: {
    gkChecked: function () {
      return !this.gkConfig.used || this.gkConfig.checked
    },
    dbBorder: function () {
      if (this.dbConfig.checked) {
        return 'success'
      } else if (this.dbConfig.feedback) {
        return 'danger'
      } else {
        return null
      }
    },
    gkBorder: function () {
      if (this.gkConfig.checked) {
        return 'success'
      } else if (this.gkConfig.feedback) {
        return 'danger'
      } else {
        return null
      }
    }
  },
  methods: {
    finishSetup: function () {
      if (this.dbConfig.checked && this.gkChecked) {
        this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
          okTitle: this.$t('buttonSubmit'),
          okVariant: 'danger',
          cancelTitle: this.$t('buttonCancel')
        })
          .then(value => {
            if (value === true) {
              this.storeConfig()
            }
          })
      }
    },
    storeConfig: function () {
      this.feedback = null
      emitter.emit('show-loading', true)
      apiSetupStore({
        dbConfig: this.dbConfig,
        gkConfig: this.gkConfig.used ? this.gkConfig : null
      }, result => {
        this.$router.push({ name: 'home' })
      }, {
        codes: [400, 401, 500, 503],
        callback: e => {
          emitter.emit('show-loading', false)
          switch (e.status) {
            case 503:
              this.$bvModal.msgBoxOk(this.$t('modalMessageSetupServiceUnavailable'), {
                title: this.$t('modalTitleSetupServiceUnavailable'),
                okTitle: this.$t('genericOk')
              }).then(() => {
                this.$router.push({ name: 'home' })
              })
              break
            default:
              this.feedback = e.data
              break
          }
        }
      })
    },
    checkDatabaseSetup: function () {
      this.dbConfig.feedback = null
      this.dbConfig.checked = false
      emitter.emit('show-loading', true)
      apiSetupCheckDatabase(this.dbConfig, result => {
        this.dbConfig.checked = true
        emitter.emit('show-loading', false)
        this.$nextTick(() => this.$refs.gkCard.scrollIntoView({ behavior: 'smooth' }))
      }, {
        codes: [400, 401, 500, 503],
        callback: e => {
          emitter.emit('show-loading', false)
          switch (e.status) {
            case 503:
              this.$bvModal.msgBoxOk(this.$t('modalMessageSetupServiceUnavailable'), {
                title: this.$t('modalTitleSetupServiceUnavailable'),
                okTitle: this.$t('genericOk')
              }).then(() => {
                this.$router.push({ name: 'home' })
              })
              break
            default:
              this.dbConfig.feedback = e.data
              break
          }
        }
      })
    },
    checkGatekeeperSetup: function () {
      this.gkConfig.feedback = null
      this.gkConfig.checked = false
      emitter.emit('show-loading', true)
      apiSetupCheckGatekeeper(this.gkConfig, result => {
        // It worked!!
        this.gkConfig.checked = true
        emitter.emit('show-loading', false)

        this.$nextTick(() => this.$refs.finishCard.scrollIntoView({ behavior: 'smooth' }))
      }, {
        codes: [400, 401, 500, 503],
        callback: e => {
          emitter.emit('show-loading', false)
          switch (e.status) {
            case 503:
              this.$bvModal.msgBoxOk(this.$t('modalMessageSetupServiceUnavailable'), {
                title: this.$t('modalTitleSetupServiceUnavailable'),
                okTitle: this.$t('genericOk')
              }).then(() => {
                this.$router.push({ name: 'home' })
              })
              break
            default:
              this.gkConfig.feedback = e.data
              break
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.setup-header img {
  max-height: 125px;
}

@media (min-width: 768px) {
  .setup-header img {
    max-height: 150px;
  }
}
</style>
