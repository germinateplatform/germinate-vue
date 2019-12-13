<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               itemType="markers"
               ref="markerTable"
               v-on="$listeners">
      <template v-slot:cell(markerId)="data">
        <router-link :to="'/data/genotype/marker/' + data.item.markerId">{{ data.item.markerId }}</router-link>
      </template>
      <template v-slot:cell(markerName)="data">
        <router-link :to="'/data/genotype/marker/' + data.item.markerId">{{ data.item.markerName }}</router-link>
      </template>
      <template v-slot:cell(markerSynonyms)="data">
        <span v-if="data.item.markerSynonyms">{{ data.item.markerSynonyms.join(', ') }}</span>
      </template>
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
    return {
      options: {
        idColumn: 'markerId',
        tableName: 'markers'
      }
    }
  },
  computed: {
    columns: function () {
      var result = [
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
          label: this.$t('tableColumnMarkerName')
        }, {
          key: 'markerType',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'markerType')}`,
          label: this.$t('tableColumnMarkerType')
        }, {
          key: 'markerSynonyms',
          type: 'json',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'markerSynonyms')}`,
          label: this.$t('tableColumnMarkerSynonyms')
        }, {
          key: 'marked',
          type: undefined,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'marked')}`,
          label: ''
        }
      ]

      if (this.selectable === true) {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          label: ''
        })
      }

      return result
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
