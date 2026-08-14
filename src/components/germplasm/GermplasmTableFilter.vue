<template>
  <v-row>
    <v-col class="v-input--indent-details">
      <HintContainer text="widgetGermplasmTableFilterHasData">
        <v-btn-group variant="tonal" class="d-flex">
          <v-btn class="flex-grow-1" :icon="datasetTypes.trials.path" :color="datasetTypes.trials.color()" v-tooltip:top="datasetTypes.trials.text()" @click="filterDataType('trials')" />
          <v-btn class="flex-grow-1" :icon="datasetTypes.genotype.path" :color="datasetTypes.genotype.color()" v-tooltip:top="datasetTypes.genotype.text()" @click="filterDataType('genotype')" />
          <v-btn class="flex-grow-1" :icon="datasetTypes.pedigree.path" :color="datasetTypes.pedigree.color()" v-tooltip:top="datasetTypes.pedigree.text()" @click="filterDataType('pedigree')" />
          <v-btn class="flex-grow-1" :icon="mdiCamera" :color="getTemplateColor(1)" v-tooltip:top="$t('widgetGermplasmTableFilterHasImages')" @click="filterDataType('image')" />
        </v-btn-group>
      </HintContainer>
    </v-col>
    <v-col>
      <v-select
        :label="$t('tableColumnTaxonomy')"
        :hint="$t('formDescriptionGermplasmTableTaxonomies')"
        :prepend-inner-icon="mdiLan"
        persistent-hint
        clearable
        item-value="id"
        item-title="title"
        return-object
        min-width="200px"
        class="mb-3"
        v-model="selectedTaxonomy"
        :items="aggregatedTaxonomy"
      >
        <template #item="{ props, internalItem: item }">
          <v-list-item v-bind="props" :title="item.title">
            <template #append>
              <v-chip class="ms-2" size="small" :text="getNumberWithSuffix(item.raw.count || 0, 1)" />
            </template>
          </v-list-item>
        </template>
        <template #selection="{ internalItem: item }">
          <v-chip density="compact" :text="item.title" variant="flat" />
        </template>
      </v-select>
    </v-col>
    <v-col>
      <v-autocomplete
        :label="$t('tableColumnBiologicalStatus')"
        :hint="$t('formDescriptionGermplasmTableBiologicalStatus')"
        :prepend-inner-icon="mdiCompost"
        persistent-hint
        clearable
        autocomplete="off"
        item-value="id"
        :item-title="(bs: BiologicalStatusCount) => bs.biologicalstatus || 'N/A'"
        return-object
        min-width="200px"
        class="mb-3"
        v-model="selectedBiologicalStatus"
        :items="biologicalStatus"
      >
        <template #item="{ props, internalItem: item }">
          <v-list-item v-bind="props" :disabled="item.raw.count < 1" :title="item.title">
            <template #append>
              <v-chip class="ms-2" size="small" :text="getNumberWithSuffix(item.raw.count || 0, 1)" />
            </template>
          </v-list-item>
        </template>
        <template #selection="{ internalItem: item }">
          <v-chip density="compact" :text="item.title" variant="flat" />
        </template>
      </v-autocomplete>
    </v-col>
    <v-col>
      <v-autocomplete
        :label="$t('tableColumnCountryName')"
        :hint="$t('formDescriptionGermplasmTableCountry')"
        :prepend-inner-icon="mdiEarth"
        persistent-hint
        clearable
        autocomplete="off"
        item-value="id"
        :item-title="(bs: CountryCount) => bs.countryName || 'N/A'"
        return-object
        min-width="200px"
        class="mb-3"
        v-model="selectedCountry"
        :items="countries"
      >
        <template #item="{ props, internalItem: item }">
          <v-list-item v-bind="props" :disabled="item.raw.count < 1" :title="item.title">
            <template #append>
              <v-chip class="ms-2" size="small" :text="getNumberWithSuffix(item.raw.count || 0, 1)" />
            </template>
          </v-list-item>
        </template>
        <template #selection="{ internalItem: item }">
          <v-chip density="compact" :text="item.title" variant="flat" />
        </template>
      </v-autocomplete>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostTaxonomyTable } from '@/plugins/api/germplasm'
  import { apiGetCountries } from '@/plugins/api/location'
  import { apiGetBiologicalStatusCount } from '@/plugins/api/stats'
  import { type BiologicalStatusCount, FilterComparator, FilterOperator, type Filter, type FilterGroup, type CountryCount } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { concat, getNumberWithSuffix } from '@/plugins/util/formatting'
  import { datasetTypes } from '@/plugins/util/types'
  import { mdiCamera, mdiCompost, mdiEarth, mdiLan } from '@mdi/js'
  import { watchIgnorable } from '@vueuse/core'

  const taxonomies = ref<TaxonomyItem[]>([])
  const selectedTaxonomy = ref<TaxonomyItem>()

  const biologicalStatus = ref<BiologicalStatusCount[]>([])
  const selectedBiologicalStatus = ref<BiologicalStatusCount>()

  const countries = ref<CountryCount[]>([])
  const selectedCountry = ref<CountryCount>()

  export interface TaxonomyItem {
    genus: string
    species?: string
    subtaxa?: string
    title: string
    count: number
  }

  const compProps = withDefaults(defineProps<{
    mode?: 'genus' | 'species' | 'subtaxa'
  }>(), {
    mode: 'subtaxa',
  })

  const model = defineModel<FilterGroup[]>({
    default: () => [],
  })

  const aggregatedTaxonomy = computed(() => {
    const mapping: { [key: string]: TaxonomyItem } = {}

    taxonomies.value.forEach(t => {
      const title = itemTitle(t)
      let mapped = mapping[title]

      if (mapped === undefined) {
        mapped = {
          genus: t.genus,
          species: (compProps.mode === 'subtaxa' || compProps.mode === 'species') ? t.species : undefined,
          subtaxa: compProps.mode === 'subtaxa' ? t.subtaxa : undefined,
          count: t.count,
          title,
        }
      } else {
        mapped.count += t.count
      }

      mapping[title] = mapped
    })

    return Object.values(mapping).sort((a, b) => a.title.localeCompare(b.title))
  })

  function itemTitle (item: TaxonomyItem) {
    const parts = []

    switch (compProps.mode) {
      case 'genus':
        parts.push(item.genus)
        break
      case 'species':
        parts.push(item.genus, item.species)
        break
      case 'subtaxa':
        parts.push(item.genus, item.species, item.subtaxa)
        break
    }

    return concat(' ', parts)
  }

  function filterDataType (type: 'trials' | 'genotype' | 'pedigree' | 'image') {
    let column

    switch (type) {
      case 'trials':
        column = 'hasTrialsData'
        break
      case 'genotype':
        column = 'hasGenotypicData'
        break
      case 'pedigree':
        column = 'hasPedigreeData'
        break
      case 'image':
        column = 'imageCount'
        break
    }

    model.value = [{
      operator: FilterOperator.and,
      filters: [{
        column,
        comparator: type === 'image' ? FilterComparator.greaterOrEquals : FilterComparator.equals,
        values: ['1'],
      }],
    }]
  }

  const { ignoreUpdates: ignoreCountry } = watchIgnorable(selectedCountry, newValue => {
    if (newValue) {
      model.value = [{
        operator: FilterOperator.and,
        filters: [{
          column: 'countryName',
          comparator: FilterComparator.equals,
          values: [newValue.countryName],
        }],
      }]
    } else {
      ignoreModel(() => {
        model.value = []
      })
    }
  })

  const { ignoreUpdates: ignoreTaxonomy } = watchIgnorable(selectedTaxonomy, newValue => {
    if (newValue) {
      const filters: Filter[] = [{
        column: 'genus',
        comparator: FilterComparator.equals,
        values: [newValue.genus],
      }]

      if ((compProps.mode === 'species' || compProps.mode === 'subtaxa') && newValue.species) {
        filters.push({
          column: 'species',
          comparator: FilterComparator.equals,
          values: [newValue.species],
        })
      }

      if (compProps.mode === 'subtaxa' && newValue.subtaxa) {
        filters.push({
          column: 'subtaxa',
          comparator: FilterComparator.equals,
          values: [newValue.subtaxa],
        })
      }

      model.value = [{
        operator: FilterOperator.and,
        filters,
      }]
    } else {
      ignoreModel(() => {
        model.value = []
      })
    }
  })

  const { ignoreUpdates: ignoreBiologicalStatus } = watchIgnorable(selectedBiologicalStatus, async newValue => {
    if (newValue) {
      model.value = [{
        operator: FilterOperator.and,
        filters: [{
          column: 'biologicalStatusName',
          comparator: FilterComparator.equals,
          values: [newValue.biologicalstatus],
        }],
      }]
    } else {
      ignoreModel(() => {
        model.value = []
      })
    }
  })

  const { ignoreUpdates: ignoreModel } = watchIgnorable(model, newValue => {
    if (!newValue || newValue.length === 0) {
      ignoreTaxonomy(() => {
        selectedTaxonomy.value = undefined
      })
      ignoreBiologicalStatus(() => {
        selectedBiologicalStatus.value = undefined
      })
      ignoreCountry(() => {
        selectedCountry.value = undefined
      })
    }
  })

  onMounted(() => {
    apiPostTaxonomyTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
    }, result => {
      if (result && result.data) {
        taxonomies.value = result.data.map(tax => {
          return {
            genus: tax.taxonomyGenus,
            species: tax.taxonomySpecies,
            subtaxa: tax.taxonomySubtaxa,
            count: tax.count,
            title: '',
          }
        })
      } else {
        taxonomies.value = []
      }
    })

    apiGetBiologicalStatusCount(true, result => {
      result.sort((a, b) => a.biologicalstatus.localeCompare(b.biologicalstatus))
      biologicalStatus.value = result
    })

    apiGetCountries(result => {
      result.sort((a, b) => a.countryName.localeCompare(b.countryName))
      countries.value = result.filter(c => c.count > 0)
    })
  })
</script>
