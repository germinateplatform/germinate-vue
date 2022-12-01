<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="datasetAttributeTable"
               v-on="$listeners">
      <template v-slot:cell(attributeDescription)="data">
        <span :title="data.item.attributeDescription" v-if="data.item.attributeDescription">{{ truncateAfterWords(data.item.attributeDescription, 10) }}</span>
        <a href="#" class="table-icon-link" @click.prevent="showFullAttributeDescription(data.item.attributeDescription)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfterWords(data.item.attributeDescription, 10)" >&nbsp;
          <MdiIcon :path="mdiPageNext" />
        </a>
      </template>
      <!-- Attribute type -->
      <template v-slot:cell(attributeType)="data">
        <span v-if="data.item.attributeType">
          <span :style="`color: ${dataTypes[data.item.attributeType].color()};`"><MdiIcon :path="dataTypes[data.item.attributeType].path" /></span>
          <span> {{ dataTypes[data.item.attributeType].text() }}</span>
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { dataTypes } from '@/mixins/types.js'
import { isTruncatedAfterWords, truncateAfterWords } from '@/mixins/formatting'
import { mdiPageNext } from '@mdi/js'

export default {
  name: 'datasetAttributeTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      dataTypes,
      mdiPageNext,
      options: {
        idColumn: 'datasetId',
        tableName: 'datasetAttributes'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'datasetId',
          type: undefined,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnAttributeDatasetId')
        }, {
          key: 'datasetName',
          type: undefined,
          sortable: true,
          label: this.$t('tableColumnAttributeDatasetName'),
          preferredSortingColumn: true
        }, {
          key: 'datasetDescription',
          type: undefined,
          sortable: true,
          label: this.$t('tableColumnAttributeDatasetDescription')
        }, {
          key: 'attributeName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeName')
        }, {
          key: 'attributeDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeDescription')
        }, {
          key: 'attributeType',
          type: 'dataType',
          sortable: true,
          label: this.$t('tableColumnAttributeDataType')
        }, {
          key: 'attributeValue',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeValue')
        }
      ]
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    isTruncatedAfterWords,
    truncateAfterWords,
    showFullAttributeDescription: function (description) {
      this.$bvModal.msgBoxOk(description, {
        title: this.$t('tableColumnAttributeDescription'),
        okTitle: this.$t('genericOk')
      })
    },
    refresh: function () {
      this.$refs.datasetAttributeTable.refresh()
    }
  }
}
</script>

<style>
</style>
