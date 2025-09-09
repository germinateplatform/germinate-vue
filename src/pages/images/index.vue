<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageImagesTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageImagesText')" />

    <Images />
  </v-container>
</template>

<script setup lang="ts">
  import Images from '@/components/widgets/Images.vue'
</script>
