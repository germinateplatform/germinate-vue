<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="datasetAttributeTable"
               v-on="$listeners">
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
import typesMixin from '@/mixins/types.js'
import utilMixin from '@/mixins/util'

export default {
  name: 'datasetAttributeTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
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
          preferedSortingColumn: true
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
  mixins: [typesMixin, utilMixin],
  methods: {
    refresh: function () {
      this.$refs.datasetAttributeTable.refresh()
    }
  }
}
</script>

<style>
</style>
