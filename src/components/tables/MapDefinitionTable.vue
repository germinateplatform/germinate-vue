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
import utilMixin from '@/mixins/util'
import formattingMixin from '@/mixins/formatting'

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
          class: 'text-right',
          label: this.$t('tableColumnMarkerId')
        }, {
          key: 'markerName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnMarkerName'),
          preferedSortingColumn: true
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
          formatter: value => value ? this.getNumberWithSuffix(value.value, 2) : null
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
  mixins: [formattingMixin, utilMixin],
  methods: {
    refresh: function () {
      this.$refs.mapDefinitionTable.refresh()
    }
  }
}
</script>

<style>
</style>
