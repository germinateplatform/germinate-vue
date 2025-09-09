<template>
  <div>
    <section v-if="dataWarnings && dataWarnings.length > 0" class="mb-3 g-no-gutters">
      <v-banner
        v-for="(warning, index) in dataWarnings"
        :key="`data-warning-${index}`"
        bg-color="warning"
        :icon="dataWarningTypes[warning.category]"
      >
        <template #text>
          <v-chip class="me-2" label prepend-icon="mdi-calendar" v-if="warning.createdOn">{{ new Date(warning.createdOn).toLocaleDateString() }}</v-chip> {{ warning.description }}
        </template>
      </v-banner>
    </section>

    <ScrollSpy :items="scrollSpyItems" ref="scrollSpy" />

    <template v-if="germplasm">
      <h1 class="text-h4 my-3 d-flex justify-space-between align-center">{{ title }}<v-chip label :prepend-icon="entityTypes[germplasm.entityTypeName].path" :text="entityTypes[germplasm.entityTypeName].text()" :color="entityTypes[germplasm.entityTypeName].color()" /></h1>
      <v-divider class="mb-3" />
      <p>{{ $t('pagePassportText') }}</p>

      <v-row>
        <v-col cols="12" md="6">
          <!-- MCPD -->
          <McpdInfo class="mb-3" :germplasm="germplasm" id="mcpd" v-intersect="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)" />
        </v-col>
        <v-col cols="12" md="6">
          <!-- PDCI -->
          <v-card class="mb-3" :title="$t('pagePassportPdciTitle')" id="pdci" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
            <template #prepend><v-icon icon="mdi-chart-donut" color="primary" /></template>
            <template #append><v-icon icon="mdi-help-circle" @click="showPdciInfo" /></template>
            <template #text>
              <p><strong>{{ $t('pagePassportPdciText', { pdci: germplasm.pdci.toFixed(2) }) }}</strong></p>
            </template>
          </v-card>
          <!-- Synonyms -->
          <v-card class="mb-3" :title="$t('pagePassportSynonymsTitle')" v-if="germplasm.synonyms" id="synonyms" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
            <template #prepend><v-icon icon="mdi-tag-text-outline" color="primary" /></template>
            <template #text>
              <ul>
                <li v-for="(synonym, index) in germplasm.synonyms" :key="`germplasm-synonym-${index}`">
                  {{ synonym }}
                </li>
              </ul>
            </template>
          </v-card>
          <!-- Links -->
          <v-card class="mb-3" :title="$t('pagePassportLinksTitle')" id="links" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
            <template #prepend><v-icon icon="mdi-link-variant" color="primary" /></template>
            <template #text>
              <ExternalLinks :foreign-id="germplasm.germplasmId" target-table="germinatebase" />
            </template>
          </v-card>

          <v-card class="mb-3" title="Humbug" id="humbug">
            <template #prepend><v-icon icon="mdi-barcode" color="primary" /></template>
            <template #text>
              <v-btn :text="$t('pagePassportGenerateBarcode')" target="_blank" :href="`https://cropgeeks.github.io/humbug/#/import?barcodes=${germplasm.germplasmName}`" />
            </template>
          </v-card>
        </v-col>
      </v-row>

      <InstitutionTable class="mb-3" header-icon-color="primary" :get-data="getInstitutionData" id="institutions" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)" />
      <PublicationTable class="mb-3" header-icon-color="primary" :get-data="getPublicationData" :filter-on="publicationFilter" id="publications" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
        <template #card-text>
          <v-card-text>
            <p v-html="$t('pagePassportPublicationsText')" />
          </v-card-text>
        </template>
      </PublicationTable>

      <v-card v-show="performanceDataCount > 0" class="mb-3" :title="$t('pagePassportTraitStatsTitle')" id="performance" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
        <template #prepend><v-icon color="primary" icon="mdi-speedometer" /></template>
        <template #text>
          <p>{{ $t('pagePassportTraitStatsText') }}</p>

          <v-expansion-panels eager>
            <v-expansion-panel
              eager
              :value="performanceDataCount <= 48"
              :title="$t('buttonToggle')"
            >
              <template #text>
                <GermplasmTraitStats :germplasm-id="germplasm.germplasmId" @has-data="(count) => { performanceDataCount = count }" />
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
      </v-card>

      <DatasetTable class="mb-3" header-icon-color="primary" :get-data="getDatasetData" id="datasets" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
        <template #card-text>
          <v-card-text>
            <p v-html="$t('pagePassportDatasetText')" />
          </v-card-text>
        </template>
      </DatasetTable>
      <PedigreeDefinitionTable class="mb-3" header-icon-color="primary" :get-data="getPedigreedefinitionData" :filter-on="pedigreeDefinitionFilter" id="pedigree" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
        <template #card-text>
          <v-card-text>
            <p v-html="$t('pagePassportPedigreeText')" />
          </v-card-text>
        </template>
      </PedigreeDefinitionTable>
      <PedigreeTable class="mb-3" header-icon-color="primary" :get-data="getPedigreeData" :filter-on="pedigreeFilter" />

      <PedigreeChart class="mb-3" :germplasm="germplasm" />

      <v-card class="mb-3" :title="$t('pagePassportImageTitle')" id="images" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
        <template #prepend><v-icon color="primary" icon="mdi-image-multiple" /></template>
        <template #text>
          <Images :filter-on="imageFilter" />
        </template>
      </v-card>

      <GroupTable class="mb-3" header-icon-color="primary" :get-data="getGroupData" id="groups" v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)">
        <template #card-text>
          <v-card-text>
            <p v-html="$t('pagePassportGroupText')" />
          </v-card-text>
        </template>
      </GroupTable>
    </template>
  </div>
