<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :showAllItems="true"
               :filterEnabled="false"
               v-bind="$props"
               ref="datasetTable"
               v-on="$listeners"
               v-on:loaded="onLoaded" />
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

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
    return {
      options: {
        idColumn: 'datasetId',
        tableName: 'datasets',
        orderBy: 'datasetId',
        rowVariant: this.getRowVariant
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'selected',
          type: undefined,
          class: `bg-primary ${this.isTableColumnHidden(this.options.tableName, 'selected')}`,
          sortable: false,
          label: ''
        },
        {
          key: 'datasetId',
          type: Number,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetId')}`,
          label: this.$t('tableColumnDatasetId')
        }, {
          key: 'datasetName',
          type: String,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetName')}`,
          label: this.$t('tableColumnDatasetName'),
          formatter: value => this.$options.filters.truncateAfterWords(value, 10),
          preferedSortingColumn: true
        }, {
          key: 'datasetDescription',
          type: String,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetDescription')}`,
          label: this.$t('tableColumnDatasetDescription'),
          formatter: value => this.$options.filters.truncateAfterWords(value, 10)
        }, {
          key: 'dataObjectCount',
          type: Number,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'dataObjectCount')}`,
          label: this.$t('tableColumnGenotypeDatasetGermplasmCount'),
          formatter: value => (value && (value.value !== undefined)) ? this.$options.filters.toThousandSeparators(value.value) : null
        }, {
          key: 'dataPointCount',
          type: Number,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'dataPointCount')}`,
          label: this.$t('tableColumnGenotypeDatasetMarkerCount'),
          formatter: value => (value && (value.value !== undefined)) ? this.$options.filters.toThousandSeparators(value.value) : null
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  methods: {
    getRowVariant: function (row) {
      if (!row.dataObjectCount || !row.dataObjectCount.value || !row.dataPointCount || !row.dataPointCount.value) {
        return 'danger'
      } else {
        return null
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
      let selected = this.getSelected()

      if (selected && data && data.data) {
        // Select all items by default
        selected = data.data.filter(r => selected.indexOf(r.datasetId) !== -1)
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
