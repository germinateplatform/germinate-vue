<template>
  <BaseTable v-bind="$props"
            :columns="columns"
            :options="options"
            itemType="germplasm"
            ref="compoundDataTable"
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
    <!-- Germplasm GID link -->
    <template v-slot:cell(germplasmGid)="data">
      <router-link :to="{ name: 'passport', params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmGid }}</router-link>
    </template>
    <!-- Entity type icon -->
    <template v-slot:cell(entityType)="data">
      <span class="text-nowrap"><span :style="`color: ${entityTypes[data.item.entityType].color()};`"><MdiIcon :path="entityTypes[data.item.entityType].path" /></span> {{ entityTypes[data.item.entityType].text() }}</span>
    </template>
  </BaseTable>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'
import utilMixin from '@/mixins/util'

export default {
  name: 'CompoundDataTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      options: {
        idColumn: 'germplasmId',
        tableName: 'compoundData'
      }
    }
  },
  computed: {
    columns: function () {
      const result = [
        {
          key: 'germplasmId',
          type: Number,
          class: `text-right${this.isTableColumnHidden(this.options.tableName, 'germplasmId')}`,
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
          key: 'compoundId',
          type: Number,
          class: `text-right${this.isTableColumnHidden(this.options.tableName, 'compoundId')}`,
          sortable: true,
          label: this.$t('tableColumnCompoundId')
        }, {
          key: 'compoundName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'compoundName')}`,
          sortable: true,
          label: this.$t('tableColumnCompoundName')
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
          key: 'compoundValue',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'compoundValue')}`,
          sortable: true,
          label: this.$t('tableColumnCompoundDataCompoundValue'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'marked',
          type: null,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'marked')}`,
          sortable: false,
          label: ''
        }
      ]

      // Add the selection column if requested
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
    BaseTable,
    MdiIcon
  },
  mixins: [typesMixin, utilMixin],
  methods: {
    refresh: function () {
      this.$refs.compoundDataTable.refresh()
    }
  }
}
</script>

<style>

</style>
