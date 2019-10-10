<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :getIds="getIds"
               :filterOn="filterOn"
               itemType="germplasm"
               ref="trialsDataTable"
               v-on="$listeners">
      <router-link slot="germplasmId" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmId }}</router-link>
      <router-link slot="germplasmName" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmName }}</router-link>
      <router-link slot="germplasmGid" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmGid }}</router-link>
      <span slot="entityType" slot-scope="props" class="text-nowrap"><i :class="`mdi mdi-18px ${entityTypes[props.row.entityType].icon} fix-alignment`" :style="`color: ${entityTypes[props.row.entityType].color()};`" /> {{ entityTypes[props.row.entityType].text() }}</span>
      <!-- Country flags -->
      <span slot="countryName" slot-scope="props" class="table-country" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode2.toLowerCase()" v-if="props.row.countryCode2"/> <span> {{ props.row.countryCode2 }}</span></span>
      <!-- Formatted date -->
      <span slot="recordingDate" slot-scope="props" v-if="props.row.recordingDate">{{ props.row.recordingDate | toDate }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'TrialsDataTable',
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
    }
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
        name: 'locationName',
        type: String
      }, {
        name: 'countryName',
        type: String
      }, {
        name: 'traitName',
        type: String
      }, {
        name: 'unitName',
        type: String
      }, {
        name: 'recordingDate',
        type: Date
      }, {
        name: 'traitValue',
        type: String
      }, {
        name: 'marked',
        type: null
      }
    ]
    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'germplasmId',
        tableName: 'trialsData',
        sortable: ['germplasmId', 'germplasmGid', 'germplasmName', 'entityType', 'datasetName', 'locationName', 'countryName', 'traitName', 'unitName', 'recordingDate', 'traitValue'],
        filterable: [],
        headings: {
          germplasmId: () => this.$t('tableColumnGermplasmId'),
          germplasmGid: () => this.$t('tableColumnGermplasmGeneralIdentifier'),
          germplasmName: () => this.$t('tableColumnGermplasmName'),
          entityType: () => this.$t('tableColumnEntityType'),
          datasetName: () => this.$t('tableColumnDatasetName'),
          locationName: () => this.$t('tableColumnLocationName'),
          countryName: () => this.$t('tableColumnCountryName'),
          traitName: () => this.$t('tableColumnTraitName'),
          unitName: () => this.$t('tableColumnTraitUnitName'),
          recordingDate: () => this.$t('tableColumnTrialsDataRecordingDate'),
          traitValue: () => this.$t('tableColumnTrialsDataTraitValue')
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
      this.$refs.trialsDataTable.refresh()
    }
  }
}
</script>

<style>
</style>
