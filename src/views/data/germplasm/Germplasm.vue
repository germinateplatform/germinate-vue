<template>
  <div>
    <h1>{{ $t('pageGermplasmTitle') }}</h1>
    <hr />
    <p v-html="$t('pageGermplasmText')" />

    <RecentItems itemType="germinatebase" />

    <!-- These buttons are for switching between different entity types. They make switching very convenient. -->
    <b-button-group>
      <b-button @click="selectedEntityType = null" :pressed="selectedEntityType === null" variant="outline-primary">
        <i class="mdi mdi-18px fix-alignment mdi-check-all" /><span> {{$t('buttonAll')}}</span> <b-badge>{{ allGermplasmCount }}</b-badge>
      </b-button>
      <b-button v-for="entityType in entityTypeOptions"
               :key="entityType.id"
               :pressed="pressedEntityTypeId === entityType.id"
               :disabled="entityType.disabled"
               :variant="entityType.disabled ? 'outline-secondary' : 'outline-primary'"
               @click="selectedEntityType = entityType">
        <i :class="`mdi mdi-18px fix-alignment ${entityType.icon}`" /><span> {{ entityType.text() }} <b-badge>{{ entityType.count }}</b-badge></span>
      </b-button>
    </b-button-group>

    <!-- Table showing all germplasm -->
    <GermplasmTable :filterOn="filterOn" :getData="getData" :getIds="getIds" :downloadTable="downloadTable"  ref="germplasmTable" />

    <!-- Germplasm download options -->
    <GermplasmDownload />
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'
import GermplasmDownload from '@/components/germplasm/GermplasmDownload'
import RecentItems from '@/components/util/RecentItems'
import germplasmApi from '@/mixins/api/germplasm.js'
import miscApi from '@/mixins/api/misc.js'
import typesMixin from '@/mixins/types.js'

export default {
  data: function () {
    return {
      selectedEntityType: null,
      filterOn: []
    }
  },
  components: {
    GermplasmTable,
    GermplasmDownload,
    RecentItems
  },
  computed: {
    entityTypeOptions: function () {
      return Object.keys(this.entityTypes).map(e => {
        const stats = this.entityTypeStats.filter(es => es.entityTypeName === e)
        const enabled = stats && stats.length > 0 && stats[0].count > 0
        const count = stats && stats.length > 0 ? stats[0].count : 0

        return {
          id: e,
          icon: this.entityTypes[e].icon,
          disabled: !enabled,
          count: count,
          text: () => this.entityTypes[e].text()
        }
      })
    },
    allGermplasmCount: function () {
      return this.entityTypeOptions.map(o => o.count).reduce((a, b) => a + b)
    },
    pressedEntityTypeId: function () {
      return this.selectedEntityType ? this.selectedEntityType.id : null
    }
  },
  watch: {
    selectedEntityType: function (newValue) {
      if (!newValue) {
        this.filterOn = []
      } else {
        this.filterOn = [{
          column: {
            name: 'entityTypeName',
            type: 'entityType'
          },
          comparator: 'equals',
          operator: 'and',
          values: [newValue.id]
        }]
      }

      // Update the table according to new filtering
      this.$refs.germplasmTable.refresh()
    }
  },
  mixins: [ germplasmApi, miscApi, typesMixin ],
  methods: {
    downloadTable: function (data, callback) {
      return this.apiPostTableExport(data, 'germplasm', callback)
    },
    getData: function (data, callback) {
      return this.apiPostGermplasmTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostGermplasmTableIds(data, callback)
    }
  },
  created: function () {
    if (this.tableFiltering && this.tableFiltering.length > 0) {
      this.filterOn = this.filterOn.concat(this.tableFiltering)
      this.$store.dispatch('ON_TABLE_FILTERING_CHANGED', null)
    }
  },
  mounted: function () {
    this.$store.dispatch('ON_HELP_KEY_CHANGED', 'helpGermplasm')
  }
}
</script>

<style>
</style>
