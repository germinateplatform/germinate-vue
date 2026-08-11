<template>
  <MainComponent v-if="loaded === true" />
  <v-responsive v-else>
    <v-app>
      <v-main class="mx-auto mt-10 d-flex justify-center align-center">
        <v-card max-width="800px" min-width="50vw" :loading="loaded === undefined">
          <template #loader="{ isActive }">
            <v-progress-linear
              :active="isActive"
              color="primary"
              height="4"
              indeterminate
            />
          </template>
          <v-img
            height="200px"
            class="ma-4 mt-8"
            src="/img/germinate-square-name.svg"
            contain
          />
          <v-skeleton-loader type="article">
            <v-list-item :title="$t('pageLoadingErrorTitle')" class="my-5" v-if="error">
              <template #subtitle>
                <p>{{ $t('pageLoadingErrorText') }}</p>
                <p class="text-error">{{ error }}</p>
              </template>
            </v-list-item>
            <v-list-item :title="$t('pageLoadingTitle')" class="my-5" v-else>
              <template #subtitle>
                <p>{{ $t('pageLoadingText') }}</p>
              </template>
            </v-list-item>
          </v-skeleton-loader>
        </v-card>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<script lang="ts">
  import { coreStore } from '@/stores/app'
  import { useTheme } from 'vuetify'
  import { apiGetSettings } from '@/plugins/api/setting'

  export default {
    setup () {
      // Composition
      const store = coreStore()
      const loaded = ref<boolean | undefined>()
      const error = ref<string | undefined>()
      const theme = useTheme()

      // Set base URL based on environment
      let baseUrl = './api/'
      if (import.meta.env.VITE_BASE_URL) {
        baseUrl = import.meta.env.VITE_BASE_URL
      }

      store.setBaseUrl(baseUrl)

      return {
        store,
        loaded,
        error,
        theme,
      }
    },
    beforeCreate () {
      apiGetSettings(result => {
        this.store.setServerSettings(result)
        this.loaded = true

        if (result.colorPrimary) {
          this.theme.themes.value.light.colors.primary = result.colorPrimary
          this.theme.themes.value.dark.colors.primary = result.colorPrimary
        }
      }, {
        codes: [],
        callback: (err: Error) => {
          console.log(err)
          this.loaded = false
          this.error = err.message
        },
      })
    },
  }
</script>

<style lang="scss">
@import "/node_modules/flag-icons/css/flag-icons.min.css";

ul:not([class]),
ul:not([class]) li:not([class]),
ol:not([class]),
ol:not([class]) li:not([class])
 {
  padding: revert;
}

p a, p a:visited,
table a:not(.v-btn, .v-chip), table a:not(.v-btn, .v-chip):visited,
footer a, footer a:visited,
#about-page a, #about-page a:visited,
/* .v-card-title a, .v-card-title a:visited, */
.v-card-text a:not(.v-chip), .v-card-text a:not(.v-chip):visited,
.scale-heading a, .scale-heading a:visited,
.v-messages a, .v-messages a:visited,
.v-list-item a, .v-list-item a:visited,
a.table-icon-link, a.table-icon-link:visited,
.v-card-text ul a, .v-card-text ul a:visited,
form a, form a:visited {
  color: rgb(var(--v-theme-primary));
}
// #async-status-bar a, #async-status-bar a:visited {
//   color: inherit;
// }
.text-inherit {
  color: inherit !important;
}
.text-unset {
  color: unset !important;
}
a:not(:hover) {
  text-decoration: none;
}

.table-icon-link:hover {
  text-decoration: none;
}

p {
  margin-bottom: 0.5rem;
}

.pe-none .v-badge__badge {
  pointer-events: none;
}

.flex-unset {
  flex: unset;
}

.text-white-important {
  color: white !important;
}

.card-icon-avatar .v-avatar--variant-elevated, .card-icon-avatar .v-avatar--variant-flat {
  background: unset;
}

.mdi-rotate-90 {
  transform: rotate(90deg);
}

.v-window {
  overflow: unset !important;
}

.g-no-gutters {
  margin-left: -16px;
  margin-right: -16px;
}

.g-trim-rows-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
}

.g-trim-rows-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3; /* number of lines to show */
  -webkit-box-orient: vertical;
}

.g-trim-rows-4 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4; /* number of lines to show */
  -webkit-box-orient: vertical;
}

.g-trim-rows-5 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 5;
  -webkit-line-clamp: 5; /* number of lines to show */
  -webkit-box-orient: vertical;
}

svg.g-svg {
  color: rgb(var(--v-theme-primary));
}

.plotly > .svg-container {
  margin-left: auto !important;
  margin-right: auto !important;
}

.text-wrap .v-card-subtitle,
.text-wrap .v-list-item-subtitle {
  text-wrap: wrap;
  line-clamp: unset;
  -webkit-line-clamp: unset;
}

.v-theme--dark .leaflet-control-layers {
  box-shadow: 0 1px 5px #00000066;
  background-image: none;
  background-color: #181a1b;
  color: white;
}

.v-theme--dark .leaflet-draw,
.v-theme--dark .leaflet-control-zoom-in,
.v-theme--dark .leaflet-control-zoom-out,
.v-theme--dark .leaflet-control-attribution {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}
</style>
