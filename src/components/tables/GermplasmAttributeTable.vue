<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="germplasmAttributeTable"
               v-on="$listeners">
      <!-- Germplasm id link -->
      <template v-slot:cell(germplasmId)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmId }}</router-link>
      </template>
      <!-- Germplasm name link -->
      <template v-slot:cell(germplasmName)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmName }}</router-link>
      </template>
      <!-- Germplasm GID link -->
      <template v-slot:cell(germplasmGid)="data">
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.germplasmId } }">{{ data.item.germplasmGid }}</router-link>
      </template>
      <!-- Attribute type -->
      <template v-slot:cell(attributeType)="data">
        <span v-if="data.item.attributeType">
          <span :style="`color: ${dataTypes[data.item.attributeType].color()};`"><MdiIcon :path="dataTypes[data.item.attributeType].path" /></span>
          <span> {{ dataTypes[data.item.attributeType].text() }}</span>
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { dataTypes } from '@/mixins/types'
import { Pages } from '@/mixins/pages'

export default {
  name: 'GermplasmAttributeTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      Pages,
      dataTypes,
      options: {
        idColumn: 'germplasmId',
        tableName: 'germplasmAttributes'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'germplasmId',
          type: String,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnAttributeGermplasmId')
        }, {
          key: 'germplasmGid',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeGermplasmGid')
        }, {
          key: 'germplasmName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeGermplasmName'),
          preferedSortingColumn: true
        }, {
          key: 'attributeName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeName')
        }, {
          key: 'attributeDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeDescription')
        }, {
          key: 'attributeType',
          type: 'dataType',
          sortable: true,
          label: this.$t('tableColumnAttributeDataType')
        }, {
          key: 'attributeValue',
          type: String,
          sortable: true,
          label: this.$t('tableColumnAttributeValue')
        }
      ]
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    refresh: function () {
      this.$refs.germplasmAttributeTable.refresh()
    }
  }
}
</script>

<style>
</style>
