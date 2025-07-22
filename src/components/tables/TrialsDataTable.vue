<template>
  <BaseTable v-bind="$props"
            :columns="columns"
            :options="options"
            itemType="germplasm"
            v-if="tableShown"
            ref="trialsDataTable"
            v-on="$listeners">
    <!-- Germplasm id link -->
    <template v-slot:cell(germplasmId)="data">
      <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmId }}</router-link>
    </template>
    <!-- Germplasm name link -->
    <template v-slot:cell(germplasmName)="data">
      <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmName }}</router-link>
    </template>
    <!-- Germplasm name link -->
    <template v-slot:cell(germplasmDisplayName)="data">
      <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmDisplayName }}</router-link>
    </template>
    <!-- Synonyms -->
    <template v-slot:cell(germplasmSynonyms)="data">
      <span v-if="data.item.germplasmSynonyms">{{ data.item.germplasmSynonyms.join(', ') }}</span>
    </template>
    <!-- Dataset name -->
    <template v-slot:cell(datasetName)="data">
      <span :title="data.item.datasetName">{{ truncateAfterWords(data.item.datasetName, 10) }}</span>
    </template>
    <!-- Location latitude -->
    <template v-slot:cell(latitude)="data">
      <span v-if="data.item.latitude !== undefined">{{ data.item.latitude.toFixed(2) }}</span>
    </template>
    <!-- Location longitude -->
    <template v-slot:cell(longitude)="data">
      <span v-if="data.item.longitude !== undefined">{{ data.item.longitude.toFixed(2) }}</span>
    </template>
    <!-- Location elevation -->
    <template v-slot:cell(elevation)="data">
      <span v-if="data.item.elevation !== undefined">{{ data.item.elevation.toFixed(2) }}</span>
    </template>
    <!-- Germplasm GID link -->
    <template v-slot:cell(germplasmGid)="data">
      <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmGid }}</router-link>
    </template>
    <!-- Entity type -->
    <template v-slot:cell(entityType)="data">
      <span class="text-nowrap"><span :style="`color: ${entityTypes[data.item.entityType].color()};`"><MdiIcon :path="entityTypes[data.item.entityType].path" /></span> {{ entityTypes[data.item.entityType].text() }}</span>
    </template>
    <!-- Country flag -->
    <template v-slot:cell(countryName)="data">
      <span class="table-country" v-b-tooltip.hover :title="data.item.countryName"><i :class="'fi fi-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
    </template>
    <!-- Trait data type icon -->
    <template v-slot:cell(traitDataType)="data">
      <span class="text-nowrap"><span :style="`color: ${dataTypes[data.item.traitDataType].color()};`"><MdiIcon :path="dataTypes[data.item.traitDataType].path" /></span> {{ dataTypes[data.item.traitDataType].text() }}</span>
    </template>
    <!-- Trait value -->
    <template v-slot:cell(traitValue)="data">
      <span v-if="data.item.traitValue !== undefined && data.item.traitValue !== null">
        <template v-if="data.item.traitDataType === 'numeric'">{{ (+data.item.traitValue).toFixed(2) }}</template>
        <template v-else-if="data.item.traitDataType === 'date'">{{ new Date(data.item.traitValue).toLocaleDateString() }}</template>
        <template v-else-if="data.item.traitDataType === 'categorical'">{{ data.item.traitValue }}</template>
        <template v-else>{{ isNaN(data.item.traitValue) ? data.item.traitValue : parseFloat(data.item.traitValue).toFixed(2) }}</template>
      </span>
    </template>
  </BaseTable>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { entityTypes, dataTypes } from '@/mixins/types.js'
import { truncateAfterWords } from '@/mixins/formatting'
import { Pages } from '@/mixins/pages'

export default {
  name: 'TrialsDataTable',
  props: {
    ...defaultProps.FULL,
    shown: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      Pages,
      entityTypes,
      dataTypes,
      tableShown: false,
      options: {
        idColumn: 'germplasmId',
        tableName: 'trialsData'
      }
    }
  },
  watch: {
    shown: function (newValue) {
      if (newValue) {
        this.tableShown = true
      }
    }
  },
  computed: {
    showTable: function () {
      return this.tableShown || this.shown
    },
    columns: function () {
      const result = [
        {
          key: 'germplasmId',
          type: Number,
          class: 'text-right',
          sortable: true,
          label: this.$t('tableColumnGermplasmId')
        }, {
          key: 'germplasmGid',
          type: String,
          sortable: true,
          label: this.$t('tableColumnGermplasmGeneralIdentifier')
        }, {
          key: 'germplasmName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnGermplasmName'),
          preferredSortingColumn: true
        }, {
          key: 'germplasmDisplayName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnGermplasmDisplayName')
        }, {
          key: 'germplasmSynonyms',
          type: 'json',
          sortable: true,
          label: this.$t('tableColumnSynonyms')
        }, {
          key: 'entityType',
          type: 'entityTyp',
          sortable: true,
          label: this.$t('tableColumnEntityType')
        }, {
          key: 'entityParentGeneralIdentifier',
          type: String,
          sortable: true,
          label: this.$t('tableColumnEntityParentGid')
        }, {
          key: 'entityParentName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnEntityParentName')
        }, {
          key: 'datasetName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnDatasetName')
        }, {
          key: 'locationName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnLocationName')
        }, {
          key: 'countryName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnCountryName')
        }, {
          key: 'traitId',
          type: Number,
          class: 'text-right',
          sortable: true,
          label: this.$t('tableColumnTraitId')
        }, {
          key: 'traitName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitName')
        }, {
          key: 'traitDataType',
          type: 'dataType',
          sortable: true,
          label: this.$t('tableColumnTraitDataType')
        }, {
          key: 'treatment',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitTreatment')
        }, {
          key: 'rep',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitRep')
        }, {
          key: 'block',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitBlock')
        }, {
          key: 'trialRow',
          type: Number,
          sortable: true,
          label: this.$t('tableColumnTraitRow')
        }, {
          key: 'trialColumn',
          type: Number,
          sortable: true,
          label: this.$t('tableColumnTraitColumn')
        }, {
          key: 'latitude',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnLocationLatitude')
        }, {
          key: 'longitude',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnLocationLongitude')
        }, {
          key: 'elevation',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnLocationElevation')
        }, {
          key: 'unitName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitUnitName')
        }, {
          key: 'recordingDate',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnTraitDataRecordingDate'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }, {
          key: 'traitValue',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTrialsDataTraitValue')
        }, {
          key: 'marked',
          type: null,
          class: 'text-right',
          sortable: false,
          label: ''
        }
      ]

      if (this.selectable === true) {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          class: 'table-primary',
          label: ''
        })
      }

      return result
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    truncateAfterWords,
    refresh: function () {
      this.$refs.trialsDataTable.refresh()
    }
  },
  created: function () {
    if (this.shown) {
      this.tableShown = true
    }
  }
}
</script>

<style>

</style>
