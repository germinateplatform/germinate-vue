<template>
  <v-container fluid>
    <p v-html="$t('pageImagesText')" />

    <Images />
  </v-container>
</template>

<route lang="yaml">
name: images
</route>

<script setup lang="ts">
  import Images from '@/components/widgets/Images.vue'
</script>
