<template>
  <div>
    <h1>{{ $t('pageGenesysTitle') }}</h1>
    <hr />

    <template v-if="genesysUrl">
      <p>{{ $t('pageGenesysTextSuccessful') }}</p>

      <b-button variant="primary" :href="genesysUrl" target="_blank"><MdiIcon :path="genesysIcon" /> {{ $t('buttonContinueGenesysOrdering') }}</b-button>
    </template>
    <template v-else>
      <p>{{ $t('pageGenesysText') }}</p>

      <b-alert variant="warning" v-if="!genesysAvailable">{{ $t('pageGenesysUnavailable') }}</b-alert>
      <template v-else>
        <GermplasmTable :getData="getGermplasmData" :getIds="getGermplasmIds" :downloadTable="downloadGermplasm" ref="germplasmTable" />
      </template>

      <b-row>
        <b-col cols="12" sm="6" md="4" lg="3">
          <b-card :title="$t('pageGenesysFormDetailsTitle')">
            <b-form @submit.prevent="submit">
              <template v-if="!storeToken">
                <b-form-group :label="$t('formLabelFullName')" label-for="name">
                  <b-form-input v-model="name" id="name" />
                </b-form-group>
                <b-form-group :label="$t('formLabelEmail')" label-for="email">
                  <b-form-input v-model="email" id="email" type="email" />
                </b-form-group>
              </template>
              <div class="mb-3" v-else>
                <b-badge>{{ storeToken.username }}</b-badge>
              </div>

              <b-button :disabled="!canContinue" variant="primary" type="submit"><MdiIcon :path="genesysIcon" /> {{ $t('buttonGoToGenesysOrdering') }}</b-button>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon.vue'
import GermplasmTable from '@/components/tables/GermplasmTable.vue'
import { apiGetGenesysAvailable, apiPostGenesysRequest, apiPostTableExport } from '@/mixins/api/misc'
import { mapGetters } from 'vuex'
import { markedItemTypes } from '@/mixins/types'
import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/mixins/api/germplasm'
import { genesysIcon } from '@/mixins/util'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    GermplasmTable,
    MdiIcon
  },
  data: function () {
    return {
      genesysAvailable: false,
      markedItemTypes,
      name: null,
      email: null,
      genesysUuid: null,
      genesysIcon
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeMarkedGermplasm',
      'storeServerSettings'
    ]),
    canContinue: function () {
      return this.storeMarkedGermplasm && this.storeMarkedGermplasm.length > 0 && (this.storeToken || (this.name && this.name.trim().length > 0 && this.email && this.email.trim().length > 0))
    },
    genesysUrl: function () {
      if (this.genesysUuid && this.storeServerSettings) {
        return `${this.storeServerSettings.genesysUrl}/api/v2/request/external?key=${this.genesysUuid}`
      } else {
        return null
      }
    }
  },
  watch: {
    storeMarkedGermplasm: function () {
      this.$refs.germplasmTable.refresh()
    }
  },
  methods: {
    getGermplasmData: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return apiPostGermplasmTable(data, callback)
    },
    getGermplasmIds: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return apiPostGermplasmTableIds(data, callback)
    },
    downloadGermplasm: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return apiPostTableExport({ filter: data.filter }, 'germplasm', callback)
    },
    adjustFilter: function (data, id, type) {
      const newData = JSON.parse(JSON.stringify(data))

      if (!newData.filter) {
        newData.filter = []
      }
      newData.filter.unshift({
        column: id,
        comparator: 'inSet',
        operator: 'and',
        values: this.storeMarkedGermplasm
      })

      return newData
    },
    submit: function () {
      if (!this.canContinue) {
        return
      }

      emitter.emit('show-loading', true)

      apiPostGenesysRequest({
        name: this.name,
        email: this.email,
        germplasmIds: this.storeMarkedGermplasm
      }, result => {
        this.genesysUuid = result
        emitter.emit('show-loading', false)
      }, {
        codes: [400, 404, 503],
        callback: (e) => {
          // Do nothing here, it just means there is no data.
          emitter.emit('show-loading', false)

          if (e.status === 404) {
            // TODO
          } else if (e.status === 400) {
            if (e.data && e.data.length > 0) {
              this.$bvModal.msgBoxConfirm(this.$t('modalTextGenesysMissingItems', { missing: e.data.length, total: this.storeMarkedGermplasm.length }), {
                title: this.$t('modalTitleGenesysMissingItems'),
                okTitle: this.$t('genericYes'),
                okVariant: 'danger',
                cancelTitle: this.$t('genericNo')
              })
                .then(value => {
                  if (value === true) {
                    this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: e.data })
                  }
                })
            }
          } else if (e.status === 503) {
            this.genesysAvailable = false
          }
        }
      })
    }
  },
  mounted: function () {
    apiGetGenesysAvailable(available => {
      this.genesysAvailable = available
    })
  }
}
</script>

<style>

</style>
