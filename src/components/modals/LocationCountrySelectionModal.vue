<template>
  <b-modal :title="$t('modalTitleLocationInformation')" @ok="handleOk" :ok-disabled="name === null || name.length < 1 || countryId === null" ref="modal">
    <p>{{ $t('modalTextLocationInformation') }}</p>
    <b-form @submit.prevent="handleOk">
      <b-form-group :label="$t('formLabelLocationCountrySelectionSiteName')" label-for="name">
        <b-form-input v-model="name" id="name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelLocationCountrySelectionElevation')" label-for="elevation">
        <b-form-input type="number" v-model.number="elevation" id="elevation" />
      </b-form-group>
      <b-form-group :label="$t('formLabelLocationCountrySelectionCountry')" label-for="country">
        <SearchableSelect :multiple="false" :options="countryOptions" v-model="countryId" id="country" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import SearchableSelect from '@/components/util/SearchableSelect'
import locationApi from '@/mixins/api/location.js'

export default {
  components: {
    SearchableSelect
  },
  data: function () {
    return {
      countries: [],
      name: null,
      countryId: -1,
      elevation: null
    }
  },
  computed: {
    countryOptions: function () {
      if (this.countries !== null && this.countries.length > 0) {
        return this.countries.map(c => {
          return {
            value: c.id,
            text: c.countryName
          }
        })
      } else {
        return null
      }
    }
  },
  mixins: [ locationApi ],
  methods: {
    handleOk: function () {
      this.$emit('selection-changed', {
        name: this.name,
        elevation: this.elevation,
        countryId: this.countryId
      })
    },
    show: function () {
      this.countryId = -1
      this.name = null
      this.elevation = null
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    }
  },
  mounted: function () {
    this.apiGetCountries(result => {
      this.countries = result
    })
  }
}
</script>

<style>

</style>
