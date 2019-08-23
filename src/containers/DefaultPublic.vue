<template>
  <div class="app">
    <AppHeader fixed>
      <b-link class="navbar-brand" to="/">
        <img class="navbar-brand-full" src="/img/germinate.svg" width="150" height="32" alt="Germinate">
        <img class="navbar-brand-minimized" src="img/brand/sygnet.svg" width="30" height="30" alt="Germinate">
      </b-link>
      <b-navbar-nav class="ml-auto">
        <LocaleDropdown />
      </b-navbar-nav>
    </AppHeader>
    <div class="app-body">
      <main class="main">
        <div class="container-fluid">
          <router-view :key="$route.path"></router-view>
        </div>
      </main>
    </div>
    <TheFooter>
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
</style>
