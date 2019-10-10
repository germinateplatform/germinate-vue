<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :getIds="getIds"
               :filterOn="filterOn"
               :tableActions="tableActions"
               itemType="markers"
               ref="markerTable"
               v-on="$listeners">
      <!-- LINKS -->
      <router-link slot="markerId" slot-scope="props" :to="'/data/genotype/marker/' + props.row.markerId">{{ props.row.markerId }}</router-link>
      <router-link slot="markerName" slot-scope="props" :to="'/data/genotype/marker/' + props.row.markerId">{{ props.row.markerName }}</router-link>
      <span slot="markerSynonyms" slot-scope="props" v-if="props.row.markerSynonyms">{{ props.row.markerSynonyms.join(', ') }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'MarkerTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    },
    getData: {
      type: Function,
      default: () => {}
    },
    getIds: {
      type: Function,
      default: () => []
    },
    selectable: {
      type: Boolean,
      default: false
    },
    tableActions: {
      type: Array,
      default: () => null
    }
  },
  data: function () {
    var columns = [{
      name: 'markerId',
      type: Number
    }, {
      name: 'markerName',
      type: String
    }, {
      name: 'markerType',
      type: String
    }, {
      name: 'markerSynonyms',
      type: String
    }, {
      name: 'marked',
      type: undefined
    }]

    if (this.selectable === true) {
      columns.unshift({
        name: 'selected',
        type: undefined
      })
    }

    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'markerId',
        tableName: 'markers',
        sortable: ['markerId', 'markerName', 'markerType', 'markerSynonyms'],
        filterable: [],
        headings: {
          selected: '',
          markerId: () => this.$t('tableColumnMarkerId'),
          markerName: () => this.$t('tableColumnMarkerName'),
          markerType: () => this.$t('tableColumnMarkerType'),
          markerSynonyms: () => this.$t('tableColumnMarkerSynonyms'),
          marked: () => ''
        },
        columnsClasses: {
          markerId: 'text-right',
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
      this.$refs.markerTable.refresh()
    }
  }
}
</script>

<style>
</style>
