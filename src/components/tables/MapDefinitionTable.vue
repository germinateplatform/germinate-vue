<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               itemType="markers"
               ref="mapDefinitionTable"
               v-on="$listeners">
      <!-- Synonyms -->
      <!-- Marker id link -->
      <template v-slot:cell(markerId)="data">
        <router-link :to="{name: Pages.markerDetails, params: { markerId: data.item.markerId }}">{{ data.item.markerId }}</router-link>
      </template>
      <!-- Marker name link -->
      <template v-slot:cell(markerName)="data">
        <router-link :to="{name: Pages.markerDetails, params: { markerId: data.item.markerId }}">{{ data.item.markerName }}</router-link>
      </template>
      <template v-slot:cell(synonyms)="data">
        <span v-if="data.item.synonyms">{{ data.item.synonyms.join(', ') }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { Pages } from '@/mixins/pages'

export default {
  name: 'MapDefinitionTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      Pages,
      options: {
        idColumn: 'markerId',
        tableName: 'mapDefinitions'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'markerId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnMarkerId')
        }, {
          key: 'markerName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnMarkerName'),
          preferredSortingColumn: true
        }, {
          key: 'synonyms',
          type: 'json',
          sortable: true,
          label: this.$t('tableColumnMarkerSynonyms')
        }, {
          key: 'mapFeatureType',
          type: String,
          sortable: true,
          label: this.$t('tableColumnMapFeatureType')
        }, {
          key: 'mapId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnMarkerMapId')
        }, {
          key: 'mapName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnMapName')
        }, {
          key: 'chromosome',
          type: String,
          sortable: true,
          label: this.$t('tableColumnMapChromosome')
        }, {
          key: 'position',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnMapPosition'),
          formatter: value => (value !== undefined && value !== null) ? getNumberWithSuffix(value, 2) : null
        }, {
          key: 'marked',
          type: null,
          sortable: false,
          class: 'text-right',
          label: ''
        }
      ]
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
