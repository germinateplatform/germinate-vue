<template>
  <div>
    <BaseTable :options="options" :columns="columns" itemType="markers" ref="mapDefinitionTable">
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'MapDefinitionTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    },
    mapId: {
      type: Number,
      default: null
    }
  },
  watch: {
    mapId (newValue, oldValue) {
      this.$refs.mapDefinitionTable.refresh()
    }
  },
  data: function () {
    const columns = ['markerid', 'markername', 'synonyms', 'mapFeatureType', 'mapName', 'chromosome', 'position', 'selected']
    return {
      options: {
        requestData: (data, callback) => {
          return this.apiPostMapdefinitionTable(this.mapId, data, callback)
        },
        idColumn: 'markerid',
        tableName: 'markers',
        filterOn: this.filterOn,
        sortable: ['markerid', 'markername', 'synonyms', 'mapFeatureType', 'mapName', 'chromosome', 'position'],
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
