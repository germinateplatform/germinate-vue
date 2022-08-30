<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               primary-key="markerId"
               v-bind="$props"
               itemType="markers"
               ref="markerTable"
               v-on="$listeners">
      <!-- Marker id link -->
      <template v-slot:cell(markerId)="data">
        <router-link :to="{name: 'marker', params: { markerId: data.item.markerId }}">{{ data.item.markerId }}</router-link>
      </template>
      <!-- Marker name link -->
      <template v-slot:cell(markerName)="data">
        <router-link :to="{name: 'marker', params: { markerId: data.item.markerId }}">{{ data.item.markerName }}</router-link>
      </template>
      <!-- Synonyms -->
      <template v-slot:cell(markerSynonyms)="data">
        <span v-if="data.item.markerSynonyms">{{ data.item.markerSynonyms.join(', ') }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import utilMixin from '@/mixins/util'

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
      const result = [
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
          key: 'markerType',
          type: String,
          sortable: true,
          label: this.$t('tableColumnMarkerType')
        }, {
          key: 'markerSynonyms',
          type: 'json',
          sortable: true,
          label: this.$t('tableColumnMarkerSynonyms')
        }, {
          key: 'marked',
          type: undefined,
          sortable: false,
          class: 'text-right',
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
  mixins: [utilMixin],
  methods: {
    refresh: function () {
      this.$refs.markerTable.refresh()
    }
  }
}
</script>

<style>
</style>
