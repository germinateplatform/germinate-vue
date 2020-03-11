<template>
  <div class="flex-row align-items-center page403">
    <div class="container">
      <b-row class="justify-content-center mt-4">
        <b-col md=2 />
        <b-col md=8 class="text-center">
          <img class="image-403" src="img/403.svg" alt="403" title="Image from https://undraw.co/">

          <b-row class="mt-3">
            <b-col cols=5>
              <h1 class="display-3 text-right">403</h1>
            </b-col>
            <b-col cols=7 class="text-left">
              <h4 class="pt-3">{{ $t('page403Title') }}</h4>
              <p class="text-muted">{{ $t('page403Text') }}</p>
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
  name: 'Page403'
}
</script>

<style scoped>
.page403 {
  display: flex;
  min-height: 400px;
}
.image-403 {
  width: 80%;
  height: auto;
}
</style>
