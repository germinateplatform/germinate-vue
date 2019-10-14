<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="pedigreeTable"
               v-on="$listeners">
      <router-link slot="parentId" slot-scope="props" :to="'/data/germplasm/' + props.row.parentId">{{ props.row.parentId }}</router-link>
      <router-link slot="parentGid" slot-scope="props" :to="'/data/germplasm/' + props.row.parentId">{{ props.row.parentGid }}</router-link>
      <router-link slot="parentName" slot-scope="props" :to="'/data/germplasm/' + props.row.parentId">{{ props.row.parentName }}</router-link>
      <router-link slot="childId" slot-scope="props" :to="'/data/germplasm/' + props.row.childId">{{ props.row.childId }}</router-link>
      <router-link slot="childGid" slot-scope="props" :to="'/data/germplasm/' + props.row.childId">{{ props.row.childGid }}</router-link>
      <router-link slot="childName" slot-scope="props" :to="'/data/germplasm/' + props.row.childId">{{ props.row.childName }}</router-link>

      <!-- HEADERS -->
      <div slot="h__relationshipType">
        <span>{{ options.headings.relationshipType() }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipPedigreeRelationshipType')"/>
      </div>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'PedigreeTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    var columns = [{
      name: 'parentId',
      type: Number
    }, {
      name: 'parentGid',
      type: String
    }, {
      name: 'parentName',
      type: String
    }, {
      name: 'childId',
      type: Number
    }, {
      name: 'childGid',
      type: String
    }, {
      name: 'childName',
      type: String
    }, {
      name: 'relationshipType',
      type: String
    }, {
      name: 'relationshipDescription',
      type: String
    }, {
      name: 'pedigreeDescription',
      type: String
    }, {
      name: 'pedigreeAuthor',
      type: String
    }]

    return {
      options: {
        idColumn: 'parentId',
        tableName: 'pedigrees',
        sortable: ['parentId', 'parentGid', 'parentName', 'childId', 'childGid', 'childName', 'relationshipType', 'relationshipDescription', 'pedigreeDescription', 'pedigreeAuthor'],
        filterable: [],
        headings: {
          parentId: () => this.$t('tableColumnPedigreeParentId'),
          parentGid: () => this.$t('tableColumnPedigreeParentGid'),
          parentName: () => this.$t('tableColumnPedigreeParentName'),
          childId: () => this.$t('tableColumnPedigreeChildId'),
          childGid: () => this.$t('tableColumnPedigreeChildGid'),
          childName: () => this.$t('tableColumnPedigreeChildName'),
          relationshipType: () => this.$t('tableColumnPedigreeRelationshipType'),
          relationshipDescription: () => this.$t('tableColumnPedigreeRelationshipDescription'),
          pedigreeDescription: () => this.$t('tableColumnPedigreeDescription'),
          pedigreeAuthor: () => this.$t('tableColumnPedigreeAuthor')
        },
        columnsClasses: {
          parentId: 'text-right',
          childId: 'text-right'
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
      this.$refs.pedigreeTable.refresh()
    }
  }
}
</script>

<style>
</style>
