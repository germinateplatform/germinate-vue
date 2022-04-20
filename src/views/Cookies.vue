<template>
  <div>
    <h1 class="mt-3">{{ $t('pageCookiesTitle') }}</h1>
    <hr />
    <h2>{{ $t('pageCookiesTitleGerminate') }}</h2>
    <p>{{ $t('pageCookiesTextGerminate') }}</p>
    <dl class="row">
      <dt class="col-3 text-right">{{ $t('pageCookiesDescriptionTitleSession') }}</dt><dd class="col-9">{{ $t('pageCookiesDescriptionDataSession') }}</dd>
      <dt class="col-3 text-right">{{ $t('pageCookiesDescriptionTitleMarkedItems') }}</dt><dd class="col-9">{{ $t('pageCookiesDescriptionDataMarkedItems') }}</dd>
      <dt class="col-3 text-right">{{ $t('pageCookiesDescriptionTitleLocale') }}</dt><dd class="col-9">{{ $t('pageCookiesDescriptionDataLocale') }}</dd>
      <dt class="col-3 text-right">{{ $t('pageCookiesDescriptionTitleTableColumns') }}</dt><dd class="col-9">{{ $t('pageCookiesDescriptionDataTableColumns') }}</dd>
      <dt class="col-3 text-right">{{ $t('pageCookiesDescriptionTitleAsync') }}</dt><dd class="col-9">{{ $t('pageCookiesDescriptionDataAsync') }}</dd>
      <dt class="col-3 text-right">{{ $t('pageCookiesDescriptionTitleOther') }}</dt><dd class="col-9">{{ $t('pageCookiesDescriptionDataOther') }}</dd>
    </dl>
    <p>{{ $t('pageCookiesTextExplanationGerminate') }}</p>
    <template v-if="storeServerSettings && storeServerSettings.googleAnalyticsKey">
      <h2>{{ $t('pageCookiesTitleThirdParty') }}</h2>
      <p>{{ $t('pageCookiesTextThirdParty') }}</p>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'storeServerSettings'
    ])
  }
}
</script>

<style>
</style>
