<template>
  <div>
    <BaseTable :options="options" :columns="columns" itemType="germplasm">
      <div slot="countryname" slot-scope="props" class="table-country"><i :class="'flag-icon flag-icon-' + props.row.countrycode.toLowerCase()" v-if="props.row.countrycode"/> <span> {{ props.row.countryname }}</span></div>
      <span slot="colldate" slot-scope="props">{{ props.row.colldate | toDate }}</span>
      <div slot="imagecount" slot-scope="props" class="table-image" v-if="props.row.imagecount && props.row.imagecount > 0">
        <div :id="`table-image-popover-${props.row.germplasmid}`">
          <i class="mdi mdi-18px mdi-camera"/> <span> {{ props.row.imagecount }}</span>
        </div>
        <b-popover
          :target="`table-image-popover-${props.row.germplasmid}`"
          placement="top"
          triggers="hover focus">
          <b>{{ props.row.firstimagepath }}</b>
        </b-popover>
      </div>
      <div slot="biologicalstatusname" slot-scope="props" v-if="props.row.biologicalstatusname">
        <span :id="`table-biostat-popover-${props.row.germplasmid}`">{{ props.row.biologicalstatusname.split(" (")[0] }}</span>
        <b-popover
          :target="`table-biostat-popover-${props.row.germplasmid}`"
          placement="top"
          triggers="hover focus">
          {{ props.row.biologicalstatusname }}
        </b-popover>
      </div>
      <div slot="pdci" slot-scope="props" v-if="props.row.pdci" class="table-pdci">
        <peity type="donut" :options="{ 'fill': ['#00acef', '#cccccc'] }" :data="`${props.row.pdci}/10`"></peity>
        <span> {{ props.row.pdci.toFixed(2) }}</span>
      </div>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import Peity from 'vue-peity'

export default {
  name: 'GermplasmTable',
  data: function () {
    const columns = ['germplasmid', 'germplasmgid', 'germplasmname', 'germplasmnumber', 'germplasmpuid', 'entitytypename', 'biologicalstatusname', 'synonyms', 'collectornumber', 'genus', 'species', 'subtaxa', 'elevation', 'countryname', 'colldate', 'imagecount', 'pdci', 'selected']
    return {
      options: {
        requestData: (data, callback) => {
          return this.apiGetGermplasmTable(data, callback)
        },
        idColumn: 'germplasmid',
        sortable: ['germplasmid', 'germplasmgid', 'germplasmname', 'germplasmnumber', 'germplasmpuid', 'entitytypename', 'biologicalstatusname', 'synonyms', 'collectornumber', 'genus', 'species', 'subtaxa', 'elevation', 'countryname', 'colldate', 'pdci'],
        filterable: [],
        headings: {
          germplasmid: () => this.$t('tableColumnGermplasmId'),
          germplasmgid: () => this.$t('tableColumnGermplasmGeneralIdentifier'),
          germplasmname: () => this.$t('tableColumnGermplasmName'),
          germplasmnumber: () => this.$t('tableColumnGermplasmNumber'),
          germplasmpuid: () => this.$t('tableColumnGermplasmPuid'),
          entitytypename: () => this.$t('tableColumnEntityType'),
          biologicalstatusname: () => this.$t('tableColumnBiologicalStatus'),
          synonyms: () => this.$t('tableColumnSynonyms'),
          collectornumber: () => this.$t('tableColumnCollectorNumber'),
          genus: () => this.$t('tableColumnGenus'),
          species: () => this.$t('tableColumnSpecies'),
          subtaxa: () => this.$t('tableColumnSubtaxa'),
          elevation: () => this.$t('tableColumnElevation'),
          countryname: () => this.$t('tableColumnCountryName'),
          colldate: () => this.$t('tableColumnColldate'),
          pdci: () => this.$t('tableColumnPdci'),
          imagecount: () => '',
          selected: () => ''
        },
        columnsClasses: {
          genus: 'font-italic',
          species: 'font-italic',
          subtaxa: 'font-italic',
          selected: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable,
    Peity
  },
  methods: {
    requestData: function (data, callback) {
      return this.apiGetGermplasm(data, callback)
    }
  }
}
</script>

<style>
.table-image,
.table-pdci,
.table-country {
  white-space: nowrap;
}
.table-image * {
  vertical-align: top;
}
.pdci-table > svg {
  vertical-align: sub;
}
.table-country > * {
  vertical-align: middle;
}
.table-country > i {
  font-size: 1.3rem;
}
</style>
