<template>
  <div class="flex-row align-items-center page404">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6">
          <div class="clearfix">
            <h1 class="float-left display-3 mr-4">404</h1>
            <h4 class="pt-3">{{ $t('page404Title') }}</h4>
            <p class="text-muted">{{ $t('page404Text') }}</p>
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Page404'
}
</script>

<style scoped>
.page404 {
  display: flex;
  min-height: 400px;
}
</style>
