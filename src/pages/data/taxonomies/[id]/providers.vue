<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageTaxonomyProviderTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageTaxonomyProviderText')" />

    <template v-if="taxonomy">
      <v-list>
        <v-list-item :title="$t('tableColumnTaxonomyGenus')">
          <template #subtitle>
            <span class="font-italic">{{ taxonomy.taxonomyGenus }}</span>
          </template>
        </v-list-item>
        <v-list-item :title="$t('tableColumnTaxonomySpecies')" v-if="taxonomy.taxonomySpecies">
          <template #subtitle>
            <span class="font-italic">{{ taxonomy.taxonomySpecies }}</span>
          </template>
        </v-list-item>
        <v-list-item :title="$t('tableColumnTaxonomySubtaxa')" v-if="taxonomy.taxonomySubtaxa">
          <template #subtitle>
            <span class="font-italic">{{ taxonomy.taxonomySubtaxa }}</span>
          </template>
        </v-list-item>
      </v-list>

      <v-row v-if="taxonomy.taxonomyProviders && taxonomy.taxonomyProviders.length > 0">
        <v-col cols="12" sm="6" md="4" lg="3" class="mb-3" v-for="provider in taxonomy.taxonomyProviders" :key="`provider-${provider.providerName}`">
          <v-card prepend-icon="mdi-identifier" :title="provider.providerName">
            <v-list>
              <v-list-item :title="$t('pageTaxonomyProviderUrl')" v-if="provider.providerHomepage">
                <template #subtitle>
                  <a :href="provider.providerHomepage" rel="noopener noreferrer" target="_blank">{{ provider.providerHomepage }}</a>
                </template>
              </v-list-item>
              <v-list-item :title="$t('pageTaxonomyProviderExternalId')" v-if="provider.providerPlaceholder && provider.externalId">
                <template #subtitle>
                  <a :href="getUrl(provider)" rel="noopener noreferrer" target="_blank">{{ getUrl(provider) }}</a>
                </template>
              </v-list-item>
            </v-list>

            <v-card-actions v-if="provider.providerName === 'NCBI'">
              <v-spacer />
              <v-btn @click="showEbiOverview(provider)" prepend-icon="mdi-api" :text="$t('buttonReadMore')" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mb-3" v-if="ebiOverview">
        <v-data-table
          :headers="ebiOverviewHeaders"
          :items="ebiOverview"
          :loading="ebiOverviewLoading"
        >
          <template #top>
            <v-toolbar
              flat
              density="compact"
              class="justify-space-between pa-2"
            >
              <v-toolbar-title class="flex-unset ms-2">
                {{ $t('pageTaxonomyProvidersEbiOverviewTitle') }}
              </v-toolbar-title>
            </v-toolbar>
          </template>

          <template #item.result_id="{ item }">
            <a href="#" @click.prevent="showStudies" v-if="item.result_id === 'study'">{{ item.result_id }}</a>
            <a href="#" @click.prevent="showAssemblies" v-else-if="item.result_id === 'assembly'">{{ item.result_id }}</a>
            <span v-else>{{ item.result_id }}</span>
          </template>
          <template #item.description="{ item }">
            <a href="#" @click.prevent="showStudies" v-if="item.result_id === 'study'">{{ item.description }}</a>
            <a href="#" @click.prevent="showAssemblies" v-else-if="item.result_id === 'assembly'">{{ item.description }}</a>
            <span v-else>{{ item.description }}</span>
          </template>
        </v-data-table>
      </v-card>

      <v-card class="mb-3" v-if="ebiStudies">
        <v-data-table
          :items="ebiStudies"
          :loading="ebiStudiesLoading"
          :search="studySearch"
        >
          <template #top>
            <v-toolbar
              flat
              density="compact"
              class="justify-space-between pa-2"
            >
              <v-toolbar-title class="flex-unset ms-2">
                {{ $t('pageTaxonomyProvidersEbiStudiesTitle') }}
              </v-toolbar-title>
              <v-spacer />
              <v-text-field
                v-model="studySearch"
                clearable
                hide-details
                prepend-inner-icon="mdi-magnify"
                :placeholder="$t('inputPlaceholderSearch')"
                variant="solo"
                density="compact"
              />
              <v-spacer />
            </v-toolbar>
          </template>
          <template #item.study_accession="{ item }">
            <a :href="`https://www.ebi.ac.uk/ena/browser/view/${item.study_accession}`" rel="noopener noreferrer" target="_blank">{{ item.study_accession }}</a>
          </template>
        </v-data-table>
      </v-card>

      <v-card class="mb-3" v-if="ebiAssemblies">
        <v-data-table
          :items="ebiAssemblies"
          :loading="ebiAssembliesLoading"
          :search="assemblySearch"
        >
          <template #top>
            <v-toolbar
              flat
              density="compact"
              class="justify-space-between pa-2"
            >
              <v-toolbar-title class="flex-unset ms-2">
                {{ $t('pageTaxonomyProvidersEbiAssembliesTitle') }}
              </v-toolbar-title>
              <v-spacer />
              <v-text-field
                v-model="assemblySearch"
                clearable
                hide-details
                prepend-inner-icon="mdi-magnify"
                :placeholder="$t('inputPlaceholderSearch')"
                variant="solo"
                density="compact"
              />
              <v-spacer />
            </v-toolbar>
          </template>
          <template #item.accession="{ item }">
            <a :href="`https://www.ebi.ac.uk/ena/browser/view/${item.accession}`" rel="noopener noreferrer" target="_blank">{{ item.accession }}</a>
          </template>
        </v-data-table>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostTaxonomyTable } from '@/plugins/api/germplasm'
  import { ebiGetGenomeAssemblies, ebiGetRecords, ebiGetStudies } from '@/plugins/api/ebi'
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTableTaxonomies, type PaginatedRequest, type TaxonomyProviderInfo } from '@/plugins/types/germinate'
  import type { EbiStudy, EbiRecord, EbiGenomyAssembly } from '@/plugins/types/ebi'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const route = useRoute('/data/taxonomies/[id]/providers')

  const taxonomyId = ref<number>()
  const taxonomy = ref<ViewTableTaxonomies>()

  const ebiProvider = ref<TaxonomyProviderInfo>()
  const ebiOverview = ref<EbiRecord[]>()
  const ebiOverviewLoading = ref(false)
  const ebiOverviewHeaders = computed(() => {
    return [{
      title: t('tableColumnEbiOverviewResultType'),
      key: 'result_id',
    }, {
      title: t('tableColumnEbiOverviewResultDescription'),
      key: 'description',
    }, {
      title: t('tableColumnEbiOverviewResultCount'),
      key: 'entry_cnt',
      value: (item: EbiRecord) => item.entry_cnt !== undefined ? getNumberWithSuffix(item.entry_cnt, 1) : undefined,
    }]
  })

  const studySearch = ref()
  const ebiStudies = ref<EbiStudy[]>()
  const ebiStudiesLoading = ref(false)

  const assemblySearch = ref()
  const ebiAssemblies = ref<EbiGenomyAssembly[]>()
  const ebiAssembliesLoading = ref(false)

  function getUrl (provider: TaxonomyProviderInfo) {
    return provider.providerPlaceholder.replace('{ID}', provider.externalId)
  }

  function showEbiOverview (provider: TaxonomyProviderInfo) {
    ebiProvider.value = provider
    if (!ebiOverview.value) {
      ebiOverview.value = []
      ebiOverviewLoading.value = true
      ebiGetRecords<EbiRecord[]>(provider.externalId)
        .then(response => {
          if (response && response.data) {
            ebiOverviewLoading.value = false
            ebiOverview.value = response.data
          }
        })
    }
  }

  function showStudies () {
    if (!ebiStudies.value && ebiProvider.value) {
      ebiStudies.value = []
      ebiStudiesLoading.value = true
      ebiGetStudies<EbiStudy[]>(`${ebiProvider.value.externalId}`)
        .then(response => {
          if (response && response.data) {
            ebiStudies.value = response.data
            ebiStudiesLoading.value = false
          }
        })
    }
  }

  function showAssemblies () {
    if (!ebiAssemblies.value && ebiProvider.value) {
      ebiAssemblies.value = []
      ebiAssembliesLoading.value = true
      ebiGetGenomeAssemblies<EbiGenomyAssembly[]>(`${ebiProvider.value.externalId}`)
        .then(response => {
          if (response && response.data) {
            ebiAssemblies.value = response.data
            ebiAssembliesLoading.value = false
          }
        })
    }
  }

  onMounted(() => {
    if (route.params.id) {
      taxonomyId.value = +route.params.id

      const query: PaginatedRequest = {
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'taxonomyId',
            comparator: FilterComparator.equals,
            values: [`${taxonomyId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }

      apiPostTaxonomyTable<PaginatedResult<ViewTableTaxonomies[]>>(query, result => {
        if (result && result.data && result.data.length > 0) {
          taxonomy.value = result.data[0]
        }
      })
    }
  })
</script>
