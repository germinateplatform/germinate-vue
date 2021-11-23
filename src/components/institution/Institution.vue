<template>
  <div v-if="institution">
    <h2 class="mdi-heading"><i class="mdi mdi-36px mdi-city text-primary" /> <span> {{ $t('pagePassportInstitutionTitle') }} </span></h2>
    <dl class="row">
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionId') }}</dt><dd class="col-9">{{ institution.institutionId }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionName') }}</dt><dd class="col-9">{{ institution.institutionName }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionAcronym') }}</dt><dd class="col-9">{{ institution.institutionAcronym }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionCode') }}</dt><dd class="col-9">{{ institution.institutionCode }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionAddress') }}</dt><dd class="col-9">{{ institution.institutionAddress }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionEmail') }}</dt><dd class="col-9"><template v-if="institution.institutionEmail"><a :href="`mailto:${institution.institutionEmail}`">{{ institution.institutionEmail }}</a></template></dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionPhone') }}</dt><dd class="col-9">{{ institution.institutionPhone }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionContact') }}</dt><dd class="col-9">{{ institution.institutionContact }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionCountry') }}</dt><dd class="col-9"><template v-if="institution.countryCode"><i :class="'flag-icon flag-icon-' + institution.countryCode.toLowerCase()"/> {{ institution.countryName }}</template></dd>
      <dt class="col-3"></dt><dd class="col-9"><b-button @click.prevent="navigateToGermplasm(institution.institutionId)"><i class="mdi mdi-18px fix-alignment mdi-sprout"/> {{ $t('widgetGermplasmInstitutionViewButton') }}</b-button></dd>
    </dl>
  </div>
</template>

<script>
import miscApi from '@/mixins/api/misc.js'

export default {
  props: {
    institutionId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      institution: null
    }
  },
  watch: {
    institutionId: {
      immediate: true,
      handler: function (newValue) {
        // Get institution data based on the provided id
        const queryData = {
          filter: [{
            column: 'institutionId',
            comparator: 'equals',
            operator: 'and',
            values: [newValue]
          }]
        }
        this.apiPostInstitutionTable(queryData, result => {
          if (result && result.data && result.data.length > 0) {
            this.institution = result.data[0]
          }
        })
      }
    }
  },
  mixins: [ miscApi ],
  methods: {
    navigateToGermplasm: function (institutionId) {
      // Navigate to the germplasm overview page and filter based on institution
      const filter = [{
        column: 'institutionId',
        comparator: 'equals',
        operator: 'and',
        values: [institutionId]
      }]
      this.$router.push({ name: 'germplasm', query: {
        'germplasm-filter': JSON.stringify(filter)
      } })
    }
  }
}
</script>

<style>

</style>
