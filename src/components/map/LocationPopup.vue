<template>
  <v-list slim v-if="location">
    <slot name="prepend" />
    <v-list-item :title="$t('tableColumnLocationName')" :prepend-icon="mdiTag">
      <template #subtitle>
        <div class="g-trim-rows-3">
          <template v-if="showLinks">
            <span v-if="location.locationType === 'datasets' || !location.locationId">{{ location.locationName }}</span>
            <router-link :to="Pages.germplasm.path" v-else-if="location.locationType === 'collectingsites'" @click.prevent="navigateToLocation" event="">{{ location.locationName }}</router-link>
            <span v-else>{{ location.locationName }}</span>
          </template>
          <span v-else v-html="location.locationName" />
        </div>
      </template>
    </v-list-item>
    <v-list-item v-if="location.locationType" :title="$t('tableColumnLocationType')">
      <template #prepend>
        <v-icon :style="`color: ${locationTypes[location.locationType].color()};`" :icon="locationTypes[location.locationType].path" />
      </template>
      <template #subtitle>
        {{ locationTypes[location.locationType].text() }}
      </template>
    </v-list-item>
    <v-list-item v-if="location.countryCode2 || location.countryCode3" :title="$t('tableColumnCountryName')">
      <template #prepend>
        <v-icon opacity="1">
          <i :class="'fi fi-' + getFlag(location)" />
        </v-icon>
      </template>
      <template #subtitle>{{ getCountry(location) }}</template>
    </v-list-item>
    <v-list-item :title="$t('tableColumnLocationLatitude')" :subtitle="location.locationLatitude?.toFixed(2)" :prepend-icon="mdiLatitude" />
    <v-list-item :title="$t('tableColumnLocationLongitude')" :subtitle="location.locationLongitude?.toFixed(2)" :prepend-icon="mdiLongitude" />
    <v-list-item :title="$t('tableColumnLocationElevation')" :subtitle="location.locationElevation?.toFixed(2)" :prepend-icon="mdiAltimeter" v-if="location.locationElevation" />

    <template v-if="location.additionalInfo">
      <v-list-item
        v-for="(value, key) in location.additionalInfo"
        :key="`additional-info-${location.locationId}-${key}`"
        :title="key"
        :subtitle="value"
      />
    </template>
    <slot name="append" />

    <v-list-item
      v-if="store.storeUserIsDataCurator"
      @click="emit('edit')"
      :prepend-icon="mdiTooltipEdit"
      :title="$t('buttonEdit')"
      base-color="info"
    />
  </v-list>
</template>

<script setup lang="ts">
  import { Pages } from '@/plugins/pages'
  import type { ExtendedViewTableLocations } from '@/plugins/types/client'
  import { FilterComparator, FilterOperator, type FilterGroup } from '@/plugins/types/germinate'
  import { locationTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import { mdiAltimeter, mdiLatitude, mdiLongitude, mdiTag, mdiTooltipEdit } from '@mdi/js'

  // @ts-ignore
  import * as countries from 'i18n-iso-countries'
  // @ts-ignore
  import countryDataEn from 'i18n-iso-countries/langs/en.json'
  countries.registerLocale(countryDataEn)

  const router = useRouter()
  const store = coreStore()

  const compProps = defineProps<{
    location: ExtendedViewTableLocations
    showLinks: boolean
  }>()

  const emit = defineEmits(['edit'])

  function navigateToLocation () {
    // Navigate to the germplasm overview page and filter on location
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'locationId',
        comparator: FilterComparator.equals,
        values: [`${compProps.location.locationId}`],
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
