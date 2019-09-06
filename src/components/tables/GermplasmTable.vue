<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :getIds="getIds"
               :tableActions="tableActions"
               itemType="germplasm"
               ref="germplasmTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <!-- LINKS -->
      <router-link slot="germplasmId" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmId }}</router-link>
      <router-link slot="germplasmName" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmName }}</router-link>
      <router-link slot="germplasmGid" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmGid }}</router-link>
      <router-link slot="germplasmNumber" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmNumber }}</router-link>

      <span slot="entityTypeName" slot-scope="props" class="text-nowrap"><i :class="`mdi mdi-18px ${entityTypes[props.row.entityTypeName].icon} fix-alignment`" :style="`color: ${entityTypes[props.row.entityTypeName].color()};`" /> {{ entityTypes[props.row.entityTypeName].text() }}</span>

      <span slot="synonyms" slot-scope="props" v-if="props.row.synonyms">{{ props.row.synonyms.join(', ') }}</span>
      <span slot="elevation" slot-scope="props" v-if="props.row.elevation">{{ props.row.elevation.toFixed(2) }}</span>

      <!-- Country flags -->
      <span slot="countryName" slot-scope="props" class="table-country" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode.toLowerCase()" v-if="props.row.countryCode"/> <span> {{ props.row.countryCode }}</span></span>
      <!-- Formatted date -->
      <span slot="collDate" slot-scope="props" v-if="props.row.collDate">{{ props.row.collDate | toDate }}</span>
      <!-- Image preview -->
      <div slot="imageCount" slot-scope="props" class="table-image" v-if="props.row.imageCount && props.row.imageCount > 0">
        <div :id="`table-image-popover-${props.row.germplasmId}`">
          <i class="mdi mdi-18px mdi-camera"/> <span> {{ props.row.imageCount }}</span>
        </div>
        <b-popover
          :target="`table-image-popover-${props.row.germplasmId}`"
          placement="top"
          triggers="hover focus">
          <b>{{ props.row.firstImagePath }}</b>
        </b-popover>
      </div>
      <!-- Biological status popover -->
      <div slot="biologicalStatusName" slot-scope="props" v-if="props.row.biologicalStatusName">
        <span :id="`table-biostat-popover-${props.row.germplasmId}`">{{ props.row.biologicalStatusName.split(" (")[0] }}</span>
        <b-popover
          :target="`table-biostat-popover-${props.row.germplasmId}`"
          placement="top"
          triggers="hover focus">
          {{ props.row.biologicalStatusName }}
        </b-popover>
      </div>
      <!-- PDCI -->
      <div slot="pdci" slot-scope="props" v-if="props.row.pdci" class="table-pdci">
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg); vertical-align: text-bottom;">
          <g>
            <circle id="circle" style="stroke-dasharray: 44; stroke-dashoffset: 0;" r="7" cy="9" cx="9" stroke-width="4" stroke="#ccc" fill="none"/>
            <circle id="circle" :style="'stroke-dasharray: 44; stroke-dashoffset: ' + getPdci(props.row.pdci, 44) + ';'" r="7" cy="9" cx="9" stroke-width="4" stroke="#00acef" fill="none"/>
          </g>
        </svg>
        <span> {{ props.row.pdci.toFixed(2) }}</span>
      </div>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'GermplasmTable',
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
      name: 'germplasmId',
      type: Number
    }, {
      name: 'germplasmName',
      type: String
    }, {
      name: 'germplasmNumber',
      type: String
    }, {
      name: 'germplasmPuid',
      type: String
    }, {
      name: 'entityTypeName',
      type: 'entityType'
    }, {
      name: 'biologicalStatusName',
      type: String
    }, {
      name: 'synonyms',
      type: String
    }, {
      name: 'collectorNumber',
      type: String
    }, {
      name: 'genus',
      type: String
    }, {
      name: 'species',
      type: String
    }, {
      name: 'subtaxa',
      type: String
    }, {
      name: 'elevation',
      type: Number
    }, {
      name: 'countryName',
      type: String
    }, {
      name: 'collDate',
      type: Date
    }, {
      name: 'imageCount',
      type: Number
    }, {
      name: 'pdci',
      type: Number
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
        idColumn: 'germplasmId',
        tableName: 'germplasm',
        filterOn: this.filterOn,
        sortable: ['germplasmId', 'germplasmGid', 'germplasmName', 'germplasmNumber', 'germplasmPuid', 'entityTypeName', 'biologicalStatusName', 'synonyms', 'collectorNumber', 'genus', 'species', 'subtaxa', 'elevation', 'countryName', 'collDate', 'pdci'],
        filterable: [],
        headings: {
          selected: '',
          germplasmId: () => this.$t('tableColumnGermplasmId'),
          germplasmGid: () => this.$t('tableColumnGermplasmGeneralIdentifier'),
          germplasmName: () => this.$t('tableColumnGermplasmName'),
          germplasmNumber: () => this.$t('tableColumnGermplasmNumber'),
          germplasmPuid: () => this.$t('tableColumnGermplasmPuid'),
          entityTypeName: () => this.$t('tableColumnEntityType'),
          biologicalStatusName: () => this.$t('tableColumnBiologicalStatus'),
          synonyms: () => this.$t('tableColumnSynonyms'),
          collectorNumber: () => this.$t('tableColumnCollectorNumber'),
          genus: () => this.$t('tableColumnGenus'),
          species: () => this.$t('tableColumnSpecies'),
          subtaxa: () => this.$t('tableColumnSubtaxa'),
          elevation: () => this.$t('tableColumnElevation'),
          countryName: () => this.$t('tableColumnCountryName'),
          collDate: () => this.$t('tableColumnColldate'),
          pdci: () => this.$t('tableColumnPdci'),
          imageCount: () => '',
          marked: () => ''
        },
        columnsClasses: {
          germplasmId: 'text-right',
          elevation: 'text-right',
          genus: 'font-italic',
          species: 'font-italic',
          subtaxa: 'font-italic'
        },
        additionalMarkingOptions: [{
          key: 'mark-parents',
          text: () => 'Mark entity parents',
          icon: 'mdi-chevron-up-box',
          callback: () => ''
        }, {
          key: 'unmark-parents',
          text: () => 'Unark entity parents',
          icon: 'mdi-chevron-up-box-outline',
          callback: () => ''
        }, {
          key: 'mark-children',
          text: () => 'Mark entity children',
          icon: 'mdi-chevron-down-box',
          callback: () => ''
        }, {
          key: 'unmark-children',
          text: () => 'Unark entity children',
          icon: 'mdi-chevron-down-box-outline',
          callback: () => ''
        }]
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    getPdci: function (value, total) {
      return total - (value / 10 * total)
    },
    refresh: function () {
      this.$refs.germplasmTable.refresh()
    }
  }
}
</script>

<style>
.table-image,
.table-pdci {
  white-space: nowrap;
}
.table-image * {
  vertical-align: top;
}
.pdci-table > svg {
  vertical-align: sub;
}
</style>
