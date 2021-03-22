<template>
  <div>
    <h2 class="mdi-heading"><i class="mdi mdi-36px mdi-passport text-primary" /> <span> {{ $t('pagePassportMcpdTitle') }} </span> <small><i class="mdi mdi-18px mdi-help-circle" v-b-tooltip.hover.bottom title="Multi-Crop Passport Descriptors"/></small></h2>
    <dl class="row" v-if="germplasm">
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdPuid') }}</dt><dd class="col-9">{{ germplasm.puid }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdGid') }}</dt><dd class="col-9">{{ germplasm.accenumb }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdAccessionName') }}</dt><dd class="col-9">{{ germplasm.accename }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdAccessionNumber') }}</dt><dd class="col-9">{{ germplasm.accenumb }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdBiologicalStatus') }}</dt><dd class="col-9">{{ sampstat[germplasm.sampstat] }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdCollectingSource') }}</dt><dd class="col-9">{{ collsrc[germplasm.collsrc] }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdCollectingNumber') }}</dt><dd class="col-9">{{ germplasm.collnumb }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdInstitutionCode') }}</dt><dd class="col-9">{{ germplasm.instcode }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdCollectingInst') }}</dt><dd class="col-9">{{ germplasm.collinstaddress }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdGenus') }}</dt><dd class="col-9 font-italic">{{ germplasm.genus }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdSpecies') }}</dt><dd class="col-9 font-italic">{{ germplasm.species }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdCropName') }}</dt><dd class="col-9">{{ germplasm.cropname }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdSpeciesAuth') }}</dt><dd class="col-9">{{ germplasm.spauthor }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdSubtaxon') }}</dt><dd class="col-9">{{ germplasm.subtaxa }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdSubtaxonAuth') }}</dt><dd class="col-9">{{ germplasm.subtauthor }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdCountry') }}</dt><dd class="col-9"><template v-if="germplasm.origcty"><i :class="'flag-icon flag-icon-' + getFlag(germplasm.origcty.toUpperCase())" v-if="germplasm.origcty"/> {{ getCountry(germplasm.origcty.toUpperCase()) }}</template></dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('widgetMcpdColldate') }}</dt><dd class="col-9"><template v-if="germplasm.colldate">{{ germplasm.colldate | toDate }}</template></dd>
    </dl>
  </div>
</template>

<script>
const countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export default {
  props: {
    germplasm: {
      type: Object,
      default: function () {
        return null
      }
    }
  },
  data: function () {
    return {
      sampstat: {
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
        999: 'Other (Elaborate in REMARKS field)',
      },
      collsrc: {
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
    }
  },
  methods: {
    getFlag: function (code3) {
      if (code3 && countries.alpha3ToAlpha2(code3)) {
        return countries.alpha3ToAlpha2(code3).toLowerCase()
      } else {
        return code3
      }
    },
    getCountry: function (code3) {
      return countries.getName(code3, 'en')
    }
  }
}
</script>

<style>

</style>
