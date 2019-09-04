<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <router-link slot="mapId" slot-scope="props" :to="`/data/genotypes/maps/${props.row.mapId}`" event="" @click.native.prevent="$emit('map-selected', props.row.mapId)">{{ props.row.mapId }}</router-link>
      <router-link slot="mapName" slot-scope="props" :to="`/data/genotypes/maps/${props.row.mapId}`" event="" @click.native.prevent="$emit('map-selected', props.row.mapId)">{{ props.row.mapName }}</router-link>
      <div slot="mapDescription" slot-scope="props" v-if="isLink(props.row)"> <span v-html="props.row.mapDescription" />&nbsp;<i class="mdi mdi-open-in-new" /></div>
      <span v-else>{{ props.row.mapDescription }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'MapsTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    }
  },
  data: function () {
    const columns = [
      {
        name: 'mapId',
        type: Number
      }, {
        name: 'mapName',
        type: String
      }, {
        name: 'mapDescription',
        type: String
      }, {
        name: 'markerCount',
        type: Number
      }
    ]
    return {
      options: {
        requestData: (data, callback) => {
          return this.apiPostMapsTable(data, callback)
        },
        idColumn: 'mapId',
        tableName: 'maps',
        filterOn: this.filterOn,
        sortable: columns,
        filterable: [],
        headings: {
          mapId: () => this.$t('tableColumnMapId'),
          mapName: () => this.$t('tableColumnMapName'),
          mapDescription: () => this.$t('tableColumnMapDescription'),
          markerCount: () => this.$t('tableColumnMapMarkerCount')
        },
        columnsClasses: {
          mapId: 'text-right',
          markerCount: 'text-right'
        }
      },
      columns: columns
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
