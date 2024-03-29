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
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.entityParentId } }">{{ data.item.entityParentId }}</router-link>
      </template>
      <!-- Entity parent GID link -->
      <template v-slot:cell(entityParentGid)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.entityParentId } }">{{ data.item.entityParentGid }}</router-link>
      </template>
      <!-- Entity parent name link -->
      <template v-slot:cell(entityParentName)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.entityParentId } }">{{ data.item.entityParentName }}</router-link>
      </template>
      <!-- Entity child id link -->
      <template v-slot:cell(entityChildId)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.entityChildId } }">{{ data.item.entityChildId }}</router-link>
      </template>
      <!-- Entity child GID link -->
      <template v-slot:cell(entityChildGid)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.entityChildId } }">{{ data.item.entityChildGid }}</router-link>
      </template>
      <!-- Entity child name link -->
      <template v-slot:cell(entityChildName)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.entityChildId } }">{{ data.item.entityChildName }}</router-link>
      </template>
      <!-- Entity parent type -->
      <template v-slot:cell(entityParentType)="data">
        <span class="text-nowrap" v-if="data.item.entityParentType"><span :style="`color: ${entityTypes[data.item.entityParentType].color()};`"><MdiIcon :path="entityTypes[data.item.entityParentType].path" /></span> {{ entityTypes[data.item.entityParentType].text() }}</span>
      </template>
      <!-- Entity child type -->
      <template v-slot:cell(entityChildType)="data">
        <span class="text-nowrap" v-if="data.item.entityChildType"><span :style="`color: ${entityTypes[data.item.entityChildType].color()};`"><MdiIcon :path="entityTypes[data.item.entityChildType].path" /></span> {{ entityTypes[data.item.entityChildType].text() }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { entityTypes } from '@/mixins/types.js'
import { getTableColumnStyle } from '@/mixins/util'
import { Pages } from '@/mixins/pages'

export default {
  name: 'EntityTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      Pages,
      entityTypes,
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
          class: 'text-right',
          label: this.$t('tableColumnEntityParentId')
        }, {
          key: 'entityParentGid',
          type: String,
          sortable: true,
          label: this.$t('tableColumnEntityParentGid')
        }, {
          key: 'entityParentName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnEntityParentName'),
          preferredSortingColumn: true
        }, {
          key: 'entityParentType',
          type: 'entityType',
          sortable: true,
          class: 'border-right',
          label: this.$t('tableColumnEntityParentType')
        }, {
          key: 'entityChildId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnEntityChildId')
        }, {
          key: 'entityChildGid',
          type: String,
          sortable: true,
          label: this.$t('tableColumnEntityChildGid')
        }, {
          key: 'entityChildName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnEntityChildName')
        }, {
          key: 'entityChildType',
          type: 'entityType',
          sortable: true,
          label: this.$t('tableColumnEntityChildType')
        }
      ]
    },
    parentSpan: function () {
      return this.parentColumns.map(c => {
        return getTableColumnStyle(this.options.tableName, c) === 'd-none' ? 0 : 1
      }).reduce((a, b) => a + b, 0)
    },
    childSpan: function () {
      return this.childColumns.map(c => {
        return getTableColumnStyle(this.options.tableName, c) === 'd-none' ? 0 : 1
      }).reduce((a, b) => a + b, 0)
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    refresh: function () {
      this.$refs.entityTable.refresh()
    }
  }
}
</script>

<style>
</style>
