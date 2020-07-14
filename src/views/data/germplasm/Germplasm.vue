<template>
  <div>
    <h1>{{ $t('pageGermplasmTitle') }}</h1>
    <hr />
    <p v-html="$t('pageGermplasmText')" />

    <RecentItems itemType="germinatebase" />

    <!-- These buttons are for switching between different entity types. They make switching very convenient. -->
    <b-button-group>
      <b-button @click="setEntityType(null)" :pressed="selectedEntityType === null" variant="outline-primary">
        <i class="mdi mdi-18px fix-alignment mdi-check-all" /><span> {{$t('buttonAll')}}</span>
      </b-button>
      <b-button v-for="entityType in getEntityTypeOptions()"
               :key="entityType.id"
               :pressed="isPressed(entityType)"
               :disabled="entityType.disabled"
               :variant="entityType.disabled ? 'outline-secondary' : 'outline-primary'"
               @click="setEntityType(entityType)">
        <i :class="`mdi mdi-18px fix-alignment ${entityType.icon}`" /><span> {{ entityType.text() }}</span>
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
  watch: {
    selectedEntityType: function (newValue, oldValue) {
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
    }
  },
  mixins: [ germplasmApi, miscApi, typesMixin ],
  methods: {
    setEntityType: function (entityType) {
      this.selectedEntityType = entityType
      this.$nextTick(() => this.$refs.germplasmTable.refresh())
    },
    isPressed: function (entityType) {
      if (this.selectedEntityType) {
        return this.selectedEntityType.id === entityType.id
      } else {
        return false
      }
    },
    downloadTable: function (data, callback) {
      return this.apiPostTableExport(data, 'germplasm', callback)
    },
    getData: function (data, callback) {
      return this.apiPostGermplasmTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostGermplasmTableIds(data, callback)
    },
    getEntityTypeOptions: function () {
      return Object.keys(this.entityTypes).map(e => {
        var stats = this.entityTypeStats.filter(es => es.entityTypeName === e)
        var enabled = stats && stats.length > 0 && stats[0].count > 0

        return {
          id: e,
          icon: this.entityTypes[e].icon,
          disabled: !enabled,
          text: () => this.entityTypes[e].text()
        }
      })
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
