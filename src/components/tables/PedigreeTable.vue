<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="pedigreeTable"
               v-on="$listeners">
      <!-- HEAD: Relationship type -->
      <template v-slot:head(relationshipType)="data">
        <span>{{ data.label }} </span> <span v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipPedigreeRelationshipType')" class="text-muted"><MdiIcon :path="mdiHelpCircle" /></span>
      </template>
      <!-- Parent id link -->
      <template v-slot:cell(parentId)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.parentId } }">{{ data.item.parentId }}</router-link>
      </template>
      <!-- Parent GID link -->
      <template v-slot:cell(parentGid)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.parentId } }">{{ data.item.parentGid }}</router-link>
      </template>
      <!-- Parent name link -->
      <template v-slot:cell(parentName)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.parentId } }">{{ data.item.parentName }}</router-link>
      </template>
      <!-- Child id link -->
      <template v-slot:cell(childId)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.childId } }">{{ data.item.childId }}</router-link>
      </template>
      <!-- Child GID link -->
      <template v-slot:cell(childGid)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.childId } }">{{ data.item.childGid }}</router-link>
      </template>
      <!-- Child name link -->
      <template v-slot:cell(childName)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.childId } }">{{ data.item.childName }}</router-link>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import utilMixin from '@/mixins/util'

import { mdiHelpCircle } from '@mdi/js'

export default {
  name: 'PedigreeTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      mdiHelpCircle,
      options: {
        idColumn: 'parentId',
        tableName: 'pedigrees'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'datasetId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'datasetId')}`,
          label: this.$t('tableColumnPedigreeDatasetId')
        },
        {
          key: 'datasetName',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'datasetName')}`,
          label: this.$t('tableColumnPedigreeDatasetName')
        },
        {
          key: 'parentId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'parentId')}`,
          label: this.$t('tableColumnPedigreeParentId')
        }, {
          key: 'parentGid',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'parentGid')}`,
          label: this.$t('tableColumnPedigreeParentGid')
        }, {
          key: 'parentName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'parentName')}`,
          label: this.$t('tableColumnPedigreeParentName'),
          preferedSortingColumn: true
        }, {
          key: 'childId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'childId')}`,
          label: this.$t('tableColumnPedigreeChildId')
        }, {
          key: 'childGid',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'childGid')}`,
          label: this.$t('tableColumnPedigreeChildGid')
        }, {
          key: 'childName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'childName')}`,
          label: this.$t('tableColumnPedigreeChildName')
        }, {
          key: 'relationshipType',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'relationshipType')}`,
          label: this.$t('tableColumnPedigreeRelationshipType')
        }, {
          key: 'relationshipDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'relationshipDescription')}`,
          label: this.$t('tableColumnPedigreeRelationshipDescription')
        }, {
          key: 'pedigreeDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeDescription')}`,
          label: this.$t('tableColumnPedigreeDescription')
        }, {
          key: 'pedigreeAuthor',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'pedigreeAuthor')}`,
          label: this.$t('tableColumnPedigreeAuthor')
        }
      ]
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  mixins: [utilMixin],
  methods: {
    refresh: function () {
      this.$refs.pedigreeTable.refresh()
    }
  }
}
</script>

<style>
</style>
