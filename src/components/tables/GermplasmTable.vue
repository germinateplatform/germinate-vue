<template>
  <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              itemType="germplasm"
              ref="germplasmTable"
              v-on="$listeners">

    <template v-slot:head(germplasmPuid)="data">
      <span>{{ data.label }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipGermplasmPuid')"/>
    </template>
    <template v-slot:head(pdci)="data">
      <span>{{ data.label }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipGermplasmPdci')"/>
    </template>
    <template v-slot:head(dataTypes)="data">
      <span>{{ data.label }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipGermplasmDataTypes')"/>
    </template>

    <template v-slot:cell(germplasmId)="data">
      <router-link :to="'/data/germplasm/' + data.item.germplasmId">{{ data.item.germplasmId }}</router-link>
    </template>
    <template v-slot:cell(germplasmName)="data">
      <router-link :to="'/data/germplasm/' + data.item.germplasmId">{{ data.item.germplasmName }}</router-link>
    </template>
    <template v-slot:cell(germplasmGid)="data">
      <router-link :to="'/data/germplasm/' + data.item.germplasmId">{{ data.item.germplasmGid }}</router-link>
    </template>
    <template v-slot:cell(germplasmNumber)="data">
      <router-link :to="'/data/germplasm/' + data.item.germplasmId">{{ data.item.germplasmNumber }}</router-link>
    </template>
    <template v-slot:cell(entityTypeName)="data">
      <span class="text-nowrap"><i :class="`mdi mdi-18px ${entityTypes[data.item.entityTypeName].icon} fix-alignment`" :style="`color: ${entityTypes[data.item.entityTypeName].color()};`" /> {{ entityTypes[data.item.entityTypeName].text() }}</span>
    </template>

    <template v-slot:cell(synonyms)="data">
      <span v-if="data.item.synonyms">{{ data.item.synonyms.join(', ') }}</span>
    </template>

    <template v-slot:cell(elevation)="data">
      <span v-if="data.item.elevation !== undefined">{{ data.item.elevation.toFixed(2) }}</span>
    </template>
    <template v-slot:cell(latitude)="data">
      <span v-if="data.item.latitude !== undefined">{{ data.item.latitude.toFixed(2) }}</span>
    </template>
    <template v-slot:cell(longitude)="data">
      <span v-if="data.item.longitude !== undefined">{{ data.item.longitude.toFixed(2) }}</span>
    </template>

    <!-- Country flags -->
    <template v-slot:cell(countryName)="data">
      <span class="table-country text-nowrap" v-b-tooltip.hover :title="data.item.countryName"><i :class="'flag-icon flag-icon-' + data.item.countryCode.toLowerCase()" v-if="data.item.countryCode"/> <span> {{ data.item.countryCode }}</span></span>
    </template>
    <!-- Formatted date -->
    <template v-slot:cell(collDate)="data">
      <span v-if="data.item.collDate">{{ data.item.collDate | toDate }}</span>
    </template>

    <!-- Image preview -->
    <template v-slot:cell(imageCount)="data">
      <div class="table-image" v-if="data.item.imageCount !== undefined && data.item.imageCount > 0">
        <a href="#" class="text-dark" @click.prevent="" :id="`table-image-popover-${data.item.germplasmId}`" v-b-tooltip.hover :title="$t('tableTooltipGermplasmImage')">
          <i class="mdi mdi-18px mdi-camera"/> <span> {{ data.item.imageCount }}</span>
        </a>
        <b-popover
          :target="`table-image-popover-${data.item.germplasmId}`"
          custom-class="table-image-popover"
          placement="top"
          boundary="window"
          triggers="click blur">
          <img :src="getSrc(data.item)" />
        </b-popover>
      </div>
    </template>

    <!-- Biological status popover -->
    <template v-slot:cell(biologicalStatusName)="data">
      <div v-if="data.item.biologicalStatusName">
        <span :id="`table-biostat-popover-${data.item.germplasmId}`">{{ data.item.biologicalStatusName.split(" (")[0] }}</span>
        <b-popover
          :target="`table-biostat-popover-${data.item.germplasmId}`"
          placement="top"
          boundary="window"
          triggers="hover focus">
          {{ data.item.biologicalStatusName }}
        </b-popover>
      </div>
    </template>

    <!-- PDCI -->
    <template v-slot:cell(pdci)="data">
      <div v-if="data.item.pdci" class="table-pdci">
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg); vertical-align: text-bottom;">
          <g>
            <circle id="circle" style="stroke-dasharray: 44; stroke-dashoffset: 0;" r="7" cy="9" cx="9" stroke-width="4" stroke="#ccc" fill="none"/>
            <circle id="circle" :style="'stroke-dasharray: 44; stroke-dashoffset: ' + getPdci(data.item.pdci, 44) + ';'" r="7" cy="9" cx="9" stroke-width="4" stroke="#2f353a" fill="none"/>
          </g>
        </svg>
        <span> {{ data.item.pdci.toFixed(2) }}</span>
      </div>
    </template>

    <template v-slot:cell(dataTypes)="data">
      <span class="text-nowrap">
        <i :class="`mdi mdi-18px ${experimentTypes.trials.icon}`" :style="`color: ${experimentTypes.trials.color()};`" v-b-tooltip.bottom.hover :title="experimentTypes.trials.text()" v-if="data.item.hasTrialsData" />
        <i :class="`mdi mdi-18px ${experimentTypes.genotype.icon}`" :style="`color: ${experimentTypes.genotype.color()};`" v-b-tooltip.bottom.hover :title="experimentTypes.genotype.text()" v-if="data.item.hasGenotypicData" />
        <i :class="`mdi mdi-18px ${experimentTypes.compound.icon}`" :style="`color: ${experimentTypes.compound.color()};`" v-b-tooltip.bottom.hover :title="experimentTypes.compound.text()" v-if="data.item.hasCompoundData" />
        <i :class="`mdi mdi-18px ${experimentTypes.allelefreq.icon}`" :style="`color: ${experimentTypes.allelefreq.color()};`" v-b-tooltip.bottom.hover :title="experimentTypes.allelefreq.text()" v-if="data.item.hasAllelefreqData" />
      </span>
    </template>
  </BaseTable>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import germplasmApi from '@/mixins/api/germplasm.js'

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
    return {
      options: {
        idColumn: 'germplasmId',
        tableName: 'germplasm',
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
        }],
        orderBy: this.orderBy
      }
    }
  },
  computed: {
    columns: function () {
      var result = [
        {
          key: 'germplasmId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'germplasmId')}`,
          label: this.$t('tableColumnGermplasmId')
        }, {
          key: 'germplasmName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmName')}`,
          label: this.$t('tableColumnGermplasmName')
        }, {
          key: 'germplasmGid',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmGid')}`,
          label: this.$t('tableColumnGermplasmGeneralIdentifier')
        }, {
          key: 'germplasmNumber',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmNumber')}`,
          label: this.$t('tableColumnGermplasmNumber')
        }, {
          key: 'germplasmPuid',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmPuid')}`,
          label: this.$t('tableColumnGermplasmPuid')
        }, {
          key: 'entityTypeName',
          type: 'entityType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityTypeName')}`,
          label: this.$t('tableColumnEntityType')
        }, {
          key: 'entityParentName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityParentName')}`,
          label: this.$t('tableColumnGermplasmEntityParentName')
        }, {
          key: 'entityParentGeneralIdentifier',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityParentGeneralIdentifier')}`,
          label: this.$t('tableColumnGermplasmEntityParentGeneralIdentifier')
        }, {
          key: 'biologicalStatusName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'biologicalStatusName')}`,
          label: this.$t('tableColumnBiologicalStatus')
        }, {
          key: 'synonyms',
          type: 'json',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'synonyms')}`,
          label: this.$t('tableColumnSynonyms')
        }, {
          key: 'collectorNumber',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'collectorNumber')}`,
          label: this.$t('tableColumnCollectorNumber')
        }, {
          key: 'institutionId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'institutionId')}`,
          label: this.$t('tableColumnInstitutionId')
        }, {
          key: 'institutionName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'institutionName')}`,
          label: this.$t('tableColumnInstitutionName')
        }, {
          key: 'genus',
          type: String,
          sortable: true,
          class: `font-italic ${this.isTableColumnHidden(this.options.tableName, 'genus')}`,
          label: this.$t('tableColumnGenus')
        }, {
          key: 'species',
          type: String,
          sortable: true,
          class: `font-italic ${this.isTableColumnHidden(this.options.tableName, 'species')}`,
          label: this.$t('tableColumnSpecies')
        }, {
          key: 'subtaxa',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'subtaxa')}`,
          label: this.$t('tableColumnSubtaxa')
        }, {
          key: 'location',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'location')}`,
          label: this.$t('tableColumnGermplasmLocation')
        }, {
          key: 'elevation',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'elevation')}`,
          label: this.$t('tableColumnElevation')
        }, {
          key: 'latitude',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'latitude')}`,
          label: this.$t('tableColumnLatitude')
        }, {
          key: 'longitude',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'longitude')}`,
          label: this.$t('tableColumnLongitude')
        }, {
          key: 'countryName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'countryName')}`,
          label: this.$t('tableColumnCountryName')
        }, {
          key: 'collDate',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'collDate')}`,
          label: this.$t('tableColumnColldate')
        }, {
          key: 'dataTypes',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'dataTypes')}`,
          label: this.$t('tableColumnGermplasmDataTypes')
        }, {
          key: 'imageCount',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'imageCount')}`,
          label: this.$t('tableColumnGermplasmImageCount')
        }, {
          key: 'pdci',
          type: Number,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pdci')}`,
          label: this.$t('tableColumnPdci')
        }, {
          key: 'distance',
          type: undefined,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'distance')}`,
          label: this.$t('tableColumnGermplasmDistance')
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

      if (this.tableMode !== 'distance') {
        return result.filter(c => c.key !== 'distance')
      } else {
        return result
      }
    }
  },
  components: {
    BaseTable
  },
  mixins: [ germplasmApi ],
  methods: {
    refresh: function () {
      this.$refs.germplasmTable.refresh()
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
.table-image:hover {
  cursor: pointer;
}
.table-image > a {
  text-decoration: none;
}
.pdci-table > svg {
  vertical-align: sub;
}
.table-image-popover {
  width: 300px;
  height: 300px;
  overflow: hidden;
}
.table-image-popover .popover-body {
  padding: 0;
}
.table-image-popover .popover-body img {
  width: 300px;
  height: 300px;
  object-fit: cover;
}
</style>
