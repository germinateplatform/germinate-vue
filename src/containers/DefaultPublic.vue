<template>
  <div class="app public">
    <AppHeader fixed>
      <router-link class="navbar-brand" to="/">
        <img class="navbar-brand-full" src="img/germinate-square.svg" width="58" height="58" alt="Germinate logo">
        <img class="navbar-brand-minimized" src="img/germinate-square.svg" width="58" height="58" alt="Germinate logo">
      </router-link>
      <b-navbar-nav class="ml-auto">
        <LocaleDropdown />
      </b-navbar-nav>
    </AppHeader>
    <div class="app-body flex-column">
      <div class="container-fluid page-header">
        <div class="mb-3 d-flex align-items-center justify-content-center my-4">
          <b-img-lazy width="48" height="48" :src="`${baseUrl}image/src-svg/crop.svg`" alt="Crop logo" />
          <h5 class="my-0 ml-3">{{ $t('germinateTitle') }}</h5>
        </div>
        <hr class="mb-0"/>
      </div>
      <LoginBackground class="login-background"/>
      <main class="main ml-0">
        <div class="container-fluid mb-4">
          <router-view :key="$route.path"></router-view>
        </div>
      </main>
    </div>
    <TheFooter class="footer">
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
import LoginBackground from '@/components/util/LoginBackground'

export default {
  name: 'DefaultContainer',
  components: {
    AppHeader,
    TheFooter,
    LocaleDropdown,
    LoginBackground
  }
}
</script>

<style>
.login-background {
  left: 0;
  top: 0;
  position: absolute;
  z-index: 1;
  opacity: .4;
}
.main {
  z-index: 2;
  position: relative;
}
.footer {
  margin-left: 0;
  z-index: 2;
  position: relative;
}
.page-header {
  background: white;
  position: relative;
  z-index: 2;
}
</style>
