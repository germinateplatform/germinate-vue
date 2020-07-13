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
          <i :class="'mdi mdi-18px fix-alignment ' + dataTypes[data.item.attributeType].icon" :style="`color: ${dataTypes[data.item.attributeType].color()};`"/>
          <span> {{ dataTypes[data.item.attributeType].text() }}</span>
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'

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
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'datasetId')}`,
          label: this.$t('tableColumnAttributeDatasetId')
        }, {
          key: 'datasetName',
          type: undefined,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetName')}`,
          label: this.$t('tableColumnAttributeDatasetName'),
          preferedSortingColumn: true
        }, {
          key: 'datasetDescription',
          type: undefined,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetDescription')}`,
          label: this.$t('tableColumnAttributeDatasetDescription')
        }, {
          key: 'attributeName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeName')}`,
          label: this.$t('tableColumnAttributeName')
        }, {
          key: 'attributeDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeDescription')}`,
          label: this.$t('tableColumnAttributeDescription')
        }, {
          key: 'attributeType',
          type: 'dataType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeType')}`,
          label: this.$t('tableColumnAttributeDataType')
        }, {
          key: 'attributeValue',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeValue')}`,
          label: this.$t('tableColumnAttributeValue')
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  mixins: [ typesMixin ],
  methods: {
    refresh: function () {
      this.$refs.datasetAttributeTable.refresh()
    }
  }
}
</script>

<style>
</style>
