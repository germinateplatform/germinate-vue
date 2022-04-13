<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="entityTable"
               v-on="$listeners">
      <template v-slot:thead-top>
        <b-tr>
          <b-th :colspan="parentSpan" class="text-center border-right" v-if="parentSpan > 0">{{ $t('tableColumnEntityParentHeader') }}</b-th>
          <b-th :colspan="childSpan" class="text-center" v-if="childSpan > 0">{{ $t('tableColumnEntityChildHeader') }}</b-th>
        </b-tr>
      </template>
      <!-- Entity parent id link -->
      <template v-slot:cell(entityParentId)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.entityParentId } }">{{ data.item.entityParentId }}</router-link>
      </template>
      <!-- Entity parent GID link -->
      <template v-slot:cell(entityParentGid)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.entityParentId } }">{{ data.item.entityParentGid }}</router-link>
      </template>
      <!-- Entity parent name link -->
      <template v-slot:cell(entityParentName)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.entityParentId } }">{{ data.item.entityParentName }}</router-link>
      </template>
      <!-- Entity child id link -->
      <template v-slot:cell(entityChildId)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.entityChildId } }">{{ data.item.entityChildId }}</router-link>
      </template>
      <!-- Entity child GID link -->
      <template v-slot:cell(entityChildGid)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.entityChildId } }">{{ data.item.entityChildGid }}</router-link>
      </template>
      <!-- Entity child name link -->
      <template v-slot:cell(entityChildName)="data">
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.entityChildId } }">{{ data.item.entityChildName }}</router-link>
      </template>
      <!-- Entity parent type -->
      <template v-slot:cell(entityParentType)="data">
        <span class="text-nowrap" v-if="data.item.entityParentType"><i :class="`mdi mdi-18px ${entityTypes[data.item.entityParentType].icon} fix-alignment`" :style="`color: ${entityTypes[data.item.entityParentType].color()};`" /> {{ entityTypes[data.item.entityParentType].text() }}</span>
      </template>
      <!-- Entity child type -->
      <template v-slot:cell(entityChildType)="data">
        <span class="text-nowrap" v-if="data.item.entityChildType"><i :class="`mdi mdi-18px ${entityTypes[data.item.entityChildType].icon} fix-alignment`" :style="`color: ${entityTypes[data.item.entityChildType].color()};`" /> {{ entityTypes[data.item.entityChildType].text() }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'

export default {
  name: 'EntityTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      options: {
        idColumn: 'entityParentId',
        tableName: 'entities'
      },
      parentColumns: ['entityParentId', 'entityParentGid', 'entityParentName', 'entityParentType'],
      childColumns: ['entityChildId', 'entityChildGid', 'entityChildName', 'entityChildType']
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'entityParentId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'entityParentId')}`,
          label: this.$t('tableColumnEntityParentId')
        }, {
          key: 'entityParentGid',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityParentGid')}`,
          label: this.$t('tableColumnEntityParentGid')
        }, {
          key: 'entityParentName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityParentName')}`,
          label: this.$t('tableColumnEntityParentName'),
          preferedSortingColumn: true
        }, {
          key: 'entityParentType',
          type: 'entityType',
          sortable: true,
          class: `border-right ${this.isTableColumnHidden(this.options.tableName, 'entityParentType')}`,
          label: this.$t('tableColumnEntityParentType')
        }, {
          key: 'entityChildId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'entityChildId')}`,
          label: this.$t('tableColumnEntityChildId')
        }, {
          key: 'entityChildGid',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityChildGid')}`,
          label: this.$t('tableColumnEntityChildGid')
        }, {
          key: 'entityChildName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityChildName')}`,
          label: this.$t('tableColumnEntityChildName')
        }, {
          key: 'entityChildType',
          type: 'entityType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'entityChildType')}`,
          label: this.$t('tableColumnEntityChildType')
        }
      ]
    },
    parentSpan: function () {
      return this.parentColumns.map(c => {
        return this.isTableColumnHidden(this.options.tableName, c) === 'd-none' ? 0 : 1
      }).reduce((a, b) => a + b, 0)
    },
    childSpan: function () {
      return this.childColumns.map(c => {
        return this.isTableColumnHidden(this.options.tableName, c) === 'd-none' ? 0 : 1
      }).reduce((a, b) => a + b, 0)
    }
  },
  components: {
    BaseTable
  },
  mixins: [typesMixin],
  methods: {
    refresh: function () {
      this.$refs.entityTable.refresh()
    }
  }
}
</script>

<style>
</style>