</template>

<script setup lang="ts">
  import ScrollSpy from '@/components/widgets/ScrollSpy.vue'
  import { apiGetGermplasmDataWarnings, apiPostGermplasmDatasetTable, apiPostGermplasmGroupTable, apiPostGermplasmTable, apiPostPedigreedefinitionTable, apiPostPedigreeTable } from '@/plugins/api/germplasm'
  import { type Datawarnings, FilterComparator, type FilterGroup, FilterOperator, type PaginatedRequest, type PaginatedResult, type ViewTableGermplasm, type ViewTableGroups, type ViewTablePublications } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import McpdInfo from '@/components/germplasm/McpdInfo.vue'
  import ExternalLinks from '@/components/widgets/ExternalLinks.vue'
  import InstitutionTable from '@/components/tables/InstitutionTable.vue'
  import { apiPostGermplasmInstitutionTable, apiPostPublicationsTable } from '@/plugins/api/misc'
  import { entityTypes } from '@/plugins/util/types'
  import PublicationTable from '@/components/tables/PublicationTable.vue'
  import { lookupDoiInformation } from '@/plugins/util'
  import PedigreeDefinitionTable from '@/components/tables/PedigreeDefinitionTable.vue'
  import PedigreeTable from '@/components/tables/PedigreeTable.vue'
  import PedigreeChart from '@/components/charts/PedigreeChart.vue'
  import Images from '@/components/widgets/Images.vue'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const compProps = defineProps<{
    germplasmId: number
  }>()

  const { t } = useI18n()

  const store = coreStore()
  const scrollSpy = useTemplateRef('scrollSpy')
  const performanceDataCount = ref(0)
  const germplasm = ref<ViewTableGermplasm>()
  const dataWarnings = ref<Datawarnings[]>([])
  const groups = ref<ViewTableGroups[]>()

  const activeStack: string[] = []
  let activeItem: string | undefined = undefined

  const dataWarningTypes: { [key: string]: string } = {
    generic: 'mdi-alert',
    quality: 'mdi-file-certificate',
    source: 'mdi-invoice-text-arrow-right',
    deprecated: 'mdi-history',
    missing: 'mdi-help-rhombus',
    inaccuracy: 'mdi-file-document-alert',
  }

  const title = computed(() => {
    if (germplasm.value) {
      return [germplasm.value.germplasmName, germplasm.value.germplasmDisplayName, germplasm.value.germplasmNumber].filter(p => p !== null).join(' / ')
    } else {
      return ''
    }
  })
  const isMarked = computed(() => store.storeMarkedGermplasm.includes(compProps.germplasmId))
  const scrollSpyItems = computed(() => {
    return [
      { href: '#', tooltip: 'tooltipGermplasmMarkedItem', icon: isMarked.value ? 'mdi-bookmark-check' : 'mdi-bookmark-outline', click: () => markItem() },
      { href: '#mcpd', icon: 'mdi-passport', title: 'pagePassportMcpdTitle' },
      { href: '#links', icon: 'mdi-open-in-new', title: 'pagePassportLinksTitle' },
      { href: '#institutions', icon: 'mdi-office-building-cog', title: 'pagePassportInstitutionTitle' },
      { href: '#publications', icon: 'mdi-book-open-variant', title: 'pagePassportPublicationsTitle' },
      ...performanceDataCount.value > 0 ? [{ href: '#performance', icon: 'mdi-speedometer', title: 'pagePassportTraitStatsTitle' }] : [],
      { href: '#datasets', icon: 'mdi-database', title: 'pagePassportDatasetTitle' },
      { href: '#pedigree', icon: 'mdi-family-tree', title: 'pagePassportPedigreeTitle' },
      ...germplasm.value?.latitude && germplasm.value?.longitude ? [{ href: '#location', icon: 'mdi-map-marker', title: 'pagePassportLocationTitle' }] : [],
      { href: '#images', icon: 'mdi-image-multiple', title: 'pagePassportImageTitle' },
      { href: '#groups', icon: 'mdi-group', title: 'pagePassportGroupTitle' },
      { href: '#entity', icon: 'mdi-file-tree', title: 'pagePassportEntityTitle' },
      { href: '#attributes', icon: 'mdi-playlist-plus', title: 'pagePassportAttributeTitle' },
    ]
  })
  const pedigreeDefinitionFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'germplasmId',
        comparator: FilterComparator.equals,
        values: [`${compProps.germplasmId}`],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })
  const pedigreeFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'parentId',
        comparator: FilterComparator.equals,
        values: [`${compProps.germplasmId}`],
        canBeChanged: false,
      }, {
        column: 'childId',
        comparator: FilterComparator.equals,
        values: [`${compProps.germplasmId}`],
        canBeChanged: false,
      }],
      operator: FilterOperator.or,
    }]
  })
  const imageFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'imageForeignId',
        comparator: FilterComparator.equals,
        values: [`${compProps.germplasmId}`],
        canBeChanged: false,
      }, {
        column: 'imageRefTable',
        comparator: FilterComparator.equals,
        values: ['germinatebase'],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })
  const publicationFilter: ComputedRef<FilterGroup[]> = computed(() => {
    const result = [{
      filters: [{
        column: 'germplasmIds',
        comparator: FilterComparator.contains,
        values: [`${compProps.germplasmId}`],
        canBeChanged: false,
      }],
      operator: FilterOperator.or,
    }]

    if (groups.value && groups.value.length > 0) {
      groups.value.forEach(g => {
        result[0].filters.push({
          column: 'groupIds',
          comparator: FilterComparator.contains,
          values: [`${g.groupId}`],
          canBeChanged: false,
        })
      })
    }

    return result
  })

  function markItem () {
    if (isMarked.value) {
      store.removeMarkedIds('germplasm', [compProps.germplasmId])
    } else {
      store.addMarkedIds('germplasm', [compProps.germplasmId])
    }
  }

  function onIntersect (entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeStack.push(entry.target.id)
      } else if (activeStack.includes(entry.target.id)) {
        activeStack.splice(activeStack.indexOf(entry.target.id), 1)
      }
    })
    activeItem = activeStack.at(-1) || activeItem || scrollSpyItems.value[0].href || ''

    scrollSpy.value?.setActive(`#${activeItem}`)
  }

  function getPedigreeData (data: PaginatedRequest) {
    return apiPostPedigreeTable(data)
  }
  function getPedigreedefinitionData (data: PaginatedRequest) {
    return apiPostPedigreedefinitionTable(data)
  }
  function getDatasetData (data: PaginatedRequest) {
    return apiPostGermplasmDatasetTable(germplasm.value?.germplasmId || -1, data)
  }
  function getInstitutionData (data: PaginatedRequest) {
    return apiPostGermplasmInstitutionTable(germplasm.value?.germplasmId || -1, data)
  }
  function getPublicationData (data: PaginatedRequest) {
    return apiPostPublicationsTable<PaginatedResult<ViewTablePublications[]>>(data, result => {
      if (result && result.data && result.data.length > 0) {
        result.data.forEach(p => {
          p.lookupDetails = lookupDoiInformation(p)
          try {
            p.publicationFallbackCache = JSON.parse(p.publicationFallbackCache || '')
          } catch {
            //
          }
        })
      }
    })
  }
  function getGroupData (data: PaginatedRequest) {
    return apiPostGermplasmGroupTable<PaginatedResult<ViewTableGroups[]>>(germplasm.value?.germplasmId || -1, data, result => {
      if (result && result.data) {
        groups.value = result.data
      } else {
        groups.value = []
      }
    })
  }
  function showPdciInfo () {
    emitter.emit('show-confirm', {
      title: t('pagePassportPdciTitle'),
      message: t('pagePassportPdciModal'),
      okTitle: t('genericOk'),
      cancelTitle: undefined,
      okOnly: true,
      okVariant: 'primary',
    })
  }

  onMounted(() => {
    const query: PaginatedRequest = {
      filters: [{
        filters: [{
          column: 'germplasmId',
          comparator: FilterComparator.equals,
          values: [`${compProps.germplasmId}`],
        }],
        operator: FilterOperator.and,
      }],
      page: 1,
      limit: 1,
    }

    apiPostGermplasmTable<PaginatedResult<ViewTableGermplasm[]>>(query, result => {
      if (result && result.data && result.data.length > 0) {
        germplasm.value = result.data[0]
      }
    })

    apiGetGermplasmDataWarnings<Datawarnings[]>(compProps.germplasmId, result => {
      dataWarnings.value = result
    })
  })
</script>
