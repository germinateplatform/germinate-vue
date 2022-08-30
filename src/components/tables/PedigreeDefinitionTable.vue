<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="pedigreeDefinitionTable"
               v-on="$listeners">
      <!-- Pedigree notation URL -->
      <template v-slot:cell(pedigreeNotationUrl)="data">
        <span v-if="data.item.pedigreeNotationUrl">
          <a :href="toUrl(data.item.pedigreeNotationUrl)" rel="noopener noreferrer" v-if="toUrl(data.item.pedigreeNotationUrl)">{{ data.item.pedigreeNotationUrl }}</a>
          <span v-else>{{ data.item.pedigreeNotationUrl }}</span>
        </span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import utilMixin from '@/mixins/util'
const emitter = require('tiny-emitter/instance')

export default {
  name: 'PedigreeDefinitionTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      options: {
        idColumn: 'germplasmId',
        tableName: 'pedigreedefinitions'
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
          class: 'text-right',
          label: this.$t('tableColumnPedigreeDatasetId')
        },
        {
          key: 'datasetName',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnPedigreeDatasetName')
        },
        {
          key: 'germplasmId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnGermplasmId')
        }, {
          key: 'germplasmName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnGermplasmName')
        }, {
          key: 'pedigreeNotationName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPedigreeNotationName')
        }, {
          key: 'pedigreeNotationDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPedigreeNotationDescription')
        }, {
          key: 'pedigreeNotationUrl',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPedigreeNotationUrl')
        }, {
          key: 'definition',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPedigreeDefinition')
        }, {
          key: 'pedigreeDescriptionName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPedigreeDescriptionName')
        }, {
          key: 'pedigreeDescriptionDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPedigreeDescriptionDescription')
        }, {
          key: 'pedigreeDescriptionAuthor',
          type: String,
          sortable: true,
          label: this.$t('tableColumnPedigreeDescriptionAuthor')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnPedigreeDefinitionCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  mixins: [utilMixin],
  methods: {
    toUrl: function (input) {
      let url

      try {
        url = new URL(input)
      } catch (_) {
        return false
      }

      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return input
      } else {
        return undefined
      }
    },
    refresh: function () {
      this.$refs.pedigreeDefinitionTable.refresh()
    }
  },
  mounted: function () {
    emitter.on('license-accepted', this.refresh)
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.refresh)
  }
}
</script>

<style>
</style>
