<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               itemType="germplasm"
               ref="germplasmTable"
               v-on="$listeners">
      <!-- LINKS -->
      <router-link slot="germplasmId" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmId }}</router-link>
      <router-link slot="germplasmName" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmName }}</router-link>
      <router-link slot="germplasmGid" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmGid }}</router-link>
      <router-link slot="germplasmNumber" slot-scope="props" :to="'/data/germplasm/' + props.row.germplasmId">{{ props.row.germplasmNumber }}</router-link>

      <span slot="entityTypeName" slot-scope="props" class="text-nowrap"><i :class="`mdi mdi-18px ${entityTypes[props.row.entityTypeName].icon} fix-alignment`" :style="`color: ${entityTypes[props.row.entityTypeName].color()};`" /> {{ entityTypes[props.row.entityTypeName].text() }}</span>

      <span slot="synonyms" slot-scope="props" v-if="props.row.synonyms">{{ props.row.synonyms.join(', ') }}</span>
      <span slot="elevation" slot-scope="props" v-if="props.row.elevation !== undefined">{{ props.row.elevation.toFixed(2) }}</span>

      <!-- Country flags -->
      <span slot="countryName" slot-scope="props" class="table-country" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode.toLowerCase()" v-if="props.row.countryCode"/> <span> {{ props.row.countryCode }}</span></span>
      <!-- Formatted date -->
      <span slot="collDate" slot-scope="props" v-if="props.row.collDate">{{ props.row.collDate | toDate }}</span>
      <!-- Image preview -->
      <div slot="imageCount" slot-scope="props" class="table-image" v-if="props.row.imageCount !== undefined && props.row.imageCount > 0">
        <div :id="`table-image-popover-${props.row.germplasmId}`">
          <i class="mdi mdi-18px mdi-camera"/> <span> {{ props.row.imageCount }}</span>
        </div>
        <b-popover
          :target="`table-image-popover-${props.row.germplasmId}`"
          placement="top"
          boundary="window"
          triggers="hover focus">
          <b-img fluid :src="getSrc(props.row)" />
        </b-popover>
      </div>
      <!-- Biological status popover -->
      <div slot="biologicalStatusName" slot-scope="props" v-if="props.row.biologicalStatusName">
        <span :id="`table-biostat-popover-${props.row.germplasmId}`">{{ props.row.biologicalStatusName.split(" (")[0] }}</span>
        <b-popover
          :target="`table-biostat-popover-${props.row.germplasmId}`"
          placement="top"
          boundary="window"
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

      <div slot="h__germplasmPuid">
        <span>{{ options.headings.germplasmPuid() }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipGermplasmPuid')"/>
      </div>
    </BaseTable>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import BaseTable from '@/components/tables/BaseTable'

import defaultProps from '@/const/table-props.js'

export default {
  name: 'GermplasmTable',
  props: {
    ...defaultProps.FULL,
    orderBy: {
      type: String,
      default: null
    },
    selectable: {
      type: Boolean,
      default: false
    },
    tableMode: {
      type: String,
      default: 'base'
    }
  },
  data: function () {
    var columns = [
      {
        name: 'germplasmId',
        type: Number
      }, {
        name: 'germplasmName',
        type: String
      }, {
        name: 'germplasmGid',
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
        name: 'institutionId',
        type: Number
      }, {
        name: 'institutionName',
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
        name: 'location',
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
        name: 'distance',
        type: undefined
      }, {
        name: 'marked',
        type: undefined
      }
    ]

    if (this.tableMode !== 'distance') {
      columns = columns.filter(c => c.name !== 'distance')
    }

    if (this.selectable === true) {
      columns.unshift({
        name: 'selected',
        type: undefined
      })
    }

    var options = {
      idColumn: 'germplasmId',
      tableName: 'germplasm',
      sortable: ['germplasmId', 'germplasmGid', 'germplasmName', 'germplasmNumber', 'germplasmPuid', 'entityTypeName', 'biologicalStatusName', 'synonyms', 'collectorNumber', 'genus', 'species', 'subtaxa', 'institutionId', 'institutionName', 'location', 'elevation', 'countryName', 'collDate', 'pdci'],
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
        institutionId: () => this.$t('tableColumnInstitutionId'),
        institutionName: () => this.$t('tableColumnInstitutionName'),
        location: () => this.$t('tableColumnGermplasmLocation'),
        elevation: () => this.$t('tableColumnElevation'),
        countryName: () => this.$t('tableColumnCountryName'),
        collDate: () => this.$t('tableColumnColldate'),
        pdci: () => this.$t('tableColumnPdci'),
        imageCount: () => '',
        distance: () => this.$t('tableColumnGermplasmDistance'),
        marked: () => ''
      },
      columnsClasses: {
        germplasmId: 'text-right',
        institutionId: 'text-right',
        elevation: 'text-right',
        genus: 'font-italic',
        species: 'font-italic',
        subtaxa: 'font-italic'
      },
      additionalMarkingOptions: [{
        key: 'mark-parents',
        text: () => 'Mark entity parents',
        icon: 'mdi-chevron-up-box',
        callback: (item) => this.markParents(item)
      }, {
        key: 'unmark-parents',
        text: () => 'Unark entity parents',
        icon: 'mdi-chevron-up-box-outline',
        callback: (item) => this.unmarkParents(item)
      }, {
        key: 'mark-children',
        text: () => 'Mark entity children',
        icon: 'mdi-chevron-down-box',
        callback: (item) => this.markChildren(item)
      }, {
        key: 'unmark-children',
        text: () => 'Unark entity children',
        icon: 'mdi-chevron-down-box-outline',
        callback: (item) => this.unmarkChildren(item)
      }]
    }

    if (this.orderBy !== null) {
      options.orderBy = {
        column: this.orderBy
      }
    }

    return {
      options: options,
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    markParents: function (item) {
      if (item) {
        var parentId = item.entityParentId
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'germplasm', ids: [parentId] })
      } else {
        EventBus.$emit('show-loading', true)
        var requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'up', result => {
            this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'germplasm', ids: result })
            EventBus.$emit('show-loading', false)
          })
        })
      }
    },
    markChildren: function (item) {
      if (item) {
        EventBus.$emit('show-loading', true)
        var id = item.germplasmId
        this.apiPostEntityIds([id], 'down', result => {
          this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'germplasm', ids: result })
          EventBus.$emit('show-loading', false)
        })
      } else {
        EventBus.$emit('show-loading', true)
        var requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'down', result => {
            this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'germplasm', ids: result })
            EventBus.$emit('show-loading', false)
          })
        })
      }
    },
    unmarkParents: function (item) {
      if (item) {
        var parentId = item.entityParentId
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'germplasm', ids: [parentId] })
      } else {
        EventBus.$emit('show-loading', true)
        var requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'up', result => {
            this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'germplasm', ids: result })
            EventBus.$emit('show-loading', false)
          })
        })
      }
    },
    unmarkChildren: function (item) {
      if (item) {
        EventBus.$emit('show-loading', true)
        var id = item.germplasmId
        this.apiPostEntityIds([id], 'down', result => {
          this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'germplasm', ids: result })
          EventBus.$emit('show-loading', false)
        })
      } else {
        EventBus.$emit('show-loading', true)
        var requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'down', result => {
            this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'germplasm', ids: result })
            EventBus.$emit('show-loading', false)
          })
        })
      }
    },
    getSrc: function (germplasm) {
      var params = {
        name: germplasm.firstImagePath,
        type: 'database',
        size: 'small',
        token: this.token ? this.token.imageToken : ''
      }

      var paramString = this.toUrlString(params)

      return this.baseUrl + 'image/src?' + paramString
    },
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
