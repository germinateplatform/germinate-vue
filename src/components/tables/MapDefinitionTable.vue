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
        <router-link :to="{name: 'marker', params: { markerId: data.item.markerId }}">{{ data.item.markerId }}</router-link>
      </template>
      <!-- Marker name link -->
      <template v-slot:cell(markerName)="data">
        <router-link :to="{name: 'marker', params: { markerId: data.item.markerId }}">{{ data.item.markerName }}</router-link>
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

export default {
  name: 'MapDefinitionTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
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
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'markerId')}`,
          label: this.$t('tableColumnMarkerId')
        }, {
          key: 'markerName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'markerName')}`,
          label: this.$t('tableColumnMarkerName'),
          preferedSortingColumn: true
        }, {
          key: 'synonyms',
          type: 'json',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'synonyms')}`,
          label: this.$t('tableColumnMarkerSynonyms')
        }, {
          key: 'mapFeatureType',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'mapFeatureType')}`,
          label: this.$t('tableColumnMapFeatureType')
        }, {
          key: 'mapId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'mapId')}`,
          label: this.$t('tableColumnMarkerMapId')
        }, {
          key: 'mapName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'mapName')}`,
          label: this.$t('tableColumnMapName')
        }, {
          key: 'chromosome',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'chromosome')}`,
          label: this.$t('tableColumnMapChromosome')
        }, {
          key: 'position',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'position')}`,
          label: this.$t('tableColumnMapPosition'),
          formatter: this.$options.filters.toThousandSeparators
        }, {
          key: 'marked',
          type: null,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'marked')}`,
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
