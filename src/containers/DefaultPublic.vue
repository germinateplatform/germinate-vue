<template>
  <div class="app public">
    <AppHeader fixed>
      <b-link class="navbar-brand" to="/">
        <img class="navbar-brand-full" src="img/germinate-square.svg" width="58" height="58" alt="Germinate">
        <img class="navbar-brand-minimized" src="img/germinate-square.svg" width="58" height="58" alt="Germinate">
      </b-link>
      <b-navbar-nav class="ml-auto">
        <LocaleDropdown />
      </b-navbar-nav>
    </AppHeader>
    <div class="app-body">
      <main class="main ml-0">
        <div class="container-fluid mb-4">
          <div class="mb-3 d-flex align-items-center my-4">
            <b-img width="48" height="48" :src="`${baseUrl}image/src-svg/crop.svg`"></b-img>
            <h5 class="my-0 ml-3">{{ $t('germinateTitle') }}</h5>
          </div>
          <hr />
          <router-view :key="$route.path"></router-view>
        </div>
      </main>
    </div>
    <TheFooter style="margin-left: 0;">
      <!--footer-->
      <div class="ml-auto">
        <a href="https://ics.hutton.ac.uk/get-germinate">Germinate</a>
        <span class="ml-1">&copy; {{ new Date().getFullYear() }} The James Hutton Institute.</span>
      </div>
    </TheFooter>
  </div>
</template>

<script>
import { Header as AppHeader, Footer as TheFooter } from '@coreui/vue'
import LocaleDropdown from '@/components/dropdown/LocaleDropdown'

export default {
  name: 'DefaultContainer',
  components: {
    AppHeader,
    TheFooter,
    LocaleDropdown
  }
}
</script>

<style>
.app.public {
  background-image: linear-gradient(-65deg, #20a8d8, #f0f3f5, #f0f3f5);
}
</style>
