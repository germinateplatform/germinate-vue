<template>
  <div>
    <BaseTable :options="options" :columns="columns">
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'MarkerTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    }
  },
  data: function () {
    const columns = ['mapid', 'mapname', 'mapdescription', 'markercount']
    return {
      options: {
        requestData: (data, callback) => {
          return this.apiGetMapsTable(data, callback)
        },
        idColumn: 'mapid',
        tableName: 'maps',
        filterOn: this.filterOn,
        sortable: columns,
        filterable: [],
        headings: {
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  }
}
</script>

<style>
</style>
