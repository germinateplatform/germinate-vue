<template>
  <div v-if="institution">
    <h2 class="mdi-heading"><span class="text-primary"><MdiIcon :path="mdiCity" /></span> <span> {{ $t('pagePassportInstitutionTitle') }} </span></h2>
    <dl class="row">
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionId') }}</dt><dd class="col-9">{{ institution.institutionId }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionName') }}</dt><dd class="col-9">{{ institution.institutionName }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionAcronym') }}</dt><dd class="col-9">{{ institution.institutionAcronym }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionCode') }}</dt><dd class="col-9">{{ institution.institutionCode }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionAddress') }}</dt><dd class="col-9">{{ institution.institutionAddress }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionEmail') }}</dt><dd class="col-9"><template v-if="institution.institutionEmail"><a :href="`mailto:${institution.institutionEmail}`">{{ institution.institutionEmail }}</a></template></dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionPhone') }}</dt><dd class="col-9">{{ institution.institutionPhone }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionContact') }}</dt><dd class="col-9">{{ institution.institutionContact }}</dd>
      <dt class="col-3 text-right text-break mb-2">{{ $t('tableColumnInstitutionCountry') }}</dt><dd class="col-9"><template v-if="institution.countryCode"><i :class="'fi fi-' + institution.countryCode.toLowerCase()"/> {{ institution.countryName }}</template></dd>
      <dt class="col-3"></dt><dd class="col-9"><b-button @click.prevent="navigateToGermplasm(institution.institutionId)"><MdiIcon :path="mdiSprout" /> {{ $t('widgetGermplasmInstitutionViewButton') }}</b-button></dd>
    </dl>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { apiPostInstitutionTable } from '@/mixins/api/misc.js'

import { mdiCity, mdiSprout } from '@mdi/js'
import { Pages } from '@/mixins/pages'

export default {
  components: {
    MdiIcon
  },
  props: {
    institutionId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      mdiCity,
      mdiSprout,
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
        apiPostInstitutionTable(queryData, result => {
          if (result && result.data && result.data.length > 0) {
            this.institution = result.data[0]
          }
        })
      }
    }
  },
  methods: {
    navigateToGermplasm: function (institutionId) {
      // Navigate to the germplasm overview page and filter based on institution
      const filter = [{
        column: 'institutionId',
        comparator: 'equals',
        operator: 'and',
        values: [institutionId]
      }]
      this.$router.push({
        name: Pages.germplasm,
        query: {
          'germplasm-filter': JSON.stringify(filter)
        }
      })
    }
  }
}
</script>

<style>

</style>
