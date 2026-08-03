<template>
  <v-banner
    :sticky="sticky"
    :text="$t('widgetGdprNotificationText')"
    :icon="mdiCookieAlert"
    :class="sticky ? 'cookie-banner' : ''"
    v-if="force || (store.storeServerSettings?.showGdprNotification && store.storeCoookiesAccepted === undefined)"
  >
    <template #actions>
      <v-btn color="error" variant="tonal" :prepend-icon="mdiClose" :text="$t('widgetGdprNotificationButtonDecline')" v-tooltip:bottom="$t('tooltipGdprNotificationButtonReject')" @click="askForCookieConfirmation" />

      <v-btn class="ms-2" color="success" variant="flat" :prepend-icon="mdiCheck" :text="$t('widgetGdprNotificationButtonAccept')" @click="store.setCookiesAccepted(true)" />
    </template>
  </v-banner>
</template>

<script setup lang="ts">
  import { coreStore } from '@/stores/app'
  import { mdiCheck, mdiClose, mdiCookieAlert } from '@mdi/js'
  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  withDefaults(defineProps<{
    sticky?: boolean
    force?: boolean
  }>(), {
    sticky: false,
    force: false,
  })

  const store = coreStore()
  const { t } = useI18n()

  function askForCookieConfirmation () {
    emitter.emit('show-confirm', {
      title: t('modalTitleSure'),
      message: t('tooltipGdprNotificationButtonReject'),
      okTitle: t('widgetGdprNotificationButtonDecline'),
      cancelTitle: t('genericCancel'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          store.setCookiesAccepted(false)
        }
      },
    })
  }
</script>
