<template>
  <div>
    <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              class="publication-table"
              ref="publicationTable"
              v-on="$listeners">
      <template v-slot:cell(publicationId)="data">
        <router-link v-if="data.item.referenceType !== 'database'" :to="{ name: Pages.publicationDetails, params: { publicationId: data.item.publicationId } }" event="" @click.native.prevent="$emit('publication-selected', { publicationId: data.item.publicationId })">{{ data.item.publicationId }}</router-link>
        <span v-else>{{ data.item.publicationId }}</span>
      </template>
      <template v-slot:cell(publicationName)="data">
        <template v-if="data.item.publicationFallbackCache">
          <router-link v-if="data.item.referenceType !== 'database'" :to="{ name: Pages.publicationDetails, params: { publicationId: data.item.publicationId } }" event="" @click.native.prevent="$emit('publication-selected', { publicationId: data.item.publicationId })" v-html="data.item.publicationFallbackCache.title" />
          <span v-else v-html="data.item.publicationFallbackCache.title" />
        </template>
      </template>
      <template v-slot:cell(publicationJournal)="data">
        <span v-if="data.item.publicationFallbackCache">{{ data.item.publicationFallbackCache['container-title'] }}</span>
      </template>
      <template v-slot:cell(publicationDoi)="data">
        <span><a rel="noopener noreferrer" :href="data.item.publicationDoi">{{ data.item.publicationDoi }}</a> <MdiIcon :path="mdiOpenInNew" /></span>
      </template>
      <template v-slot:cell(publicationDetails)="data">
        <b-badge class="mr-1" v-if="data.item.isDatabasePub" :style="`color: ${getHighContrastTextColor(publicationTypes.database.color)}; background-color: ${publicationTypes.database.color};`">
          <MdiIcon :path="publicationTypes.database.path" /> {{ publicationTypes.database.text() }}
        </b-badge>
        <b-badge class="mr-1" v-if="data.item.germplasmIds && data.item.germplasmIds.length > 0" :style="`color: ${getHighContrastTextColor(publicationTypes.germplasm.color)}; background-color: ${publicationTypes.germplasm.color};`">
          <MdiIcon :path="publicationTypes.germplasm.path" /> {{ publicationTypes.germplasm.text() }} ({{ data.item.germplasmIds.length }})
        </b-badge>
        <b-badge class="mr-1" v-if="data.item.datasetIds && data.item.datasetIds.length > 0" :style="`color: ${getHighContrastTextColor(publicationTypes.dataset.color)}; background-color: ${publicationTypes.dataset.color};`">
          <MdiIcon :path="publicationTypes.dataset.path" /> {{ publicationTypes.dataset.text() }} ({{ data.item.datasetIds.length }})
        </b-badge>
        <b-badge class="mr-1" v-if="data.item.experimentIds && data.item.experimentIds.length > 0" :style="`color: ${getHighContrastTextColor(publicationTypes.experiment.color)}; background-color: ${publicationTypes.experiment.color};`">
          <MdiIcon :path="publicationTypes.experiment.path" /> {{ publicationTypes.experiment.text() }} ({{ data.item.experimentIds.length }})
        </b-badge>
        <b-badge class="mr-1" v-if="data.item.groupIds && data.item.groupIds.length > 0" :style="`color: ${getHighContrastTextColor(publicationTypes.group.color)}; background-color: ${publicationTypes.group.color};`">
          <MdiIcon :path="publicationTypes.group.path" /> {{ publicationTypes.group.text() }} ({{ data.item.groupIds.length }})
        </b-badge>
      </template>
      <!-- Publication type icon -->
      <!-- <template v-slot:cell(referenceType)="data">
        <b-badge class="w-100" :style="`color: ${getHighContrastTextColor(publicationTypes[data.item.referenceType].color)}; background-color: ${publicationTypes[data.item.referenceType].color};`"><MdiIcon :path="publicationTypes[data.item.referenceType].path" /> {{ publicationTypes[data.item.referenceType].text }}</b-badge>
      </template> -->
    </BaseTable>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

import { publicationTypes } from '@/mixins/types'
import { getHighContrastTextColor } from '@/mixins/colors'
import { Pages } from '@/mixins/pages'

import { mdiOpenInNew } from '@mdi/js'

export default {
  name: 'PublicationTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      Pages,
      mdiOpenInNew,
      publicationTypes,
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
          key: 'publicationDetails',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnPublicationDetails')
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
  methods: {
    getHighContrastTextColor,
    refresh: function () {
      this.$refs.publicationTable.refresh()
    }
  }
}
</script>

<style>
</style>
