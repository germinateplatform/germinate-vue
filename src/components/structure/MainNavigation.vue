<template>
  <v-navigation-drawer
    class="main-nav"
    color="#212121"
    permanent
    :width="navbarWidth"
    :rail="$vuetify.display.mdAndDown"
    :expand-on-hover="$vuetify.display.mdAndDown"
    @update:rail="e => { railVisible = !e }"
  >
    <v-list density="comfortable">
      <v-list-item
        class="crop-image"
        :prepend-avatar="`${store.storeBaseUrl}image/src-svg/crop.svg`"
        :title="logoVisible ? $t('germinateTitle') : undefined"
        :subtitle="logoVisible ? $t('pageFooterVersion', { version: germinateVersion }) : undefined"
      >
        <template #subtitle="{ subtitle }">
          <a class="text-white" href="#" @click.prevent="emitter.emit('show-changelog')">{{ subtitle }}</a>
        </template>
      </v-list-item>
      <v-list-item to="/" link prepend-icon="mdi-home">{{ $t('menuHome') }}</v-list-item>
      <v-list-item link :to="Pages.projects.path" prepend-icon="mdi-clipboard-list" v-if="Pages.isAvailable(Pages.projects)">{{ $t('menuProjects') }} <template #append><v-chip size="small">{{ `${(store.storeSelectedProjects && store.storeSelectedProjects.length > 0) ? (store.storeSelectedProjects.length + '/') : ''}${formatBadge('projects')}` }}</v-chip></template></v-list-item>

      <v-list-group value="data">
        <template #activator="{ props }">
          <v-list-item v-bind="props" link prepend-icon="mdi-harddisk">{{ $t('menuData') }}</v-list-item>
        </template>

        <v-list-item link :to="Pages.germplasm.path" prepend-icon="mdi-sprout" v-if="Pages.isAvailable(Pages.germplasm)">{{ $t('menuGermplasm') }} <template #append><v-chip size="small">{{ formatBadge('germplasm') }}</v-chip></template></v-list-item>
        <v-list-item link :to="Pages.taxonomies.path" prepend-icon="mdi-graph" v-if="Pages.isAvailable(Pages.taxonomies)">{{ $t('menuTaxonomies') }} <template #append><v-chip size="small">{{ formatBadge('taxonomies') }}</v-chip></template></v-list-item>

        <v-list-group value="trials">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link prepend-icon="mdi-tag-multiple">{{ $t('menuTrialsData') }}</v-list-item>
          </template>

          <v-list-item link :to="Pages.traits.path" prepend-icon="mdi-tag-text-outline" v-if="Pages.isAvailable(Pages.traits)">{{ $t('menuTrialsTraits') }} <template #append><v-chip size="small">{{ formatBadge('traits') }}</v-chip></template></v-list-item>
          <v-list-item link :to="Pages.getPath(Pages.export, 'trials')" prepend-icon="mdi-shovel" v-if="Pages.isAvailable(Pages.exportTraits)">{{ $t('menuTrialsDataExport') }} <template #append><v-chip size="small">{{ formatBadge('datasetsTrials') }}</v-chip></template></v-list-item>
        </v-list-group>

        <v-list-group value="genotypes">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link prepend-icon="mdi-dna">{{ $t('menuGenotypicData') }}</v-list-item>
          </template>

          <v-list-item link :to="Pages.markers.path" prepend-icon="mdi-format-indent-increase" v-if="Pages.isAvailable(Pages.markers)">{{ $t('menuGenotypicMarkers') }} <template #append><v-chip size="small">{{ formatBadge('markers') }}</v-chip></template></v-list-item>
          <v-list-item link :to="Pages.maps.path" prepend-icon="mdi-reorder-horizontal" v-if="Pages.isAvailable(Pages.maps)">{{ $t('menuGenotypicMaps') }} <template #append><v-chip size="small">{{ formatBadge('maps') }}</v-chip></template></v-list-item>
        </v-list-group>

        <v-list-group value="geography">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link prepend-icon="mdi-earth">{{ $t('menuGeography') }}</v-list-item>
          </template>

          <v-list-item link :to="Pages.locations.path" prepend-icon="mdi-map" v-if="Pages.isAvailable(Pages.locations)">{{ $t('menuLocations') }} <template #append><v-chip size="small">{{ formatBadge('locations') }}</v-chip></template></v-list-item>
          <v-list-item link :to="Pages.geographicSearch.path" prepend-icon="mdi-map-search" v-if="Pages.isAvailable(Pages.geographicSearch)">{{ $t('menuGeographicSearch') }}</v-list-item>
        </v-list-group>

        <v-list-group value="climate">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link prepend-icon="mdi-weather-snowy-rainy">{{ $t('menuClimateData') }}</v-list-item>
          </template>

          <v-list-item link :to="Pages.climates.path" prepend-icon="mdi-weather-snowy-rainy" v-if="Pages.isAvailable(Pages.climates)">{{ $t('menuClimateClimates') }} <template #append><v-chip size="small">{{ formatBadge('climates') }}</v-chip></template></v-list-item>
        </v-list-group>

        <v-list-item link :to="Pages.datasets.path" prepend-icon="mdi-database" v-if="Pages.isAvailable(Pages.datasets)">{{ $t('menuDatasets') }} <template #append><v-chip size="small">{{ formatBadge('datasets') }}</v-chip></template></v-list-item>
        <v-list-item link :to="Pages.experiments.path" prepend-icon="mdi-folder-table" v-if="Pages.isAvailable(Pages.experiments)">{{ $t('menuExperiments') }} <template #append><v-chip size="small">{{ formatBadge('experiments') }}</v-chip></template></v-list-item>
        <v-list-item link :to="Pages.dataResources.path" prepend-icon="mdi-file-download" v-if="Pages.isAvailable(Pages.dataResources)">{{ $t('menuDataResources') }} <template #append><v-chip size="small">{{ formatBadge('fileresources') }}</v-chip></template></v-list-item>
        <v-list-item link prepend-icon="mdi-book-open-page-variant" v-if="Pages.isAvailable(Pages.stories)">{{ $t('menuDataStories') }}</v-list-item>
        <v-list-item link :to="Pages.statistics.path" prepend-icon="mdi-chart-areaspline" v-if="Pages.isAvailable(Pages.statistics)">{{ $t('menuDataStatistics') }}</v-list-item>
      </v-list-group>

      <v-list-item link :to="Pages.images.path" prepend-icon="mdi-image-multiple" v-if="Pages.isAvailable(Pages.images)">{{ $t('menuImages') }} <template #append><v-chip size="small">{{ formatBadge('images') }}</v-chip></template></v-list-item>
      <v-list-item link :to="Pages.groups.path" prepend-icon="mdi-group" v-if="Pages.isAvailable(Pages.groups)">{{ $t('menuGroups') }} <template #append><v-chip size="small">{{ formatBadge('groups') }}</v-chip></template></v-list-item>

      <v-list-group value="about">
        <template #activator="{ props }">
          <v-list-item v-bind="props" link prepend-icon="mdi-information">{{ $t('menuAbout') }}</v-list-item>
        </template>

        <v-list-item link :to="Pages.aboutProject.path" prepend-icon="mdi-information-outline" v-if="Pages.isAvailable(Pages.aboutProject)">{{ $t('menuAboutProject') }}</v-list-item>
        <v-list-item link :to="Pages.aboutGerminate.path" prepend-icon="$germinate">{{ $t('menuAboutGerminate') }}</v-list-item>
        <v-list-item link :to="Pages.aboutExportFormats.path" prepend-icon="mdi-application-brackets" v-if="Pages.isAvailable(Pages.aboutExportFormats)">{{ $t('menuAboutExportFormat') }}</v-list-item>
      </v-list-group>

      <v-list-item class="pa-5" v-if="logoVisible">
        <v-img :src="store.storeBaseUrl + 'image/src-svg/logo.svg'" alt="Project logo" />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { coreStore } from '@/stores/app'
  import { Pages } from '@/plugins/pages'
  import { apiGetOverviewStats } from '@/plugins/api/stats'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { germinateVersion } from '@/plugins/util'
  import { useDisplay } from 'vuetify'
  import type { OverviewStats } from '@/plugins/types/OverviewStats'

  import emitter from 'tiny-emitter/instance'

  const { name, lgAndUp } = useDisplay()
  const store = coreStore()
  const railVisible = ref()

  const badgeCounts = ref<OverviewStats>()

  function formatBadge (key: string) {
    let value = null

    if (badgeCounts.value && badgeCounts.value[key]) {
      value = badgeCounts.value[key]
    }

    if (value === undefined || value === null) {
      return '0'
    } else {
      return getNumberWithSuffix(value, 1)
    }
  }

  const logoVisible = computed(() => {
    return railVisible.value || lgAndUp.value
  })

  const navbarWidth = computed(() => {
    switch (name.value) {
      case 'xs': return 250
      case 'sm':
      case 'md':
      case 'lg':
        return 300
      default:
        return 350
    }
  })

  onBeforeMount(() => updateStats())

  function updateStats () {
    apiGetOverviewStats<OverviewStats>((result: OverviewStats) => {
      badgeCounts.value = result
    })
  }

  onMounted(() => emitter.on('update-sidebar-menu', updateStats))
  onBeforeUnmount(() => emitter.off('update-sidebar-menu', updateStats))
</script>

<style>
/* Hide empty groups due to hidden pagess */
.main-nav .v-list-group--prepend:has(> .v-list-group__items:empty) {
  display: none;
}

.main-nav .v-list-group__items .v-list-item {
  padding-inline-start: calc(0px + var(--indent-padding)) !important;
}

.crop-image .v-avatar {
  border-radius: 0;
}
</style>
