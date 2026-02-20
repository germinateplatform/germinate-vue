<template>
  <v-list v-if="location">
    <slot name="prepend" />
    <v-list-item :title="$t('tableColumnLocationName')">
      <template #subtitle>
        <template v-if="showLinks">
          <span v-if="location.locationType === 'datasets' || !location.locationId">{{ location.locationName }}</span>
          <router-link :to="Pages.germplasm.path" v-else-if="location.locationType === 'collectingsites'" @click.prevent="navigateToGermplasm(location)" event="">{{ location.locationName }}</router-link>
          <span v-else>{{ location.locationName }}</span>
        </template>
        <span v-else v-html="location.locationName" />
      </template>
    </v-list-item>
    <v-list-item v-if="location.locationType" :title="$t('tableColumnLocationType')">
      <template #subtitle>
        <span :style="`color: ${locationTypes[location.locationType].color()};`"><v-icon :icon="locationTypes[location.locationType].path" /></span> {{ locationTypes[location.locationType].text() }}
      </template>
    </v-list-item>
    <v-list-item v-if="location.countryCode2 || location.countryCode3" :title="$t('tableColumnCountryName')">
      <template #subtitle>
        <i :class="'fi fi-' + getFlag(location)" /> {{ getCountry(location) }}
      </template>
    </v-list-item>
    <v-list-item :title="$t('tableColumnLocationLatitude')" :subtitle="location.locationLatitude?.toFixed(2)" />
    <v-list-item :title="$t('tableColumnLocationLongitude')" :subtitle="location.locationLongitude?.toFixed(2)" />
    <v-list-item :title="$t('tableColumnLocationElevation')" :subtitle="location.locationElevation?.toFixed(2)" v-if="location.locationElevation" />

    <template v-if="location.additionalInfo">
      <v-list-item
        v-for="(value, key) in location.additionalInfo"
        :key="`additional-info-${location.locationId}-${key}`"
        :title="key"
        :subtitle="value"
      />
    </template>
    <slot name="append" />
  </v-list>
</template>

<script setup lang="ts">
  import { Pages } from '@/plugins/pages'
  import type { ExtendedViewTableLocations } from '@/plugins/types/ExtendedViewTableLocations'
  import { FilterComparator, FilterOperator, type FilterGroup } from '@/plugins/types/germinate'
  import { locationTypes } from '@/plugins/util/types'

  // @ts-ignore
  import * as countries from 'i18n-iso-countries'
  // @ts-ignore
  import countryDataEn from 'i18n-iso-countries/langs/en.json'
  countries.registerLocale(countryDataEn)

  const router = useRouter()

  const compProps = defineProps<{
    location: ExtendedViewTableLocations
    showLinks: boolean
  }>()

  function navigateToGermplasm (location: ExtendedViewTableLocations) {
    // Navigate to the germplasm overview page and filter on location
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'locationId',
        comparator: FilterComparator.equals,
        values: [`${location.locationId}`],
      }],
      operator: FilterOperator.and,
    }]
    router.push({
      path: Pages.germplasm.path,
      query: {
        'germplasm-filter': JSON.stringify(filter),
      },
    })
  }

  function getFlag (country: ExtendedViewTableLocations) {
    if (country.countryCode2) {
      return country.countryCode2.toLowerCase()
    } else if (country.countryCode3) {
      return countries.alpha3ToAlpha2(country.countryCode3)?.toLowerCase()
    } else {
      return ''
    }
  }

  function getCountry (country: ExtendedViewTableLocations) {
    if (country.countryCode2) {
      return countries.getName(country.countryCode2.toUpperCase(), 'en')
    } else if (country.countryCode3) {
      return countries.getName(country.countryCode3.toUpperCase(), 'en')
    } else {
      return ''
    }
  }
</script>
