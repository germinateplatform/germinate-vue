<template>
  <div>
    <h2 class="mdi-heading"><i class="mdi mdi-36px mdi-passport text-primary" /> <span> {{ $t('pagePassportMcpdTitle') }} </span> <small><i class="mdi mdi-18px mdi-help-circle" v-b-tooltip.hover.bottom title="Multi-Crop Passport Descriptors"/></small></h2>
    <dl class="row" v-if="germplasm">
      <dt class="col-3 text-right">{{ $t('widgetMcpdGid') }}</dt><dd class="col-9">{{ germplasm.accenumb }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdAccessionName') }}</dt><dd class="col-9">{{ germplasm.accename }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdAccessionNumber') }}</dt><dd class="col-9">{{ germplasm.accenumb }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdCollectingNumber') }}</dt><dd class="col-9">{{ germplasm.collnumb }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdInstitutionCode') }}</dt><dd class="col-9">{{ germplasm.instcode }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdCollectingInst') }}</dt><dd class="col-9">{{ germplasm.collinstaddress }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdCollectingInst') }}</dt><dd class="col-9 font-italic">{{ germplasm.genus }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdSpecies') }}</dt><dd class="col-9 font-italic">{{ germplasm.species }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdCropName') }}</dt><dd class="col-9">{{ germplasm.cropname }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdSpeciesAuth') }}</dt><dd class="col-9">{{ germplasm.spauthor }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdSubtaxon') }}</dt><dd class="col-9">{{ germplasm.subtaxa }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdSubtaxonAuth') }}</dt><dd class="col-9">{{ germplasm.subtauthor }}</dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdCountry') }}</dt><dd class="col-9"><template v-if="germplasm.origcty"><i :class="'flag-icon flag-icon-' + getFlag(germplasm.origcty.toUpperCase())" v-if="germplasm.origcty"/> {{ getCountry(germplasm.origcty.toUpperCase()) }}</template></dd>
      <dt class="col-3 text-right">{{ $t('widgetMcpdColldate') }}</dt><dd class="col-9"><template v-if="germplasm.colldate">{{ germplasm.colldate | toDate }}</template></dd>
    </dl>
  </div>
</template>

<script>
var countries = require('i18n-iso-countries')
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
