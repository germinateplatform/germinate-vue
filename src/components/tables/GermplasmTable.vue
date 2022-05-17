<template>
  <div>
    <BaseTable v-bind="$props"
                :columns="columns"
                :options="options"
                primary-key="germplasmId"
                itemType="germplasm"
                class="germplasm-table"
                ref="germplasmTable"
                v-on="$listeners">
      <!-- HEADS -->
      <!-- HEAD: Germplasm PUID -->
      <template v-slot:head(germplasmPuid)="data">
        <span>{{ data.label }} </span> <span class="text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipGermplasmPuid')"><MdiIcon :path="mdiHelpCircle" /></span>
      </template>
      <!-- HEAD Germplasm PDCI -->
      <template v-slot:head(pdci)="data">
        <span>{{ data.label }} </span> <span class="text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipGermplasmPdci')"><MdiIcon :path="mdiHelpCircle" /></span>
      </template>
      <!-- HEAD: Dataset types -->
      <template v-slot:head(dataTypes)="data">
        <span>{{ data.label }} </span> <span class="text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipGermplasmDataTypes')"><MdiIcon :path="mdiHelpCircle" /></span>
      </template>
      <!-- HEAD: Trials data -->
      <template v-slot:head(hasTrialsData)>
        <span v-b-tooltip.bottom.hover :title="$t('tableColumnHasTrialsData')"><MdiIcon :path="datasetTypes.trials.path" /></span>
      </template>
      <!-- HEAD: Genotypic data -->
      <template v-slot:head(hasGenotypicData)>
        <span v-b-tooltip.bottom.hover :title="$t('tableColumnHasGenotypicData')"><MdiIcon :path="datasetTypes.genotype.path" /></span>
      </template>
      <!-- HEAD: Compound data -->
      <template v-slot:head(hasCompoundData)>
        <span v-b-tooltip.bottom.hover :title="$t('tableColumnHasCompoundData')"><MdiIcon :path="datasetTypes.compound.path" /></span>
      </template>
      <!-- HEAD: Allelefreq data -->
      <template v-slot:head(hasAllelefreqData)>
        <span v-b-tooltip.bottom.hover :title="$t('tableColumnHasAllelefreqData')"><MdiIcon :path="datasetTypes.allelefreq.path" /></span>
      </template>
      <!-- HEAD: Allelefreq data -->
      <template v-slot:head(hasPedigreeData)>
        <span v-b-tooltip.bottom.hover :title="$t('tableColumnHasPedigreeData')"><MdiIcon :path="datasetTypes.pedigree.path" /></span>
      </template>
      <!-- /HEADS -->

      <template v-slot:cell(preview)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }" event="" @click.native.prevent="selectGermplasm(data.item.germplasmId)" class="table-link" v-b-tooltip:hover="$t('tableTooltipGermplasmPreviewPassport')">
          <MdiIcon :path="mdiOpenInApp" />
        </router-link>
      </template>
      <!-- Germplasm id link -->
      <template v-slot:cell(germplasmId)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmId }}</router-link>
      </template>
      <!-- Germplasm name link -->
      <template v-slot:cell(germplasmName)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmName }}</router-link>
      </template>
      <!-- Germplasm GID link -->
      <template v-slot:cell(germplasmGid)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmGid }}</router-link>
      </template>
      <!-- Germplasm number link -->
      <template v-slot:cell(germplasmNumber)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmNumber }}</router-link>
      </template>
      <!-- Entity type -->
      <template v-slot:cell(entityTypeName)="data">
        <span class="text-nowrap"><span :style="`color: ${entityTypes[data.item.entityTypeName].color()};`"><MdiIcon :path="entityTypes[data.item.entityTypeName].path" /></span> {{ entityTypes[data.item.entityTypeName].text() }}</span>
      </template>
      <!-- Synonyms -->
      <template v-slot:cell(synonyms)="data">
        <span v-if="data.item.synonyms">{{ data.item.synonyms.join(', ') }}</span>
      </template>
      <!-- Location name -->
      <template v-slot:cell(location)="data">
        <template v-if="data.item.location">
          <a href="#" @click.prevent="data.toggleDetails()" class="table-link" v-if="data.item.latitude && data.item.longitude" v-b-tooltip.hover :title="$t('tableTooltipGermplasmLocation')">
            <MdiIcon :path="mdiMapMarker" />
            <span>{{ data.item.location }}</span>
          </a>
          <span v-else>{{ data.item.location }}</span>
        </template>
      </template>
      <!-- Location elevation -->
      <template v-slot:cell(elevation)="data">
        <span v-if="data.item.elevation !== undefined">{{ data.item.elevation.toFixed(2) }}</span>
      </template>
      <!-- Location latitude -->
      <template v-slot:cell(latitude)="data">
        <span v-if="data.item.latitude !== undefined">{{ data.item.latitude.toFixed(2) }}</span>
      </template>
      <!-- Location longitude -->
      <template v-slot:cell(longitude)="data">
        <span v-if="data.item.longitude !== undefined">{{ data.item.longitude.toFixed(2) }}</span>
      </template>
      <!-- Country flag -->
      <template v-slot:cell(countryName)="data">
          <span class="table-country text-nowrap" v-b-tooltip.hover :title="data.item.countryName" v-if="data.item.countryCode">
            <i :class="'fi fi-' + data.item.countryCode.toLowerCase()"/> <span> {{ data.item.countryCode }}</span>
          </span>
          <span v-else>
            {{ data.item.countryName }}
          </span>
      </template>
      <!-- Formatted colldate -->
      <template v-slot:cell(collDate)="data">
        <span v-if="data.item.collDate">{{ new Date(data.item.collDate).toLocaleDateString() }}</span>
      </template>
      <!-- Image preview -->
      <template v-slot:cell(imageCount)="data">
        <div class="table-image" v-if="data.item.imageCount !== undefined && data.item.imageCount > 0">
          <a href="#" class="text-dark" @click.prevent="" :id="`table-image-popover-${data.item.germplasmId}`" v-b-tooltip.hover :title="$t('tableTooltipGermplasmImage')">
            <MdiIcon :path="mdiCamera" /> <span> {{ data.item.imageCount }}</span>
          </a>
          <b-popover
            :target="`table-image-popover-${data.item.germplasmId}`"
            custom-class="table-image-popover"
            placement="top"
            boundary="window"
            triggers="click blur">
            <img :src="getSrc(data.item)" alt="Germplasm image" />
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
        <div v-if="data.item.pdci !== undefined" class="table-pdci">
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg); vertical-align: text-bottom;">
            <g>
              <circle id="circle" class="pdci-circle-background" style="stroke-dasharray: 44; stroke-dashoffset: 0;" r="7" cy="9" cx="9" stroke-width="4" fill="none"/>
              <circle id="circle" class="pdci-circle-inner" :style="'stroke-dasharray: 44; stroke-dashoffset: ' + (44 - (data.item.pdci / 10 * 44)) + ';'" r="7" cy="9" cx="9" stroke-width="4" fill="none"/>
            </g>
          </svg>
          <span> {{ data.item.pdci.toFixed(2) }}</span>
        </div>
      </template>
      <!-- Dataset types -->
      <template v-slot:cell(hasTrialsData)="data">
        <span v-if="data.item.hasTrialsData" :style="`color: ${datasetTypes.trials.color()};`" v-b-tooltip.hover :title="datasetTypes.trials.text()"><MdiIcon :path="datasetTypes.trials.path" /></span>
      </template>
      <template v-slot:cell(hasGenotypicData)="data">
        <span v-if="data.item.hasGenotypicData" :style="`color: ${datasetTypes.genotype.color()};`" v-b-tooltip.hover :title="datasetTypes.genotype.text()"><MdiIcon :path="datasetTypes.genotype.path" /></span>
      </template>
      <template v-slot:cell(hasCompoundData)="data">
        <span v-if="data.item.hasCompoundData" :style="`color: ${datasetTypes.compound.color()};`" v-b-tooltip.hover :title="datasetTypes.compound.text()"><MdiIcon :path="datasetTypes.compound.path" /></span>
      </template>
      <template v-slot:cell(hasAllelefreqData)="data">
        <span v-if="data.item.hasAllelefreqData" :style="`color: ${datasetTypes.allelefreq.color()};`" v-b-tooltip.hover :title="datasetTypes.allelefreq.text()"><MdiIcon :path="datasetTypes.allelefreq.path" /></span>
      </template>
      <template v-slot:cell(hasPedigreeData)="data">
        <span v-if="data.item.hasPedigreeData" :style="`color: ${datasetTypes.pedigree.color()};`" v-b-tooltip.hover :title="datasetTypes.pedigree.text()"><MdiIcon :path="datasetTypes.pedigree.path" /></span>
      </template>

      <!-- Row details is where the dataset locations are shown on a map -->
      <template v-slot:row-details="data">
        <LocationMap :locations="[{ locationName: data.item.location, locationLatitude: data.item.latitude, locationLongitude: data.item.longitude, locationElevation: data.item.elevation, countryCode2: data.item.countryCode, countryName: data.item.countryName }]" v-if="data.item.latitude && data.item.longitude" :showLinks="false"/>
      </template>
    </BaseTable>

    <!-- Modal to show the passport page on data point click -->
    <b-modal size="xl" ref="passportModal" v-if="germplasmId" @hidden="germplasmId = null" scrollable ok-only hide-header :ok-title="$t('buttonClose')">
      <Passport :germplasmId="germplasmId" :isPopup="true" />
    </b-modal>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseTable from '@/components/tables/BaseTable'
