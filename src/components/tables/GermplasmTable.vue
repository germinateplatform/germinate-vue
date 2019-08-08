<template>
  <v-server-table :url="''"
                  :columns="columns"
                  :options="options"
                  ref="germplasmTable">
    <b-row slot="beforeTable">
      <b-col cols=6>
        <TableFilter :columns="columns"
                     :texts="options.headings"
                     itemType="germplasm"
                     v-on:on-column-toggle="onToggleColumn" />
      </b-col>
      <b-col cols=6>
        <MarkedItems class="float-right" itemType="germplasm" v-on:items-cleared="onItemsCleared"/>
      </b-col>
    </b-row>

    <div slot="h__selected">
      <b-form-checkbox @change="onSelectionHeaderClicked"/>
    </div>

    <b-form-checkbox slot="selected" slot-scope="props" :checked="getValue(props.row)" @change="markItem('germplasm', props.row.id, $event)"/>
  </v-server-table>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import TableFilter from '@/components/tables/TableFilter'
import MarkedItems from '@/components/tables/MarkedItems'

export default {
  extends: BaseTable,
  name: 'GermplasmTable',
  data: function () {
    const columns = ['id', 'generalIdentifier', 'name', 'puid', 'selected']
    return {
      url: 'germplasm',
      columns: columns,
      options: {
        sortable: ['id', 'generalIdentifier', 'name', 'puid'],
        filterable: [],
        // TODO: Try and do this in the BaseTable...
        columnsClasses: {
          id: this.isHidden('germplasm', 'id'),
          generalIdentifier: this.isHidden('germplasm', 'generalIdentifier'),
          name: this.isHidden('germplasm', 'name'),
          puid: this.isHidden('germplasm', 'puid'),
          selected: 'text-right'
        },
        headings: {
          id: () => this.$t('tableColumnGermplasmId'),
          generalIdentifier: () => this.$t('tableColumnGermplasmGeneralIdentifier'),
          name: () => this.$t('tableColumnGermplasmName'),
          selected: () => ''
        }
      }
    }
  },
  components: {
    MarkedItems,
    TableFilter
  },
  methods: {
    requestData: function (data, callback) {
      return this.apiGetGermplasm(data, callback)
    },
    onItemsCleared: function () {
      this.$nextTick(() => this.$refs.germplasmTable.refresh())
    },
    getValue: function (row) {
      return this.markedIds.germplasm.indexOf(row.id) !== -1
    },
    onSelectionHeaderClicked: function (value) {
      console.log(value)
    }
  }
}
</script>

<style>

</style>
