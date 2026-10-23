<template>
  <!-- Pedigree results of the Search page, as on the germplasm page: the definitions of the pedigree datasets where the
       pedigrees found are, then the pedigrees found (parents and progeny) -->
  <div class="pedigree-results">
    <section class="pedigree-results-card">
      <h2 class="pedigree-results-title">Pedigree definitions</h2>
      <div class="pedigree-results-scroll">
        <PedigreeDefinitionTable v-if="datasetIds !== null" :getData="getDefinitionData" :storeUrlParameters="false" :key="'definitions-' + datasetIds.join(',')" />
      </div>
    </section>

    <section class="pedigree-results-card">
      <h2 class="pedigree-results-title">Parents and progeny</h2>
      <div class="pedigree-results-scroll">
        <PedigreeTable :getData="getData" :storeUrlParameters="false" />
      </div>
    </section>
  </div>
</template>

<script>
import PedigreeTable from '@/components/tables/PedigreeTable'
import PedigreeDefinitionTable from '@/components/tables/PedigreeDefinitionTable'
import { apiPostPedigreeTable, apiPostPedigreedefinitionTable } from '@/mixins/api/germplasm'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

export default {
  components: {
    PedigreeTable,
    PedigreeDefinitionTable
  },
  props: {
    // The pedigrees found (the search's filter on top of those of the table), see SearchView
    getData: {
      type: Function,
      required: true
    },
    // The search's filter of the pedigree table: its pedigree datasets give the definitions shown
    searchFilter: {
      type: Array,
      default: () => []
    },
    polygons: {
      type: Array,
      default: null
    }
  },
  data: function () {
    return {
      // The pedigree datasets of the pedigrees found (null while they are looked for)
      datasetIds: null
    }
  },
  methods: {
    // The definitions of those datasets (none: a filter that finds none)
    getDefinitionData: function (data, callback) {
      const filter = (data.filter || []).concat([{ column: 'datasetId', comparator: 'inSet', operator: 'and', values: this.datasetIds.length > 0 ? this.datasetIds : [-1] }])
      return apiPostPedigreedefinitionTable({ ...data, filter }, callback)
    },
    loadDatasetIds: function () {
      apiPostPedigreeTable({ page: 1, limit: MAX_JAVA_INTEGER, filter: this.searchFilter || [] }, result => {
        this.datasetIds = [...new Set(((result && result.data) || []).map(p => p.datasetId).filter(id => id !== null && id !== undefined))]
      }, { codes: [], callback: () => { this.datasetIds = [] } })
    }
  },
  mounted: function () {
    this.loadDatasetIds()
  }
}
</script>

<style scoped>
/* The cards of the germplasm page */
.pedigree-results-card {
  min-width: 0;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: var(--cp-surface, #ffffff);
  border: 1px solid var(--cp-border, #e2e3df);
  border-radius: 12px;
}
.pedigree-results-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
}
.pedigree-results-scroll {
  max-width: 100%;
  overflow-x: auto;
}
</style>
