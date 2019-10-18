<template>
  <div>
    <h2 class="mdi-heading"><i class="mdi mdi-36px mdi-passport text-primary" /> <span> MCPD Data </span> <small><i class="mdi mdi-18px mdi-help-circle" v-b-tooltip.hover.bottom title="Multi-Crop Passport Descriptors"/></small></h2>
    <dl class="row" v-if="germplasm">
      <dt class="col-sm-3 text-right">GID</dt><dd class="col-sm-9">{{ germplasm.accenumb }}</dd>
      <dt class="col-sm-3 text-right">Accession name</dt><dd class="col-sm-9">{{ germplasm.accename }}</dd>
      <dt class="col-sm-3 text-right">Accession number</dt><dd class="col-sm-9">{{ germplasm.accenumb }}</dd>
      <dt class="col-sm-3 text-right">Collecting number</dt><dd class="col-sm-9">{{ germplasm.collnumb }}</dd>
      <dt class="col-sm-3 text-right">Institute code</dt><dd class="col-sm-9">{{ germplasm.instcode }}</dd>
      <dt class="col-sm-3 text-right">Collecting institute address</dt><dd class="col-sm-9">{{ germplasm.collinstaddress }}</dd>
      <dt class="col-sm-3 text-right">Genus</dt><dd class="col-sm-9 font-italic">{{ germplasm.genus }}</dd>
      <dt class="col-sm-3 text-right">Species</dt><dd class="col-sm-9 font-italic">{{ germplasm.species }}</dd>
      <dt class="col-sm-3 text-right">Common crop name</dt><dd class="col-sm-9">{{ germplasm.cropname }}</dd>
      <dt class="col-sm-3 text-right">Species authority</dt><dd class="col-sm-9">{{ germplasm.spauthor }}</dd>
      <dt class="col-sm-3 text-right">Subtaxon</dt><dd class="col-sm-9">{{ germplasm.subtaxa }}</dd>
      <dt class="col-sm-3 text-right">Subtaxon authority</dt><dd class="col-sm-9">{{ germplasm.subtauthor }}</dd>
      <dt class="col-sm-3 text-right">Country of origin</dt><dd class="col-sm-9"><template v-if="germplasm.origcty"><i :class="'flag-icon flag-icon-' + getFlag(germplasm.origcty.toUpperCase())" v-if="germplasm.origcty"/> {{ getCountry(germplasm.origcty.toUpperCase()) }}</template></dd>
      <dt class="col-sm-3 text-right">Collecting date of sample</dt><dd class="col-sm-9"><template v-if="germplasm.colldate">{{ germplasm.colldate | toDate }}</template></dd>
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
      return countries.alpha3ToAlpha2(code3).toLowerCase()
    },
    getCountry: function (code3) {
      return countries.getName(code3, 'en')
    }
  }
}
</script>

<style>

</style>
