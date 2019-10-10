<template>
  <div>
    <h1>Search</h1>
    <b-row>
      <b-col xs=12 sm=6>
        <b-form-group
          label="Select the type of data to search for"
          label-for="search-type">
          <b-input-group>
            <b-form-select id="search-type" :options="searchTypes" v-model="searchType" />
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col xs=12 sm=6>
        <b-form-group
          label="Enter a search term"
          label-for="search-term">
          <b-input-group>
            <b-input-group-prepend>
              <b-dropdown :text="comparators[comparator].text()" class="overflow-dropdown">
                <b-dropdown-item v-for="(value, name) in comparators"
                                :key="'search-comparator-' + name"
                                @click="comparator = name">
                  {{ value.text() }}
                </b-dropdown-item>
              </b-dropdown>
            </b-input-group-prepend>
            <b-form-input id="search-term" v-model="searchTerm" trim />
            <b-input-group-append>
              <b-button variant="primary" @click="search"><i class="mdi mdi-18px mdi-magnify" /></b-button>
            </b-input-group-append>

            <b-tooltip target="search-term" triggers="hover" v-if="comparator === 'like'">
              Use "%" as a wildcard character, e.g. "%KINGDOM%".
            </b-tooltip>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      searchTerm: null,
      comparator: 'equals',
      comparators: {
        equals: {
          text: () => this.$t('comparatorsEqual')
        },
        like: {
          text: () => this.$t('comparatorsLike')
        },
        inSet: {
          text: () => this.$t('comparatorsInSet')
        }
      },
      searchType: 'all',
      searchTypes: [
        { value: 'all', text: 'All data' },
        { value: 'germplasm', text: 'Germplasm data' }
      ]
    }
  },
  methods: {
    search: function () {
      console.log(this.searchTerm)
    }
  },
  mounted: function () {
    this.searchTerm = this.$route.params.searchTerm
  }
}
</script>

<style>

</style>
