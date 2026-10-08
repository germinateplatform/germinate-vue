<template>
  <v-container fluid>
    <PageHeaderBreadcrumbs :items="[$t('pageImagesTitle')]" :icon="mdiImageMultiple" />
    <v-divider class="mb-3" />
    <p v-html="$t('pageImagesText')" />

    <Images />
  </v-container>
</template>

<route lang="yaml">
name: images
</route>

<script setup lang="ts">
  import Images from '@/components/widgets/Images.vue'
  import { mdiImageMultiple } from '@mdi/js'
</script>