import LocationMap from '@/components/map/LocationMap'
import Passport from '@/views/data/germplasm/Passport'
import defaultProps from '@/const/table-props'
import germplasmApi from '@/mixins/api/germplasm'
import utilMixin from '@/mixins/util'
import imagesMixin from '@/mixins/image'
import typesMixin from '@/mixins/types'

import MdiIcon from '@/components/icons/MdiIcon'

import { mdiHelpCircle, mdiOpenInApp, mdiMapMarker, mdiCamera, mdiChevronUpBox, mdiChevronUpBoxOutline, mdiChevronDownBox, mdiChevronDownBoxOutline } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

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
      mdiHelpCircle,
      mdiOpenInApp,
      mdiMapMarker,
      mdiCamera,
      mdiChevronUpBox,
      mdiChevronUpBoxOutline,
      mdiChevronDownBox,
      mdiChevronDownBoxOutline,
      germplasmId: null,
      options: {
        idColumn: 'germplasmId',
        tableName: 'germplasm',
        additionalMarkingOptions: [{
          key: 'mark-parents',
          text: () => this.$t('tableContextMarkEntityParents'),
          path: mdiChevronUpBox,
          callback: (item) => this.markParents(item)
        }, {
          key: 'unmark-parents',
          text: () => this.$t('tableContextUnmarkEntityParents'),
          path: mdiChevronUpBoxOutline,
          callback: (item) => this.unmarkParents(item)
        }, {
          key: 'mark-children',
          text: () => this.$t('tableContextMarkEntityChildren'),
          path: mdiChevronDownBox,
          callback: (item) => this.markChildren(item)
        }, {
          key: 'unmark-children',
          text: () => this.$t('tableContextUnmarkEntityChildren'),
          path: mdiChevronDownBoxOutline,
          callback: (item) => this.unmarkChildren(item)
        }],
        orderBy: this.orderBy
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    columns: function () {
      const result = [
        {
          key: 'preview',
          type: undefined,
          sortable: false,
          label: ''
        },
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
          label: this.$t('tableColumnGermplasmName'),
          preferedSortingColumn: true
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
          key: 'hasTrialsData',
          type: Boolean,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'hasTrialsData')}`,
          label: this.$t('tableColumnHasTrialsData')
        }, {
          key: 'hasGenotypicData',
          type: Boolean,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'hasGenotypicData')}`,
          label: this.$t('tableColumnHasGenotypicData')
        }, {
          key: 'hasPedigreeData',
          type: Boolean,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'hasPedigreeData')}`,
          label: this.$t('tableColumnHasPedigreeData')
        }, {
          key: 'hasCompoundData',
          type: Boolean,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'hasCompoundData')}`,
          label: this.$t('tableColumnHasCompoundData')
        }, {
          key: 'hasAllelefreqData',
          type: Boolean,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'hasAllelefreqData')}`,
          label: this.$t('tableColumnHasAllelefreqData')
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
    BaseTable,
    LocationMap,
    MdiIcon,
    Passport
  },
  mixins: [germplasmApi, imagesMixin, typesMixin, utilMixin],
  methods: {
    selectGermplasm: function (id) {
      this.germplasmId = id
      this.$nextTick(() => this.$refs.passportModal.show())
    },
    refresh: function () {
      this.$refs.germplasmTable.refresh()
    },
    getSrc: function (germplasm) {
      return this.getImageUrl(germplasm.firstImagePath, {
        name: germplasm.firstImagePath,
        type: 'database',
        size: 'small',
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    markParents: function (item) {
      if (item) {
        const parentId = item.entityParentId
        this.$store.dispatch('addMarkedIds', { type: 'germplasm', ids: [parentId] })
      } else {
        emitter.emit('show-loading', true)
        const requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'up', result => {
            this.$store.dispatch('addMarkedIds', { type: 'germplasm', ids: result })
            emitter.emit('show-loading', false)
          })
        })
      }
    },
    markChildren: function (item) {
      if (item) {
        emitter.emit('show-loading', true)
        const id = item.germplasmId
        this.apiPostEntityIds([id], 'down', result => {
          this.$store.dispatch('addMarkedIds', { type: 'germplasm', ids: result })
          emitter.emit('show-loading', false)
        })
      } else {
        emitter.emit('show-loading', true)
        const requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'down', result => {
            this.$store.dispatch('addMarkedIds', { type: 'germplasm', ids: result })
            emitter.emit('show-loading', false)
          })
        })
      }
    },
    unmarkParents: function (item) {
      if (item) {
        const parentId = item.entityParentId
        this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: [parentId] })
      } else {
        emitter.emit('show-loading', true)
        const requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'up', result => {
            this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: result })
            emitter.emit('show-loading', false)
          })
        })
      }
    },
    unmarkChildren: function (item) {
      if (item) {
        emitter.emit('show-loading', true)
        const id = item.germplasmId
        this.apiPostEntityIds([id], 'down', result => {
          this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: result })
          emitter.emit('show-loading', false)
        })
      } else {
        emitter.emit('show-loading', true)
        const requestData = this.$refs.germplasmTable.getCurrentRequestData()
        // First request all ids for the current table items
        this.getIds(requestData, result => {
          // Then post them to the server again to convert them to their entity parents
          this.apiPostEntityIds(result.data, 'down', result => {
            this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: result })
            emitter.emit('show-loading', false)
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
.table-image:hover {
  cursor: pointer;
}
.table-link:hover,
.table-image > a:hover {
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
.table-cell-filter:hover {
  cursor: pointer;
}
.germplasm-table .b-table-details td {
  padding: 0;
}
.pdci-circle-background {
  stroke: #ccc;
}
.pdci-circle-inner {
  stroke: #2f353a;
}
</style>
