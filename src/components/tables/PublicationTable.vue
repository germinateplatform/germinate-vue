<template>
  <div>
    <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              class="publication-table"
              ref="publicationTable"
              v-on="$listeners">
      <template v-slot:cell(publicationId)="data">
        <router-link v-if="data.item.referenceType !== 'database'" :to="{ name: 'publication-details', params: { publicationId: data.item.publicationId, publicationType: data.item.referenceType } }" event="" @click.native.prevent="$emit('publication-selected', { publicationId: data.item.publicationId, publicationType: data.item.referenceType })">{{ data.item.publicationId }}</router-link>
        <span v-else>{{ data.item.publicationId }}</span>
      </template>        
      <template v-slot:cell(publicationName)="data">
        <template v-if="data.item.publicationFallbackCache">
          <router-link v-if="data.item.referenceType !== 'database'" :to="{ name: 'publication-details', params: { publicationId: data.item.publicationId, publicationType: data.item.referenceType } }" event="" @click.native.prevent="$emit('publication-selected', { publicationId: data.item.publicationId, publicationType: data.item.referenceType })">{{ data.item.publicationFallbackCache.title }}</router-link>
          <span v-else>{{ data.item.publicationFallbackCache.title }}</span>
        </template>
      </template>
      <template v-slot:cell(publicationJournal)="data">
        <span v-if="data.item.publicationFallbackCache">{{ data.item.publicationFallbackCache['container-title'] }}</span>
      </template>
      <template v-slot:cell(publicationDoi)="data">
        <span><a rel="noopener noreferrer" :href="data.item.publicationDoi">{{ data.item.publicationDoi }}</a> <i class="mdi mdi-open-in-new" /></span>
      </template>
      <template v-slot:cell(referencingIds)="data">
        <span v-if="data.item.referencingIds && data.item.referencingIds.length > 0 && data.item.referencingIds[0] !== null">{{ data.item.referencingIds.length }}</span>
      </template>
      <!-- Publication type icon -->
      <template v-slot:cell(referenceType)="data">
        <b-badge :style="`color: ${getHighContrastTextColor(publicationTypes[data.item.referenceType].color)}; background-color: ${publicationTypes[data.item.referenceType].color};`"><i :class="`mdi mdi-18px ${publicationTypes[data.item.referenceType].icon} fix-alignment`" /> {{ publicationTypes[data.item.referenceType].text }}</b-badge>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

import typesMixin from '@/mixins/types.js'
import colorMixin from '@/mixins/colors.js'

export default {
  name: 'PublicationTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      options: {
        idColumn: 'publicationId',
        tableName: 'publication'
      }
    }
  },
  computed: {
    columns: function () {
      let result = [
        {
          key: 'publicationId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'publicationId')}`,
          label: this.$t('tableColumnPublicationId')
        }, {
          key: 'publicationName',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'publicationName')}`,
          label: this.$t('tableColumnPublicationName')
        }, {
          key: 'publicationDoi',
          type: Number,
          sortable: true,
          class: this.isTableColumnHidden(this.options.tableName, 'publicationDoi'),
          label: this.$t('tableColumnPublicationDoi')
        }, {
          key: 'publicationJournal',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'publicationJournal')}`,
          label: this.$t('tableColumnPublicationJournal')
        }, {
          key: 'referenceType',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'referenceType')}`,
          label: this.$t('tableColumnPublicationReferenceType')
        }, {
          key: 'referencingIds',
          type: 'json',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'referencingIds')}`,
          label: this.$t('tableColumnPublicationReferencingIds')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'createdOn')}`,
          label: this.$t('tableColumnPublicationCreatedOn'),
          formatter: this.$options.filters.toDate
        }
      ]

      return result
    }
  },
  components: {
    BaseTable
  },
  mixins: [ colorMixin, typesMixin ],
  methods: {
    refresh: function () {
      this.$refs.publicationTable.refresh()
    }
  }
}
</script>

<style>
</style>
