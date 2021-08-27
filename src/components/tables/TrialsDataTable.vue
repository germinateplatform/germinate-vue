<template>
  <BaseTable v-bind="$props"
            :columns="columns"
            :options="options"
            itemType="germplasm"
            ref="trialsDataTable"
            v-on="$listeners">
    <!-- Germplasm id link -->
    <template v-slot:cell(germplasmId)="data">
      <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmId }}</router-link>
    </template>
    <!-- Germplasm name link -->
    <template v-slot:cell(germplasmName)="data">
      <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmName }}</router-link>
    </template>
    <!-- Synonyms -->
    <template v-slot:cell(germplasmSynonyms)="data">
      <span v-if="data.item.germplasmSynonyms">{{ data.item.germplasmSynonyms.join(', ') }}</span>
    </template>
    <!-- Dataset name -->
    <template v-slot:cell(datasetName)="data">
      <span :title="data.item.datasetName">{{ data.item.datasetName | truncateAfterWords(10) }}</span>
    </template>
    <!-- Germplasm GID link -->
    <template v-slot:cell(germplasmGid)="data">
      <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmGid }}</router-link>
    </template>
    <!-- Entity type -->
    <template v-slot:cell(entityType)="data">
      <span class="text-nowrap"><i :class="`mdi mdi-18px ${entityTypes[data.item.entityType].icon} fix-alignment`" :style="`color: ${entityTypes[data.item.entityType].color()};`" /> {{ entityTypes[data.item.entityType].text() }}</span>
    </template>
    <!-- Country flag -->
    <template v-slot:cell(countryName)="data">
      <span class="table-country" v-b-tooltip.hover :title="data.item.countryName"><i :class="'flag-icon flag-icon-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
    </template>
    <!-- Trait value -->
    <template v-slot:cell(traitValue)="data">
      <span v-if="data.item.traitValue">{{ isNaN(data.item.traitValue) ? data.item.traitValue : parseFloat(data.item.traitValue).toFixed(2) }}</span>
    </template>
  </BaseTable>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'

export default {
  name: 'CompoundDataTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      options: {
        idColumn: 'germplasmId',
        tableName: 'trialsData'
      }
    }
  },
  computed: {
    columns: function () {
      let result = [
        {
          key: 'germplasmId',
          type: Number,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'germplasmId')}`,
          sortable: true,
          label: this.$t('tableColumnGermplasmId')
        }, {
          key: 'germplasmGid',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmGid')}`,
          sortable: true,
          label: this.$t('tableColumnGermplasmGeneralIdentifier')
        }, {
          key: 'germplasmName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmName')}`,
          sortable: true,
          label: this.$t('tableColumnGermplasmName'),
          preferedSortingColumn: true
        }, {
          key: 'germplasmSynonyms',
          type: 'json',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'germplasmSynonyms')}`,
          label: this.$t('tableColumnSynonyms')
        }, {
          key: 'entityType',
          type: 'entityTyp',
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityType')}`,
          sortable: true,
          label: this.$t('tableColumnEntityType')
        }, {
          key: 'entityParentGeneralIdentifier',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityParentGeneralIdentifier')}`,
          sortable: true,
          label: this.$t('tableColumnEntityParentGid')
        }, {
          key: 'entityParentName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityParentName')}`,
          sortable: true,
          label: this.$t('tableColumnEntityParentName')
        }, {
          key: 'datasetName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetName')}`,
          sortable: true,
          label: this.$t('tableColumnDatasetName')
        }, {
          key: 'locationName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'locationName')}`,
          sortable: true,
          label: this.$t('tableColumnLocationName')
        }, {
          key: 'countryName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'countryName')}`,
          sortable: true,
          label: this.$t('tableColumnCountryName')
        }, {
          key: 'traitId',
          type: Number,
          class: `text-right${this.isTableColumnHidden(this.options.tableName, 'traitId')}`,
          sortable: true,
          label: this.$t('tableColumnTraitId')
        }, {
          key: 'traitName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'traitName')}`,
          sortable: true,
          label: this.$t('tableColumnTraitName')
        }, {
          key: 'treatment',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'treatment')}`,
          sortable: true,
          label: this.$t('tableColumnTraitTreatment')
        }, {
          key: 'rep',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'rep')}`,
          sortable: true,
          label: this.$t('tableColumnTraitRep')
        }, {
          key: 'unitName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitName')}`,
          sortable: true,
          label: this.$t('tableColumnCompoundUnitName')
        }, {
          key: 'recordingDate',
          type: Date,
          class: `${this.isTableColumnHidden(this.options.tableName, 'recordingDate')}`,
          sortable: true,
          label: this.$t('tableColumnCompoundDataRecordingDate'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'traitValue',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'traitValue')}`,
          sortable: true,
          label: this.$t('tableColumnTrialsDataTraitValue')
        }, {
          key: 'marked',
          type: null,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'marked')}`,
          sortable: false,
          label: ''
        }
      ]

      if (this.selectable === true) {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          class: 'bg-primary',
          label: ''
        })
      }

      return result
    }
  },
  components: {
    BaseTable
  },
  mixins: [ typesMixin ],
  methods: {
    refresh: function () {
      this.$refs.trialsDataTable.refresh()
    }
  }
}
</script>

<style>

</style>
