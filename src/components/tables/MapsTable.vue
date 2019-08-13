<template>
  <div>
    <BaseTable :options="options" :columns="columns">
      <router-link slot="mapid" slot-scope="props" :to="'/data/genotypes/maps/' + props.row.mapid" event="" @click.native.prevent="$emit('map-selected', props.row.mapid)">{{ props.row.mapid }}</router-link>
      <router-link slot="mapname" slot-scope="props" :to="'/data/genotypes/maps/' + props.row.mapid" event="" @click.native.prevent="$emit('map-selected', props.row.mapid)">{{ props.row.mapname }}</router-link>
      <div slot="mapdescription" slot-scope="props" v-if="isLink(props.row)"> <span v-html="props.row.mapdescription" />&nbsp;<i class="mdi mdi-open-in-new" /></div>
      <span v-else>{{ props.row.mapdescription }}</span>
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
    const columns = ['mapid', 'mapname', 'mapdescription', 'markercount']
    return {
      options: {
        requestData: (data, callback) => {
          return this.apiPostMapsTable(data, callback)
        },
        idColumn: 'mapid',
        tableName: 'maps',
        filterOn: this.filterOn,
        sortable: columns,
        filterable: [],
        headings: {
          mapid: () => this.$t('tableColumnMapId'),
          mapname: () => this.$t('tableColumnMapName'),
          mapdescription: () => this.$t('tableColumnMapDescription'),
          markercount: () => this.$t('tableColumnMapMarkerCount')
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
      if (!map.mapdescription || map.mapdescription.length < 1) {
        return false
      } else {
        return map.mapdescription.indexOf('https://') !== -1 ||
               map.mapdescription.indexOf('http://') !== -1 ||
               map.mapdescription.indexOf('ftp://') !== -1
      }
    }
  }
}
</script>

<style>
</style>
