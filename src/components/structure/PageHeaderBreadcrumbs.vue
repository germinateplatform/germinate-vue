<template>
  <div class="d-flex flex-row justify-start flex-wrap align-center">
    <v-breadcrumbs :items="internalItems" class="my-0">
      <template #prepend v-if="icon">
        <v-icon :icon="icon" color="primary" :class="iconRotate ? `mdi-rotate-${iconRotate}` : undefined" start />
      </template>
      <template #title="{ item }">
        <span class="text-headline-medium">{{ item.title }}</span>
      </template>
      <template #divider>
        <span class="text-headline-medium">{{ divider }}</span>
      </template>
    </v-breadcrumbs>
    <slot name="append" />
  </div>
</template>

<script lang="ts" setup>
  import type { InternalBreadcrumbItem } from 'vuetify/lib/components/VBreadcrumbs/VBreadcrumbs.mjs'

  const compProps = withDefaults(defineProps<{
    items: (string | InternalBreadcrumbItem)[]
    icon: string
    divider?: string
    iconRotate?: 90 | 180 | 270
  }>(), {
    divider: '/',
  })

  const internalItems = computed(() => {
    if (compProps.items) {
      return compProps.items.map((item, index) => {
        if (typeof item === 'string') {
          return { title: item, disabled: false }
        } else {
          return { ...item, disabled: false, href: (index === compProps.items.length - 1) ? undefined : item.href, to: (index === compProps.items.length - 1) ? undefined : item.to }
        }
      })
    } else {
      return []
    }
  })
</script>
