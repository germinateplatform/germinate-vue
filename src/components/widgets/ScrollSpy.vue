<template>
  <v-tabs
    :class="`passport-tabs-sticky g-no-gutters ${topGap ? 'passport-tabs-sticky-top-gap' : ''}`"
    v-model="activeHref"
    center-active
    bg-color="surface"
  >
    <template
      v-for="item in items"
      :key="`scroll-item-${item.href}`"
    >
      <v-tab
        v-if="item.tooltip"
        :color="item.href === activeHref ? 'primary' : undefined"
        :text="item.title ? t(item.title) : undefined"
        @click.prevent="scrollTo(item)"
        v-tooltip:top="t(item.tooltip)"
        :value="item.href"
      >
        <v-icon :icon="item.icon" />
      </v-tab>
      <v-tab
        v-else
        :color="item.href === activeHref ? 'primary' : undefined"
        :text="item.title ? t(item.title) : undefined"
        :prepend-icon="item.icon"
        @click.prevent="scrollTo(item)"
        :value="item.href"
      />
    </template>
  </v-tabs>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const activeHref = ref<string>()

  export interface ScrollItem {
    title?: string
    icon?: string
    href: string
    tooltip?: string
    click?: Function
  }

  function setActive (href: string) {
    activeHref.value = href
  }

  function scrollTo (item: ScrollItem) {
    if (item.click) {
      item.click()
    } else {
      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  defineProps<{
    items: ScrollItem[]
    topGap?: boolean
  }>()

  defineExpose({
    setActive,
  })
</script>

<style scoped>
.passport-tabs-sticky {
  top: 0px;
  position: sticky;
  z-index: 1;
}

.passport-tabs-sticky-top-gap {
  top: 64px;
}
</style>
