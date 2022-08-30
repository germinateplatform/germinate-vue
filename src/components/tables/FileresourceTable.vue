<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="fileresourceTable"
               v-on="$listeners">
      <!-- Fileresource description -->
      <template v-slot:cell(fileresourceDescription)="data">
        <span :title="data.item.fileresourceDescription" v-if="data.item.fileresourceDescription">{{ truncateAfterWords(data.item.fileresourceDescription, 10) }}</span>
        <a href="#" class="table-icon-link" @click.prevent="showFullDescription('tableColumnFileresourceDescription', data.item.fileresourceDescription)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfter(data.item.fileresourceDescription, 10)" >&nbsp;
          <MdiIcon :path="mdiPageNext" /></a>
      </template>
      <!-- Fileresource type description -->
      <template v-slot:cell(fileresourcetypeDescription)="data">
        <span :title="data.item.fileresourcetypeDescription" v-if="data.item.fileresourcetypeDescription">{{ truncateAfterWords(data.item.fileresourcetypeDescription, 10) }}</span>
        <a href="#" class="table-icon-link" @click.prevent="showFullDescription('tableColumnFileresourcetypeDescription', data.item.fileresourcetypeDescription)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfter(data.item.fileresourcetypeDescription, 10)" >&nbsp;
          <MdiIcon :path="mdiPageNext" /></a>
      </template>
      <!-- Download -->
      <template v-slot:cell(fileresourceSize)="data">
        <div class="d-flex flex-column justify-content-center align-items-center">
          <b-button class="text-nowrap" variant="primary" @click="downloadFileresource(data.item)"><MdiIcon :path="mdiDownload"/> {{ $t('buttonDownload') }}</b-button>
          <small>({{ getNumberWithSuffix(data.item.fileresourceSize, 2, 1024, ' ') }}B)</small>
        </div>
      </template>
      <!-- Show datasets -->
      <template v-slot:cell(datasetIds)="data">
        <b-button class="text-nowrap" @click="showDatasets(data.item)" v-if="data.item.datasetIds && data.item.datasetIds.length > 0"><MdiIcon :path="mdiDatabase"/> {{ $t('buttonShow') }}</b-button>
      </template>
      <!-- Delete resource -->
      <template v-slot:cell(deleteFileresource)="data">
        <b-button variant="danger" class="ml-3" v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" @click="onDeleteResource(data.item)"><MdiIcon :path="mdiDelete" /></b-button>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import authApi from '@/mixins/api/auth'
import formattingMixin from '@/mixins/formatting'
import datasetApi from '@/mixins/api/dataset'
import utilMixin from '@/mixins/util'

import MdiIcon from '@/components/icons/MdiIcon'

import { mdiPageNext, mdiDownload, mdiDelete, mdiDatabase } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BaseTable,
    MdiIcon
  },
  name: 'FileresourceTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      mdiPageNext,
      mdiDownload,
      mdiDelete,
      mdiDatabase,
      options: {
        idColumn: 'fileresourceId',
        tableName: 'fileresources'
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    columns: function () {
      const result = [
        {
          key: 'fileresourceId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnFileresourceId')
        }, {
          key: 'fileresourceName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnFileresourceName')
        }, {
          key: 'fileresourceDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnFileresourceDescription')
        }, {
          key: 'fileresourceCreatedOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnFileresourceCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }, {
          key: 'fileresourcetypeId',
          type: String,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnFileresourcetypeId')
        }, {
          key: 'fileresourcetypeName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnFileresourcetypeName')
        }, {
          key: 'fileresourcetypeDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnFileresourcetypeDescription')
        }, {
          key: 'datasetIds',
          type: 'json',
          sortable: false,
          class: 'px-1',
          label: this.$t('tableColumnFileresourceDatasets')
        }, {
          key: 'fileresourceSize',
          type: String,
          sortable: true,
          label: this.$t('tableColumnFileresourceSize')
        }
      ]

      if (this.storeToken && this.userIsAtLeast(this.storeToken.userType, 'Data Curator')) {
        result.push({
          key: 'deleteFileresource',
          type: undefined,
          sortable: false,
          label: ''
        })
      }

      return result
    }
  },
  mixins: [authApi, formattingMixin, datasetApi, utilMixin],
  methods: {
    showDatasets: function (fileresource) {
      const filter = [{
        column: 'fileresourceIds',
        comparator: 'contains',
        operator: 'and',
        values: [fileresource.fileresourceId]
      }]
      this.$router.push({
        name: 'datasets',
        query: {
          'datasets-filter': JSON.stringify(filter)
        }
      })
    },
    onDeleteResource: function (resource) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiDeleteFileresource(resource.fileresourceId, result => {
              if (result) {
                this.refresh()
                emitter.emit('update-sidebar-menu')
              }
            })
          }
        })
    },
    downloadFileresource: function (resource) {
      this.apiGetDataResource(resource.fileresourceId, result => {
        this.downloadBlob({
          blob: result,
          filename: resource.fileresourcePath
        })
      })
    },
    showFullDescription: function (title, description) {
      this.$bvModal.msgBoxOk(description, {
        title: this.$t(title),
        okTitle: this.$t('genericOk')
      })
    },
    refresh: function () {
      this.$refs.fileresourceTable.refresh()
    }
  }
}
</script>

<style>
</style>
