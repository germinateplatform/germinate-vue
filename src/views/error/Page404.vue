<template>
  <div class="flex-row align-items-center page404">
    <div class="container">
      <b-row class="justify-content-center mt-4">
        <b-col md=2 />
        <b-col md=8 class="text-center">
          <b-img-lazy class="image-404" src="img/404.svg" alt="404" title="Image from https://undraw.co/" />

          <b-row class="mt-3">
            <b-col cols=5>
              <h1 class="display-3 text-right">404</h1>
            </b-col>
            <b-col cols=7 class="text-left">
              <h4 class="pt-3">{{ $t('page404Title') }}</h4>
              <p class="text-muted">{{ $t('page404Text') }}</p>
            </b-col>
          </b-row>
        </b-col>
        <b-col md=2 />
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
.image-404 {
  width: 80%;
  height: auto;
}
</style>
