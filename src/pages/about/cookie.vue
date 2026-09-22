<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageCookiesTitle') }}</h1>
    <v-divider class="mb-3" />
    <h3 class="text-headline-medium mb-3">{{ $t('pageCookiesTitleGerminate') }}</h3>
    <p v-html="$t('pageCookiesTextGerminate')" />

    <CookieBanner :sticky="false" :force="store.storeCoookiesAccepted !== undefined" />

    <v-data-table
      class="mt-5"
      :items="cookies"
      :items-per-page="cookies.length"
      hide-default-footer
    >
      <template #item.name="{ item }">
        <pre><code>{{ item.name }}</code></pre>
      </template>
      <template #item.essential="{ item }">
        <v-chip :prepend-icon="mdiTimelineCheck" label color="success" :text="$t('widgetCookieEssential')" v-if="item.essential" />
        <v-chip :prepend-icon="mdiTimelineOutline" label color="info" :text="$t('widgetCookieOptional')" v-else />
      </template>
      <template #item.storageType="{ item }">
        <v-chip :prepend-icon="mdiCookie" label color="success" :text="$t('widgetCookieCookie')" v-if="item.storageType === 'cookie'" />
        <v-chip :prepend-icon="mdiMonitorArrowDown" label color="info" :text="$t('widgetCookieLocalStorage')" v-else />
      </template>
      <template #item.duration="{ item }">
        <v-chip :prepend-icon="mdiLockClock" label color="success" :text="$t('widgetCookiePersistent')" v-if="item.duration === 'persistent'" />
        <v-chip :prepend-icon="mdiProgressClock" label color="info" :text="$t('widgetCookieSession')" v-else />
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
  import { coreStore } from '@/stores/app'
  import { mdiCookie, mdiLockClock, mdiMonitorArrowDown, mdiProgressClock, mdiTimelineCheck, mdiTimelineOutline } from '@mdi/js'
  import { useI18n } from 'vue-i18n'

  export interface Cookie {
    name: string
    essential: boolean
    storageType: 'cookie' | 'localStorage'
    provider: string
    purpose: string
    duration: 'persistent' | 'session'
  }

  const store = coreStore()
  const host = computed(() => window.location.origin)
  const { t } = useI18n()

  const cookies: ComputedRef<Cookie[]> = computed(() => {
    return [{
      name: 'token',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieToken'),
      duration: 'persistent',
    }, {
      name: 'token',
      essential: true,
      storageType: 'cookie',
      provider: host.value,
      purpose: t('widgetCookieToken'),
      duration: 'persistent',
    }, {
      name: 'baseUrl',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieBaseUrl'),
      duration: 'persistent',
    }, {
      name: 'serverSettings',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieServerSettings'),
      duration: 'persistent',
    }, {
      name: 'userStates',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieUserStates'),
      duration: 'persistent',
    }, {
      name: 'userStates.locale',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieLocale'),
      duration: 'persistent',
    }, {
      name: 'userStates.markedIds',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieMarkedIds'),
      duration: 'persistent',
    }, {
      name: 'userStates.cookiesAccepted',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieCookiesAccepted'),
      duration: 'persistent',
    }, {
      name: 'userStates.selectedProjects',
      essential: true,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieSelectedProjects'),
      duration: 'persistent',
    }, {
      name: 'userStates.theme',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieTheme'),
      duration: 'persistent',
    }, {
      name: 'userStates.systemTheme',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieSystemTheme'),
      duration: 'session',
    }, {
      name: 'userStates.mapLayer',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieMapLayer'),
      duration: 'persistent',
    }, {
      name: 'userStates.hiddenColumns',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieHiddenColumns'),
      duration: 'persistent',
    }, {
      name: 'userStates.tableDisplayType',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieTableDisplayType'),
      duration: 'persistent',
    }, {
      name: 'userStates.customChartColors',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieCustomChartColors'),
      duration: 'persistent',
    }, {
      name: 'userStates.asyncJobUuids',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieAsyncJobUuids'),
      duration: 'session',
    }, {
      name: 'userStates.tablePerPage',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieTablePerPage'),
      duration: 'persistent',
    }, {
      name: 'userStates.changelogVersionNumber',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieChangelogVersionNumber'),
      duration: 'persistent',
    }, {
      name: 'userStates.activeStory',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieActiveStory'),
      duration: 'persistent',
    }, {
      name: 'deviceConfig',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieDeviceConfig'),
      duration: 'session',
    }, {
      name: 'uniqueClientId',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieUniqueClientId'),
      duration: 'persistent',
    }, {
      name: 'runCount',
      essential: false,
      storageType: 'localStorage',
      provider: host.value,
      purpose: t('widgetCookieRunCount'),
      duration: 'persistent',
    }]
  })
</script>
