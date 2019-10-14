<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               itemType="germplasm"
               ref="compoundDataTable"
               v-on="$listeners">
      <router-link slot="germplasmId" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmId }}</router-link>
      <router-link slot="germplasmName" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmName }}</router-link>
      <router-link slot="germplasmGid" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmGid }}</router-link>
      <span slot="entityType" slot-scope="props" class="text-nowrap"><i :class="`mdi mdi-18px ${entityTypes[props.row.entityType].icon} fix-alignment`" :style="`color: ${entityTypes[props.row.entityType].color()};`" /> {{ entityTypes[props.row.entityType].text() }}</span>
      <!-- Formatted date -->
      <span slot="recordingDate" slot-scope="props" v-if="props.row.recordingDate">{{ props.row.recordingDate | toDate }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'CompoundDataTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    const columns = [
      {
        name: 'germplasmId',
        type: Number
      }, {
        name: 'germplasmGid',
        type: String
      }, {
        name: 'germplasmName',
        type: String
      }, {
        name: 'entityType',
        type: 'entityType'
      }, {
        name: 'datasetName',
        type: String
      }, {
        name: 'compoundName',
        type: String
      }, {
        name: 'unitName',
        type: String
      }, {
        name: 'recordingDate',
        type: Date
      }, {
        name: 'compoundValue',
        type: String
      }, {
        name: 'marked',
        type: null
      }
    ]
    return {
      options: {
        idColumn: 'germplasmId',
        tableName: 'trialsData',
        sortable: ['germplasmId', 'germplasmGid', 'germplasmName', 'entityType', 'datasetName', 'compoundName', 'unitName', 'recordingDate', 'compoundValue'],
        filterable: [],
        headings: {
          germplasmId: () => this.$t('tableColumnGermplasmId'),
          germplasmGid: () => this.$t('tableColumnGermplasmGeneralIdentifier'),
          germplasmName: () => this.$t('tableColumnGermplasmName'),
          entityType: () => this.$t('tableColumnEntityType'),
          datasetName: () => this.$t('tableColumnDatasetName'),
          locationName: () => this.$t('tableColumnLocationName'),
          countryName: () => this.$t('tableColumnCountryName'),
          compoundName: () => this.$t('tableColumnCompoundName'),
          unitName: () => this.$t('tableColumnCompoundUnitName'),
          recordingDate: () => this.$t('tableColumnCompoundDataRecordingDate'),
          compoundValue: () => this.$t('tableColumnCompoundDataCompoundValue')
        },
        columnsClasses: {
          germplasmId: 'text-right',
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
      this.$refs.compoundDataTable.refresh()
    }
  }
}
</script>

<style>
</style>
