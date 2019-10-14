<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               itemType="markers"
               ref="mapDefinitionTable"
               v-on="$listeners">
      <span slot="synonyms" slot-scope="props" v-if="props.row.synonyms">{{ props.row.synonyms.join(', ') }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'MapDefinitionTable',
  props: {
    ...defaultProps.FULL
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
        name: 'mapId',
        type: Number
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
        idColumn: 'markerId',
        tableName: 'mapDefinitions',
        sortable: ['markerId', 'markerName', 'synonyms', 'mapFeatureType', 'mapId', 'mapName', 'chromosome', 'position'],
        filterable: [],
        headings: {
          markerId: () => this.$t('tableColumnMarkerId'),
          markerName: () => this.$t('tableColumnMarkerName'),
          synonyms: () => this.$t('tableColumnMarkerSynonyms'),
          mapFeatureType: () => this.$t('tableColumnMapFeatureType'),
          mapId: () => this.$t('tableColumnMarkerMapId'),
          mapName: () => this.$t('tableColumnMapName'),
          chromosome: () => this.$t('tableColumnMapChromosome'),
          position: () => this.$t('tableColumnMapPosition')
        },
        columnsClasses: {
          markerId: 'text-right',
          mapId: 'text-right',
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
