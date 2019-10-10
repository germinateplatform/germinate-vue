<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               itemType="markers"
               ref="mapDefinitionTable"
               v-on="$listeners">
      <span slot="synonyms" slot-scope="props" v-if="props.row.synonyms">{{ props.row.synonyms.join(', ') }}</span>
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
    getData: {
      type: Function,
      default: () => {}
    }
  },
  data: function () {
    const columns = [
      {
        name: 'markerId',
        type: Number
      }, {
        name: 'markerName',
        type: String
      }, {
        name: 'synonyms',
        type: String
      }, {
        name: 'mapFeatureType',
        type: String
      }, {
        name: 'mapName',
        type: String
      }, {
        name: 'chromosome',
        type: String
      }, {
        name: 'position',
        type: Number
      }, {
        name: 'marked',
        type: null
      }
    ]
    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'markerId',
        tableName: 'mapDefinitions',
        sortable: ['markerId', 'markerName', 'synonyms', 'mapFeatureType', 'mapName', 'chromosome', 'position'],
        filterable: [],
        headings: {
          markerId: () => this.$t('tableColumnMarkerId'),
          markerName: () => this.$t('tableColumnMarkerName'),
          synonyms: () => this.$t('tableColumnMarkerSynonyms'),
          mapFeatureType: () => this.$t('tableColumnMapFeatureType'),
          mapName: () => this.$t('tableColumnMapName'),
          chromosome: () => this.$t('tableColumnMapChromosome'),
          position: () => this.$t('tableColumnMapPosition')
        },
        columnsClasses: {
          markerId: 'text-right',
          chromosome: 'text-right',
          position: 'text-right',
          marked: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    refresh: function () {
      this.$refs.mapDefinitionTable.refresh()
    }
  }
}
</script>

<style>
</style>
