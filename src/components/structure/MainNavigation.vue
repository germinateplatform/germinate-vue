<template>
  <v-navigation-drawer
    class="main-nav"
    permanent
    theme="dark"
    :width="navbarWidth"
    :rail="$vuetify.display.mdAndDown || forcedRail"
    :expand-on-hover="$vuetify.display.mdAndDown || forcedRail"
    @update:rail="e => { railVisible = !e }"
  >
    <v-list density="comfortable" color="primary">
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
      <v-list-item to="/" link :prepend-icon="mdiHome" :title="$t('menuHome')" />
      <v-list-item link :active="isActive(Pages.projects.path)" :to="Pages.projects.path" :prepend-icon="mdiClipboardList" v-if="Pages.isAvailable(Pages.projects) && (badgeCounts?.projects || 0) > 0" :title="$t('menuProjects')"><template #append><v-chip size="small">{{ `${(store.storeSelectedProjects && store.storeSelectedProjects.length > 0) ? (store.storeSelectedProjects.length + '/') : ''}${formatBadge('projects')}` }}</v-chip></template></v-list-item>

      <v-list-group value="data">
        <template #activator="{ props }">
          <v-list-item v-bind="props" link :prepend-icon="mdiHarddisk" :title="$t('menuData')" />
        </template>

        <v-list-item link :active="isActive(Pages.germplasm.path)" :to="Pages.germplasm.path" :prepend-icon="mdiSprout" v-if="Pages.isAvailable(Pages.germplasm)" :title="$t('menuGermplasm')"><template #append><v-chip size="small">{{ formatBadge('germplasm') }}</v-chip></template></v-list-item>
        <v-list-item link :active="isActive(Pages.taxonomies.path)" :to="Pages.taxonomies.path" :prepend-icon="mdiLan" v-if="Pages.isAvailable(Pages.taxonomies)" :title="$t('menuTaxonomies')"><template #append><v-chip size="small">{{ formatBadge('taxonomies') }}</v-chip></template></v-list-item>

        <v-list-group value="pedigrees">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link :prepend-icon="mdiGraph" :title="$t('menuPedigreeData')" />
          </template>

          <v-list-item link :to="Pages.pedigrees.path" v-if="Pages.isAvailable(Pages.pedigrees)" :title="$t('menuPedigrees')">
            <template #prepend><v-icon :icon="mdiPeriodicTable" class="mdi-rotate-90" /></template>
            <template #append><v-chip size="small">{{ formatBadge('pedigreeDefinitions') }}</v-chip></template>
          </v-list-item>
          <v-list-item link :active="route.path === Pages.getPath(Pages.export, 'pedigree') || route.meta.navGroup === 'pedigree'" :to="Pages.getPath(Pages.export, 'pedigree')" :prepend-icon="mdiFamilyTree" v-if="Pages.isAvailable(Pages.exportPedigrees)" :title="$t('menuPedigreeDataExport')"><template #append><v-chip size="small">{{ formatBadge('datasetsPedigree') }}</v-chip></template></v-list-item>
        </v-list-group>

        <v-list-group value="trials">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link :prepend-icon="mdiTagMultiple" :title="$t('menuTrialsData')" />
          </template>

          <v-list-item link :to="Pages.trialsOverview.path" :prepend-icon="mdiLandFields" v-if="Pages.isAvailable(Pages.trialsOverview)" :title="$t('menuTrialsOverview')" />
          <v-list-item link :to="Pages.traits.path" :prepend-icon="mdiTagTextOutline" v-if="Pages.isAvailable(Pages.traits)" :title="$t('menuTrialsTraits')"><template #append><v-chip size="small">{{ formatBadge('traits') }}</v-chip></template></v-list-item>
          <v-list-item link :active="route.path === Pages.getPath(Pages.export, 'trials') || route.meta.navGroup === 'trials'" :to="Pages.getPath(Pages.export, 'trials')" :prepend-icon="mdiShovel" v-if="Pages.isAvailable(Pages.exportTraits)" :title="$t('menuTrialsDataExport')"><template #append><v-chip size="small">{{ formatBadge('datasetsTrials') }}</v-chip></template></v-list-item>
        </v-list-group>

        <v-list-group value="genotypes">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link :prepend-icon="mdiDna" :title="$t('menuGenotypicData')" />
          </template>

          <v-list-item link :to="Pages.genotypeOverview.path" :prepend-icon="mdiViewDashboard" v-if="Pages.isAvailable(Pages.genotypeOverview)" :title="$t('menuGenotypicOverview')" />
          <v-list-item link :to="Pages.markers.path" :prepend-icon="mdiFormatIndentIncrease" v-if="Pages.isAvailable(Pages.markers)" :title="$t('menuGenotypicMarkers')"><template #append><v-chip size="small">{{ formatBadge('markers') }}</v-chip></template></v-list-item>
          <v-list-item link :to="Pages.maps.path" :prepend-icon="mdiReorderHorizontal" v-if="Pages.isAvailable(Pages.maps)" :title="$t('menuGenotypicMaps')"><template #append><v-chip size="small">{{ formatBadge('maps') }}</v-chip></template></v-list-item>
          <v-list-item link :active="route.path === Pages.getPath(Pages.export, 'genotype') || route.meta.navGroup === 'genotype'" :to="Pages.getPath(Pages.export, 'genotype')" :prepend-icon="mdiDna" v-if="Pages.isAvailable(Pages.exportGenotypes)" :title="$t('menuGenotypicDataExport')"><template #append><v-chip size="small">{{ formatBadge('datasetsGenotype') }}</v-chip></template></v-list-item>
        </v-list-group>

        <v-list-group value="geography">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link :prepend-icon="mdiEarth" :title="$t('menuGeography')" />
          </template>

          <v-list-item link :to="Pages.locations.path" :prepend-icon="mdiMap" v-if="Pages.isAvailable(Pages.locations)" :title="$t('menuLocations')"><template #append><v-chip size="small">{{ formatBadge('locations') }}</v-chip></template></v-list-item>
          <v-list-item link :to="Pages.geographicSearch.path" :prepend-icon="mdiMapSearch" v-if="Pages.isAvailable(Pages.geographicSearch)" :title="$t('menuGeographicSearch')" />
        </v-list-group>

        <v-list-group value="climate">
          <template #activator="{ props }">
            <v-list-item v-bind="props" link :prepend-icon="mdiWeatherSnowyRainy" :title="$t('menuClimateData')" />
          </template>

          <v-list-item link :to="Pages.climateOverview.path" :prepend-icon="mdiEarth" v-if="Pages.isAvailable(Pages.climateOverview)" :title="$t('menuClimateOverview')" />
          <v-list-item link :to="Pages.climates.path" :prepend-icon="mdiWeatherSnowyRainy" v-if="Pages.isAvailable(Pages.climates)" :title="$t('menuClimateClimates')"><template #append><v-chip size="small">{{ formatBadge('climates') }}</v-chip></template></v-list-item>
          <v-list-item link :active="route.path === Pages.getPath(Pages.export, 'climate') || route.meta.navGroup === 'climate'" :to="Pages.getPath(Pages.export, 'climate')" :prepend-icon="mdiChartSankey" v-if="Pages.isAvailable(Pages.exportClimates)" :title="$t('menuClimateDataExport')"><template #append><v-chip size="small">{{ formatBadge('datasetsClimate') }}</v-chip></template></v-list-item>
        </v-list-group>

        <v-list-item link :to="Pages.datasets.path" :prepend-icon="mdiDatabase" v-if="Pages.isAvailable(Pages.datasets)" :title="$t('menuDatasets')"><template #append><v-chip size="small">{{ formatBadge('datasets') }}</v-chip></template></v-list-item>
        <v-list-item link :to="Pages.experiments.path" :prepend-icon="mdiFolderTable" v-if="Pages.isAvailable(Pages.experiments)" :title="$t('menuExperiments')"><template #append><v-chip size="small">{{ formatBadge('experiments') }}</v-chip></template></v-list-item>
        <v-list-item link :to="Pages.dataResources.path" :prepend-icon="mdiFileDownload" v-if="Pages.isAvailable(Pages.dataResources)" :title="$t('menuDataResources')"><template #append><v-chip size="small">{{ formatBadge('fileresources') }}</v-chip></template></v-list-item>
        <v-list-item link :prepend-icon="mdiBookOpenPageVariant" v-if="Pages.isAvailable(Pages.stories)" :title="$t('menuDataStories')" />
        <v-list-item link :to="Pages.statistics.path" :prepend-icon="mdiChartAreaspline" v-if="Pages.isAvailable(Pages.statistics)" :title="$t('menuDataStatistics')" />
      </v-list-group>

      <v-list-item link :to="Pages.images.path" :prepend-icon="mdiImageMultiple" v-if="Pages.isAvailable(Pages.images)" :title="$t('menuImages')"><template #append><v-chip size="small">{{ formatBadge('images') }}</v-chip></template></v-list-item>
      <v-list-item link :to="Pages.groups.path" :prepend-icon="mdiGroup" v-if="Pages.isAvailable(Pages.groups)" :title="$t('menuGroups')"><template #append><v-chip size="small">{{ formatBadge('groups') }}</v-chip></template></v-list-item>

      <v-list-group value="about">
        <template #activator="{ props }">
          <v-list-item v-bind="props" link :prepend-icon="mdiInformation" :title="$t('menuAbout')" />
        </template>

        <v-list-item link :to="Pages.aboutProject.path" :prepend-icon="mdiInformationOutline" v-if="Pages.isAvailable(Pages.aboutProject)" :title="$t('menuAboutProject')" />
        <v-list-item link :to="Pages.aboutGerminate.path" prepend-icon="$germinate" :title="$t('menuAboutGerminate')" />
        <v-list-item link :to="Pages.aboutExportFormats.path" :prepend-icon="mdiApplicationBrackets" v-if="Pages.isAvailable(Pages.aboutExportFormats)" :title="$t('menuAboutExportFormat')" />
      </v-list-group>

      <v-list-item class="pa-5" v-if="logoVisible">
        <v-img :src="store.storeBaseUrl + 'image/src-svg/logo.svg'" alt="Project logo" />
      </v-list-item>
    </v-list>

    <template #append v-if="$vuetify.display.lgAndUp">
      <v-list-item base-color="muted" active @click="forcedRail = !forcedRail" :prepend-icon="logoVisible ? undefined : forceRailIcon">
        <div class="d-flex justify-center align-center" v-if="logoVisible">
          <v-icon :icon="forceRailIcon" />
        </div>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { coreStore } from '@/stores/app'
  import { Pages } from '@/plugins/pages'
  import { apiGetOverviewStats } from '@/plugins/api/stats'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { germinateVersion } from '@/plugins/util'
  import { useDisplay } from 'vuetify'
  import type { OverviewStats, OverviewStatsField } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'
  import { mdiApplicationBrackets, mdiArrowCollapseLeft, mdiArrowCollapseRight, mdiBookOpenPageVariant, mdiChartAreaspline, mdiChartSankey, mdiClipboardList, mdiDatabase, mdiDna, mdiEarth, mdiFamilyTree, mdiFileDownload, mdiFolderTable, mdiFormatIndentIncrease, mdiGraph, mdiGroup, mdiHarddisk, mdiHome, mdiImageMultiple, mdiInformation, mdiInformationOutline, mdiLan, mdiLandFields, mdiMap, mdiMapSearch, mdiPeriodicTable, mdiReorderHorizontal, mdiShovel, mdiSprout, mdiTagMultiple, mdiTagTextOutline, mdiViewDashboard, mdiWeatherSnowyRainy } from '@mdi/js'

  const { name, lgAndUp } = useDisplay()
  const store = coreStore()
  const railVisible = ref()
  const forcedRail = ref(false)

  const badgeCounts = ref<OverviewStats>()

  const route = useRoute()

  function isActive (item: string) {
    return route.path === item || route.path.startsWith(item + '/')
  }

  function formatBadge (key: OverviewStatsField) {
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

  const forceRailIcon = computed(() => {
    return forcedRail.value ? mdiArrowCollapseRight : mdiArrowCollapseLeft
  })

  const logoVisible = computed(() => {
    if (forcedRail.value) {
      return railVisible.value
    } else {
      return lgAndUp.value || railVisible.value
    }
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
    apiGetOverviewStats(store.storeSelectedProjects, (result: OverviewStats) => {
      badgeCounts.value = result
    })
  }

  watch(() => store.storeSelectedProjects, async () => updateStats())

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
