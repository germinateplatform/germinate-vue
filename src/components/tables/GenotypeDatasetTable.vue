<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :showAllItems="true"
               v-bind="$props"
               ref="datasetTable"
               v-on="$listeners">
      <span slot="dataObjectCount" slot-scope="props" v-if="props.row.dataObjectCount !== undefined && props.row.dataObjectCount.value !== null">{{ props.row.dataObjectCount.value | toThousandSeparators }}</span>
      <span slot="dataPointCount" slot-scope="props" v-if="props.row.dataPointCount !== undefined && props.row.dataPointCount.value !== null">{{ props.row.dataPointCount.value | toThousandSeparators }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { mapFilters } from '@/plugins/map-filters.js'

export default {
  name: 'DatasetTable',
  props: {
    ...defaultProps.FULL,
    selectable: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    var columns = [
      {
        name: 'datasetId',
        type: Number
      }, {
        name: 'datasetName',
        type: String
      }, {
        name: 'datasetDescription',
        type: String
      }, {
        name: 'dataObjectCount',
        type: Number
      }, {
        name: 'dataPointCount',
        type: Number
      }
    ]

    if (this.selectable === true) {
      columns.unshift({
        name: 'selected',
        type: undefined
      })
    }

    return {
      options: {
        idColumn: 'datasetId',
        tableName: 'datasets',
        sortable: ['datasetId', 'datasetName', 'datasetDescription', 'dataObjectCount', 'dataPointCount'],
        filterable: [],
        headings: {
          datasetId: () => this.$t('tableColumnDatasetId'),
          datasetName: () => this.$t('tableColumnDatasetName'),
          datasetDescription: () => this.$t('tableColumnDatasetDescription'),
          dataObjectCount: () => this.$t('tableColumnGenotypeDatasetGermplasmCount'),
          dataPointCount: () => this.$t('tableColumnGenotypeDatasetMarkerCount'),
          selected: ''
        },
        orderBy: {
          column: 'datasetId'
        },
        columnsClasses: {
          selected: 'bg-info',
          dataObjectCount: 'text-right',
          dataPointCount: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    ...mapFilters(['toThousandSeparators']),
    getSelected: function () {
      return this.$refs.datasetTable.getSelected()
    },
    setSelectedItems: function (toSelect) {
      this.$refs.datasetTable.setSelectedItems(toSelect)
    },
    refresh: function () {
      this.$refs.datasetTable.refresh()
    }
  }
}
</script>
