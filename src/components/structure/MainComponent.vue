<template>
  <v-app>
    <v-main>
      <v-app-bar :extension-height="60" class="border-b border-primary border-opacity-100">
        <template #extension v-if="searchVisible">
          <v-container>
            <v-row justify="end">
              <v-col cols="12">
                <v-text-field
                  autofocus
                  name="name"
                  v-model="searchTerm"
                  :label="$t('inputPlaceholderSearch')"
                  density="compact"
                  type="search"
                  hide-details
                  single-line
                  append-inner-icon="mdi-magnify"
                  @keyup.exact.enter="runSearch"
                  @click:append-inner="runSearch"
                />
              </v-col>
            </v-row>
          </v-container>
        </template>

        <v-img
          class="ms-4"
          src="/img/germinate-square.svg"
          max-height="40"
          max-width="40"
          contain
        />

        <v-app-bar-title style="cursor: pointer" @click="$router.push('/')">
          <v-img
            src="/img/germinate-text.svg"
            max-height="30"
            max-width="140"
            contain
            v-if="smAndUp"
          />
        </v-app-bar-title>

        <v-spacer />

        <v-btn icon="mdi-magnify" @click="searchVisible = !searchVisible" v-if="showElements" />

        <v-badge class="pe-none" location="bottom left" color="info" :content="getNumberWithSuffix(store.storeSelectedProjects.length, 1)" :offset-x="10" :offset-y="10" v-if="showElements && store.storeSelectedProjects && store.storeSelectedProjects.length > 0">
          <v-btn :to="Pages.projects.path" icon="mdi-clipboard-list" />
        </v-badge>

        <v-menu v-if="showElements">
          <template #activator="{ props }">
            <v-badge class="pe-none" location="bottom left" color="info" :content="totalMarkedItemCount" :offset-x="10" :offset-y="10" v-if="totalMarkedItemCount">
              <v-btn v-bind="props" icon="mdi-bookmark-box-multiple" />
            </v-badge>
            <v-btn v-bind="props" icon="mdi-bookmark-box-multiple" v-else />
          </template>
          <v-list>
            <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('pageMarkedItemsTitle') }}</v-list-subheader>
            <v-list-item
              v-for="(details, itemType) in markedItemTypes"
              :key="`marked-item-${itemType}`"
              :to="Pages.getPath(Pages.markedItemType, itemType)"
            >
              <v-list-item-title>{{ details.text() }}</v-list-item-title>
              <template #prepend>
                <v-icon :color="details.color()" :icon="details.path" />
              </template>
              <template #append>
                <v-chip size="sm" class="ms-5 px-2">{{ getNumberWithSuffix(store.storeMarkedIds[itemType].length, 1) }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-translate" />
          </template>
          <v-list>
            <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('dropdownLocales') }}</v-list-subheader>
            <v-list-item
              @click="changeLocale(language.locale)"
              v-for="language in locales"
              :key="`locale-${language.flag}`"
              :value="language.locale"
            >
              <v-list-item-title>{{ language.name }}</v-list-item-title>
              <template #prepend>
                <span class="me-3">{{ language.flag }}</span>
              </template>
              <template #append>
                <v-icon v-if="language.locale === store.storeLocale">mdi-check</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-theme-light-dark</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('dropdownTheme') }}</v-list-subheader>
            <v-list-item prepend-icon="mdi-white-balance-sunny" :active="store.storeTheme === 'light'" @click="store.setTheme('light')" title="Light" />
            <v-list-item prepend-icon="mdi-weather-night" :active="store.storeTheme === 'dark'" @click="store.setTheme('dark')" title="Dark" />
            <v-list-item prepend-icon="mdi-desktop-tower-monitor" :active="store.storeTheme === 'system'" @click="store.setTheme('system')" title="System" />
          </v-list>
        </v-menu>

        <UserDropdown v-if="showElements" />

        <v-btn icon @click="emitter.emit('toggle-aside')">
          <v-badge location="bottom left" color="info" :offset-x="-2" :offset-y="-2" :content="store.storeAsyncJobUuids.length" v-if="store.storeAsyncJobUuids.length > 0">
            <v-icon icon="mdi-file-arrow-up-down" />
          </v-badge>
          <v-icon icon="mdi-file-arrow-up-down" v-else />
        </v-btn>
      </v-app-bar>

      <MainNavigation v-if="showElements" />
      <AsyncSidebar />

      <div class="h-100">
        <router-view :key="$route.path" class="h-100" />
      </div>

      <LoginModal ref="loginModal" />

      <ConfirmModal />

      <AppFooter />

      <v-bottom-sheet
        v-model="bottomSheetVisible"
        inset
        max-height="75vh"
      >
        <v-card>
          <template #text>
            <ChangelogInfo :prev-version="changelogVersionNumber" v-if="bottomSheetType === 'changelog'" />
          </template>
        </v-card>
      </v-bottom-sheet>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import MainNavigation from '@/components/structure/MainNavigation.vue'
  import AsyncSidebar from '@/components/structure/AsyncSidebar.vue'
  import ConfirmModal from '@/components/modals/ConfirmModal.vue'
  import AppFooter from '@/components/AppFooter.vue'

  import { apiGetLocales } from '@/plugins/api/misc'
  import { useDisplay, useTheme } from 'vuetify'
  import { coreStore } from '@/stores/app'
  import type { Locale } from '@/plugins/types/Locale'
  import { loadLanguageAsync } from '@/plugins/vuetify'
  import { markedItemTypes } from '@/plugins/util/types'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { Pages } from '@/plugins/pages'
  import LoginModal from '@/components/modals/LoginModal.vue'
  import UserDropdown from '@/components/structure/UserDropdown.vue'

  import emitter from 'tiny-emitter/instance'
  import ChangelogInfo from '@/components/widgets/ChangelogInfo.vue'
  import { germinateVersion } from '@/plugins/util'

  // Composition
  const router = useRouter()
  const theme = useTheme()
  const store = coreStore()
  const { smAndUp } = useDisplay()

  // Refs
  const systemTheme = ref<string>('dark')
  const locales = ref<Locale[]>([])
  const loginModal = useTemplateRef('loginModal')
  const bottomSheetVisible = ref(false)
  const bottomSheetType = ref<'changelog'>('changelog')
  const changelogVersionNumber = ref()
  const searchVisible = ref(false)
  const searchTerm = ref<string>()

  // Methods
  function changeLocale (locale: string) {
    store.setLocale(locale)
  }

  // Listen for theme changes in the store
  let media: MediaQueryList
  watch(() => store.storeTheme, (value: string) => {
    if (value === 'system') {
      // If currently system, get prefered scheme and listen to changes
      media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', onThemeChange)
      onThemeChange()
    } else if (media) {
      // Else, remove listener
      media.removeEventListener('change', onThemeChange)
    }
  }, { immediate: true })
  function onThemeChange () {
    systemTheme.value = media!.matches ? 'dark' : 'light'
  }
  // Listen for changes to the theme and update Vuetify global theme
  watchEffect(() => theme.change(store.storeTheme === 'system' ? systemTheme.value : store.storeTheme))

  // Listen for changes to store locale and update Vuetify current
  watchEffect(() => {
    loadLanguageAsync(store.storeLocale)
  })

  const showElements = computed(() => {
    return !(store.storeServerSettings && store.storeServerSettings.authMode === 'FULL' && !store.storeToken)
  })

  const totalMarkedItemCount: ComputedRef<string | undefined> = computed(() => {
    const value = Object.keys(markedItemTypes).map(it => store.storeMarkedIds[it].length).reduce((a, b) => a + b, 0)

    if (value) {
      return getNumberWithSuffix(value, 0)
    } else {
      return undefined
    }
  })

  apiGetLocales((result: Locale[]) => {
    locales.value = result
  })

  function runSearch () {
    router.push(Pages.getPath(Pages.searchQuery, searchTerm.value || ''))
    searchTerm.value = undefined
    searchVisible.value = false
  }

  function showLogin () {
    loginModal.value?.show()
  }

  function showChangelog (cv: string | undefined) {
    changelogVersionNumber.value = cv
    bottomSheetType.value = 'changelog'
    bottomSheetVisible.value = true
  }

  onBeforeMount(() => {
    loadLanguageAsync(store.storeLocale)

    emitter.on('show-login', showLogin)
    emitter.on('show-changelog', showChangelog)
  })
  onBeforeUnmount(() => {
    emitter.off('show-login', showLogin)
    emitter.off('show-changelog', showChangelog)
  })
  onMounted(() => {
    changelogVersionNumber.value = store.storeChangelogVersionNumber
    if (store.storeChangelogVersionNumber !== undefined && store.storeChangelogVersionNumber !== germinateVersion) {
      bottomSheetType.value = 'changelog'
      bottomSheetVisible.value = true
      store.setChangelogVersionNumber(germinateVersion)
    }
  })
</script>

<style>
body.print .v-overlay-container {
  display: none;
}
</style>
