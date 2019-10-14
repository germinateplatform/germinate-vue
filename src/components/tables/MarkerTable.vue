<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
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
import defaultProps from '@/const/table-props.js'

export default {
  name: 'MarkerTable',
  props: {
    ...defaultProps.FULL,
    selectable: {
      type: Boolean,
      default: false
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
