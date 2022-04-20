<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="climateTable"
               v-on="$listeners">
      <!-- Climate id link -->
      <template v-slot:cell(climateId)="data">
        <router-link :to="{ name: 'climate-details', params: { climateId: data.item.climateId } }">{{ data.item.climateId }}</router-link>
      </template>
      <!-- Climate name link -->
      <template v-slot:cell(climateName)="data">
        <router-link :to="{ name: 'climate-details', params: { climateId: data.item.climateId } }">{{ data.item.climateName }}</router-link>
      </template>
      <!-- Climate short name link -->
      <template v-slot:cell(climateNameShort)="data">
        <router-link :to="{ name: 'climate-details', params: { climateId: data.item.climateId } }">{{ data.item.climateNameShort }}</router-link>
      </template>
      <!-- Climate description link -->
      <template v-slot:cell(climateDescription)="data">
        <router-link :to="{ name: 'climate-details', params: { climateId: data.item.climateId } }">{{ data.item.climateDescription }}</router-link>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import utilMixin from '@/mixins/util'

export default {
  name: 'ClimateTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      options: {
        idColumn: 'climateId',
        tableName: 'climates'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'climateId',
          type: Number,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'climateId')}`,
          sortable: true,
          label: this.$t('tableColumnClimateId')
        }, {
          key: 'climateName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'climateName')}`,
          sortable: true,
          label: this.$t('tableColumnClimateName'),
          preferedSortingColumn: true
        }, {
          key: 'climateNameShort',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'climateNameShort')}`,
          sortable: true,
          label: this.$t('tableColumnClimateNameShort')
        }, {
          key: 'climateDescription',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'climateDescription')}`,
          sortable: true,
          label: this.$t('tableColumnClimateDescription')
        }, {
          key: 'unitName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitName')}`,
          sortable: true,
          label: this.$t('tableColumnClimateUnitName')
        }, {
          key: 'unitDescription',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitDescription')}`,
          sortable: true,
          label: this.$t('tableColumnClimateUnitDescription')
        }, {
          key: 'unitAbbreviation',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitAbbreviation')}`,
          sortable: true,
          label: this.$t('tableColumnClimateUnitAbbreviation')
        }, {
          key: 'count',
          type: Number,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'count')}`,
          sortable: true,
          label: this.$t('tableColumnClimateDataPoints'),
          formatter: value => (value !== undefined && value !== null) ? value.toLocaleString() : null
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  mixins: [utilMixin],
  methods: {
    refresh: function () {
      this.$refs.climateTable.refresh()
    }
  }
}
</script>

<style>
</style>
