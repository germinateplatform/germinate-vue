<template>
  <v-footer
    height="50"
    class="d-flex justify-space-between border-t border-primary border-opacity-100"
  >
    <div
      class="text-caption text-disabled"
    >
      &copy; {{ new Date().getFullYear() }} Germinate: The James Hutton Institute
    </div>
    <div>
      <a class="text-caption mx-2" v-if="$te('pageFooterImprintURL') && $t('pageFooterImprintURL')" :href="$t('pageFooterImprintURL')" target="_blank" rel="noopener noreferrer">{{ $t('pageFooterImprint') }}</a>
      <a class="text-caption mx-2" v-if="$te('pageFooterDataProtectionURL') && $t('pageFooterDataProtectionURL')" :href="$t('pageFooterDataProtectionURL')" target="_blank" rel="noopener noreferrer">{{ $t('pageFooterDataProtection') }}</a>
    </div>
    <div
      class="text-caption text-disabled"
    >
      <a
        v-for="item in items"
        :key="item.title"
        class="d-inline-block mx-2 social-link"
        :href="item.href"
        rel="noopener noreferrer"
        target="_blank"
        :title="item.title"
      >
        <v-icon
          :icon="item.icon"
          :size="item.icon === '$vuetify' ? 24 : 16"
        />
      </a>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  import { bskyIcon } from '@/plugins/util'

  const items = [
    {
      title: 'Germinate website',
      icon: 'mdi-web',
      href: 'https://ics.hutton.ac.uk/get-germinate',
    },
    {
      title: 'Germinate on Bluesky',
      icon: [bskyIcon],
      href: 'https://bsky.app/profile/germinate.hutton.ac.uk',
    },
    {
      title: 'Germinate on Twitter',
      icon: 'mdi-twitter',
      href: 'https://twitter.com/GerminateHub',
    },
    {
      title: 'Germinate on GitHub',
      icon: 'mdi-github',
      href: 'https://github.com/germinateplatform',
    },
  ]
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
</style>
