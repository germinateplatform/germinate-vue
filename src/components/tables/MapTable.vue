<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               v-on="$listeners">
      <template v-slot:cell(mapId)="data">
        <router-link :to="`/data/genotypes/maps/${data.item.mapId}`" event="" @click.native.prevent="$emit('map-selected', data.item.mapId)">{{ data.item.mapId }}</router-link>
      </template>
      <template v-slot:cell(mapName)="data">
        <router-link :to="`/data/genotypes/maps/${data.item.mapId}`" event="" @click.native.prevent="$emit('map-selected', data.item.mapId)">{{ data.item.mapName }}</router-link>
      </template>
      <template v-slot:cell(mapDescription)="data">
        <div v-if="isLink(data.item)"> <span v-html="data.item.mapDescription" />&nbsp;<i class="mdi mdi-open-in-new" /></div>
        <span v-else>{{ data.item.mapDescription }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'MapTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      options: {
        idColumn: 'mapId',
        tableName: 'maps'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'mapId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'mapId')}`,
          label: this.$t('tableColumnMapId')
        }, {
          key: 'mapName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'mapName')}`,
          label: this.$t('tableColumnMapName')
        }, {
          key: 'mapDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'mapDescription')}`,
          label: this.$t('tableColumnMapDescription')
        }, {
          key: 'markerCount',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'markerCount')}`,
          label: this.$t('tableColumnMapMarkerCount'),
          formatter: this.$options.filters.toThousandSeparators
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  methods: {
    isLink: function (map) {
      if (!map.mapDescription || map.mapDescription.length < 1) {
        return false
      } else {
        return map.mapDescription.indexOf('https://') !== -1 ||
               map.mapDescription.indexOf('http://') !== -1 ||
               map.mapDescription.indexOf('ftp://') !== -1
      }
    }
  }
}
</script>

<style>
</style>
