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
          <router-link v-if="data.item.referenceType !== 'database'" :to="{ name: 'publication-details', params: { publicationId: data.item.publicationId, publicationType: data.item.referenceType } }" event="" @click.native.prevent="$emit('publication-selected', { publicationId: data.item.publicationId, publicationType: data.item.referenceType })" v-html="data.item.publicationFallbackCache.title" />
          <span v-else v-html="data.item.publicationFallbackCache.title" />
        </template>
      </template>
      <template v-slot:cell(publicationJournal)="data">
        <span v-if="data.item.publicationFallbackCache">{{ data.item.publicationFallbackCache['container-title'] }}</span>
      </template>
      <template v-slot:cell(publicationDoi)="data">
        <span><a rel="noopener noreferrer" :href="data.item.publicationDoi">{{ data.item.publicationDoi }}</a> <MdiIcon :path="mdiOpenInNew" /></span>
      </template>
      <template v-slot:cell(referencingIds)="data">
        <span v-if="data.item.referencingIds && data.item.referencingIds.length > 0 && data.item.referencingIds[0] !== null">{{ data.item.referencingIds.length }}</span>
      </template>
      <!-- Publication type icon -->
      <template v-slot:cell(referenceType)="data">
        <b-badge class="w-100" :style="`color: ${getHighContrastTextColor(publicationTypes[data.item.referenceType].color)}; background-color: ${publicationTypes[data.item.referenceType].color};`"><MdiIcon :path="publicationTypes[data.item.referenceType].path" /> {{ publicationTypes[data.item.referenceType].text }}</b-badge>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

import typesMixin from '@/mixins/types'
import colorMixin from '@/mixins/colors'
import utilMixin from '@/mixins/util'

import { mdiOpenInNew } from '@mdi/js'

export default {
  name: 'PublicationTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      mdiOpenInNew,
      options: {
        idColumn: 'publicationId',
        tableName: 'publications'
      }
    }
  },
  computed: {
    columns: function () {
      const result = [
        {
          key: 'publicationId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnPublicationId')
        }, {
          key: 'publicationName',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnPublicationName')
        }, {
          key: 'publicationDoi',
          type: Number,
          sortable: true,
          label: this.$t('tableColumnPublicationDoi')
        }, {
          key: 'publicationJournal',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnPublicationJournal')
        }, {
          key: 'referenceType',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPublicationReferenceType')
        }, {
          key: 'referencingIds',
          type: 'json',
          sortable: true,
          label: this.$t('tableColumnPublicationReferencingIds')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnPublicationCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }
      ]

      return result
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  mixins: [colorMixin, typesMixin, utilMixin],
  methods: {
    refresh: function () {
      this.$refs.publicationTable.refresh()
    }
  }
}
</script>

<style>
</style>
