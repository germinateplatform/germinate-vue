<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               primary-key="climateId"
               v-bind="$props"
               ref="climateTable"
               v-on="$listeners">
      <!-- Climate id link -->
      <template v-slot:cell(climateId)="data">
        <router-link :to="{ name: Pages.climateDetails, params: { climateId: data.item.climateId } }">{{ data.item.climateId }}</router-link>
      </template>
      <!-- Climate name link -->
      <template v-slot:cell(climateName)="data">
        <router-link :to="{ name: Pages.climateDetails, params: { climateId: data.item.climateId } }">{{ data.item.climateName }}</router-link>
      </template>
      <!-- Climate short name link -->
      <template v-slot:cell(climateNameShort)="data">
        <router-link :to="{ name: Pages.climateDetails, params: { climateId: data.item.climateId } }">{{ data.item.climateNameShort }}</router-link>
      </template>
      <!-- Climate description link -->
      <template v-slot:cell(climateDescription)="data">
        <router-link :to="{ name: Pages.climateDetails, params: { climateId: data.item.climateId } }">{{ data.item.climateDescription }}</router-link>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { Pages } from '@/mixins/pages'

export default {
  name: 'ClimateTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      Pages,
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
          class: 'text-right',
          sortable: true,
          label: this.$t('tableColumnClimateId')
        }, {
          key: 'climateName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateName'),
          preferedSortingColumn: true
        }, {
          key: 'climateNameShort',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateNameShort')
        }, {
          key: 'climateDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateDescription')
        }, {
          key: 'unitName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateUnitName')
        }, {
          key: 'unitDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateUnitDescription')
        }, {
          key: 'unitAbbreviation',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateUnitAbbreviation')
        }, {
          key: 'count',
          type: Number,
          class: 'text-right',
          sortable: true,
          label: this.$t('tableColumnClimateDataPoints'),
          formatter: value => getNumberWithSuffix(value, 2)
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  methods: {
    refresh: function () {
      this.$refs.climateTable.refresh()
    }
  }
}
</script>

<style>
</style>
