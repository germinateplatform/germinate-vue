<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="germplasmAttributeTable"
               v-on="$listeners">
      <!-- Attribute type -->
      <template v-slot:cell(attributeType)="data">
        <span v-if="data.item.attributeType">
          <i :class="'mdi mdi-18px fix-alignment ' + dataTypes[data.item.attributeType].icon" :style="`color: ${dataTypes[data.item.attributeType].color()};`"/>
          <span> {{ dataTypes[data.item.attributeType].text() }}</span>
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'

export default {
  name: 'GermplasmAttributeTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
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
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'germplasmId')}`,
          label: this.$t('tableColumnAttributeGermplasmId')
        }, {
          key: 'germplasmGid',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetName')}`,
          label: this.$t('tableColumnAttributeGermplasmGid')
        }, {
          key: 'germplasmName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetDescription')}`,
          label: this.$t('tableColumnAttributeGermplasmName'),
          preferedSortingColumn: true
        }, {
          key: 'attributeName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeName')}`,
          label: this.$t('tableColumnAttributeName')
        }, {
          key: 'attributeDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeDescription')}`,
          label: this.$t('tableColumnAttributeDescription')
        }, {
          key: 'attributeType',
          type: 'dataType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeType')}`,
          label: this.$t('tableColumnAttributeDataType')
        }, {
          key: 'attributeValue',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributeValue')}`,
          label: this.$t('tableColumnAttributeValue')
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  mixins: [ typesMixin ],
  methods: {
    refresh: function () {
      this.$refs.germplasmAttributeTable.refresh()
    }
  }
}
</script>

<style>
</style>
