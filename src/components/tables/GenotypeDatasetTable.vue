<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :showAllItems="true"
               :filterEnabled="false"
               v-bind="$props"
               ref="datasetTable"
               v-on="$listeners"
               v-on:loaded="onLoaded">
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
        },
        rowClassCallback: row => this.getRowClass(row)
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    ...mapFilters(['toThousandSeparators']),
    getRowClass: function (row) {
      if (!row.dataObjectCount || !row.dataObjectCount.value || !row.dataPointCount || !row.dataPointCount.value) {
        return 'table-danger'
      } else {
        return ''
      }
    },
    getSelected: function () {
      return this.$refs.datasetTable.getSelected()
    },
    setSelectedItems: function (toSelect) {
      this.$refs.datasetTable.setSelectedItems(toSelect)
    },
    refresh: function () {
      this.$refs.datasetTable.refresh()
    },
    onLoaded: function (data) {
      var selected = this.getSelected()

      if (selected && data && data.data && data.data.data) {
        selected = data.data.data.filter(r => selected.indexOf(r.datasetId) !== -1)
          .filter(r => r.dataObjectCount && r.dataObjectCount.value && r.dataPointCount && r.dataPointCount.value)
          .map(r => r.datasetId)

        this.setSelectedItems(selected)
      }
    }
  }
}
</script>

<style>
</style>
