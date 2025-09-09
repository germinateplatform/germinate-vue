<template>
  <v-card v-if="mcpd" :title="$t('pagePassportMcpdTitle')">
    <template #prepend>
      <v-icon icon="mdi-passport" color="primary" />
    </template>
    <template #append>
      <v-icon icon="mdi-help-circle" v-tooltip:top="'Multi-Crop Passport Descriptors'" />
    </template>
    <v-list>
      <v-list-item :title="$t('widgetMcpdPuid')" :subtitle="mcpd.puid || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdGid')" :subtitle="mcpd.accenumb || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdAccessionName')" :subtitle="mcpd.accename || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdAccessionNumber')" :subtitle="mcpd.accenumb || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdBiologicalStatus')" :subtitle="sampstat[mcpd.sampstat] || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdCollectingSource')" :subtitle="collsrc[mcpd.collsrc] || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdCollectingNumber')" :subtitle="mcpd.collnumb || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdGenus')" :subtitle="mcpd.genus" />
      <v-list-item :title="$t('widgetMcpdSpecies')" :subtitle="mcpd.species" />
      <v-list-item :title="$t('widgetMcpdCropName')" :subtitle="mcpd.cropname || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdSpeciesAuth')" :subtitle="mcpd.spauthor || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdSubtaxon')" :subtitle="mcpd.subtaxa || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdSubtaxonAuth')" :subtitle="mcpd.subtauthor || 'N/A'" />
      <v-list-item :title="$t('widgetMcpdCountry')" :subtitle="mcpd.origcty" v-if="mcpd.origcty">
        <template #subtitle>
          <i :class="'fi fi-' + getFlag(mcpd.origcty.toUpperCase())" /> {{ getCountry(mcpd.origcty.toUpperCase()) }}
        </template>
      </v-list-item>
      <v-list-item :title="$t('widgetMcpdColldate')" :subtitle="new Date(mcpd.colldate).toLocaleDateString()" v-if="mcpd.colldate" />
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
  import { apiGetGermplasmMcpd } from '@/plugins/api/germplasm'
  import type { ViewMcpd, ViewTableGermplasm } from '@/plugins/types/germinate'
  // @ts-ignore
  import * as countries from 'i18n-iso-countries'
  // @ts-ignore
  import countryDataEn from 'i18n-iso-countries/langs/en.json'
  countries.registerLocale(countryDataEn)

  const compProps = defineProps<{
    germplasm: ViewTableGermplasm
  }>()
  const mcpd = ref<ViewMcpd>()
  const sampstat: { [key: number]: string } = {
    100: 'Wild',
    110: 'Natural',
    120: 'Semi-natural/wild',
    130: 'Semi-natural/sown',
    200: 'Weedy',
    300: 'Traditional cultivar/landrace',
    400: 'Breeding/research materia',
    410: 'Breeder\'s line',
    411: 'Synthetic population',
    412: 'Hybrid',
    413: 'Founder stock/base population',
    414: 'Inbred line (parent of hybrid cultivar)',
    415: 'Segregating population',
    416: 'Clonal selection',
    420: 'Genetic stock',
    421: 'Mutant (e.g. induced/insertion mutants, tilling populations)',
    422: 'Cytogenetic stocks (e.g. chromosome addition/substitution, aneuploids, amphiploids)',
    423: 'Other genetic stocks (e.g. mapping populations)',
    500: 'Advanced or improved cultivar (conventional breeding methods)',
    600: 'GMO (by genetic engineering)',
    999: 'Other (Elaborate in REMARKS field)'
  }
  const collsrc: { [key: number]: string } = {
    10: 'Wild habitat',
    11: 'Forest or woodland',
    12: 'Shrubland',
    13: 'Grassland',
    14: 'Desert or tundra',
    15: 'Aquatic habitat',
    20: 'Farm or cultivated habitat',
    21: 'Field',
    22: 'Orchard',
    23: 'Backyard, kitchen or home garden (urban, peri-urban or rural)',
    24: 'Fallow land',
    25: 'Pasture',
    26: 'Farm store',
    27: 'Threshing floor',
    28: 'Park',
    30: 'Market or shop',
    40: 'Institute, Experimental station, Research organization, Genebank',
    50: 'Seed company',
    60: 'Weedy, disturbed or ruderal habitat',
    61: 'Roadside',
    62: 'Field margin',
    99: 'Other (Elaborate in REMARKS field)'
  }

  function getFlag (code3: string | undefined) {
    if (code3 && countries.alpha3ToAlpha2(code3)) {
      return countries.alpha3ToAlpha2(code3)?.toLowerCase()
    } else {
      return code3
    }
  }
  function getCountry (code3: string | undefined) {
    if (code3) {
      return countries.getName(code3, 'en')
    } else {
      return code3
    }
  }

  onMounted(() => {
    apiGetGermplasmMcpd<ViewMcpd>(compProps.germplasm.germplasmId, result => {
      mcpd.value = result
    })
  })
</script>
