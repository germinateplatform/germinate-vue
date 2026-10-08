<template>
  <div class="d-flex flex-row justify-start flex-wrap align-center">
    <v-breadcrumbs v-if="items.length > 0" :items="items" class="my-0">
      <template #prepend v-if="items[0].icon">
        <v-icon :icon="items[0].icon" color="primary" :class="items[0].iconRotate ? `mdi-rotate-${items[0].iconRotate}` : undefined" start />
      </template>
      <template #item="{ index }">
        <v-breadcrumbs-item :to="items[index].to" :disabled="items[index].disabled">
          <span class="text-headline-medium">
            <!-- per-page-type override, e.g. #item.passport="{ item }" from the parent -->
            <slot :name="`item.${items[index].key}`" :item="items[index]">
              {{ items[index].title }}
            </slot>

            <!-- extra content only on the last element -->
            <slot v-if="items[index].isLast" name="last" :item="items[index]" />
          </span>
        </v-breadcrumbs-item>
      </template>
      <template #divider>
        <span class="text-headline-medium">/</span>
      </template>
    </v-breadcrumbs>
    <span id="breadcrumb-last" class="flex-grow-1 me-3" />
  </div>
  <v-divider class="mb-0 pb-0" />
</template>

<script setup lang="ts">
  import { useBreadcrumbs } from '@/plugins/composables/breadcrumbs'

  const items = useBreadcrumbs()
</script>
