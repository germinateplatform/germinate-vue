<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               v-on="$listeners">
      <router-link slot="mapId" slot-scope="props" :to="`/data/genotypes/maps/${props.row.mapId}`" event="" @click.native.prevent="$emit('map-selected', props.row.mapId)">{{ props.row.mapId }}</router-link>
      <router-link slot="mapName" slot-scope="props" :to="`/data/genotypes/maps/${props.row.mapId}`" event="" @click.native.prevent="$emit('map-selected', props.row.mapId)">{{ props.row.mapName }}</router-link>
      <div slot="mapDescription" slot-scope="props" v-if="isLink(props.row)"> <span v-html="props.row.mapDescription" />&nbsp;<i class="mdi mdi-open-in-new" /></div>
      <span v-else>{{ props.row.mapDescription }}</span>
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
        idColumn: 'mapId',
        tableName: 'maps',
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
