<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               v-on="$listeners">
      <!-- Map id link -->
      <template v-slot:cell(mapId)="data">
        <router-link :to="{ name: 'map-details', params: { mapId: data.item.mapId } }" event="" @click.native.prevent="$emit('map-selected', data.item.mapId)">{{ data.item.mapId }}</router-link>
      </template>
      <!-- Map name link -->
      <template v-slot:cell(mapName)="data">
        <router-link :to="{ name: 'map-details', params: { mapId: data.item.mapId } }" event="" @click.native.prevent="$emit('map-selected', data.item.mapId)">{{ data.item.mapName }}</router-link>
      </template>
      <!-- Map description -->
      <template v-slot:cell(mapDescription)="data">
        <!-- If the description is HTML and contains a link, just show it -->
        <div v-if="isLink(data.item)"> <span v-html="data.item.mapDescription" />&nbsp;<i class="mdi mdi-open-in-new" /></div>
        <!-- Otherwise display the description as text -->
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
          label: this.$t('tableColumnMapName'),
          preferedSortingColumn: true
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
               map.mapDescription.indexOf('sftp://') !== -1 ||
               map.mapDescription.indexOf('ftp://') !== -1
      }
    }
  }
}
</script>

<style>
</style>
