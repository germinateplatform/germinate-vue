<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-toolbar dark dense flat>
        <v-toolbar-title class="white--text">{{ internalTitle }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!internalMessage" class="pa-4"><span v-html="internalMessage" /></v-card-text>

      <v-checkbox v-if="internalNeedsConfirmation" v-model="internalConfirmed">{{ $t('modalConfirmMessageConfirm') }}</v-checkbox>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="grey" text @click="emitCancel" v-if="!internalOkOnly">{{ internalCancelTitle }}</v-btn>
        <v-btn :disabled="internalNeedsConfirmation && !internalConfirmed" :color="internalOkVariant" text @click="emitOk">{{ internalOkTitle }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const dialog = ref(false)
  const internalTitle = ref('')
  const internalMessage = ref('')
  const internalOkTitle = ref()
  const internalCancelTitle = ref()
  const internalCancelVariant = ref('secondary')
  const internalOkVariant = ref('primary')
  const internalOkOnly = ref(false)
  const internalNeedsConfirmation = ref(false)
  const internalConfirmed = ref(false)
  const callback = ref()

  function show (params: any) {
    internalTitle.value = params.title || ''
    internalMessage.value = params.message || ''
    internalOkTitle.value = params.okTitle || t('buttonOk')
    internalCancelTitle.value = params.cancelTitle || t('buttonCancel')
    internalOkVariant.value = params.okVariant || 'primary'
    internalCancelVariant.value = params.cancelVariant || 'secondary'
    internalOkOnly.value = params.okOnly || false
    callback.value = params.callback
    internalNeedsConfirmation.value = params.needsConfirmation || false
    internalConfirmed.value = false

    dialog.value = true
  }

  function hide () {
    dialog.value = false
  }

  function emitOk () {
    if (callback.value) {
      callback.value(true)
    }
    hide()
  }
  function emitCancel () {
    if (callback.value) {
      callback.value(false)
    }
    hide()
  }

  onBeforeMount(() => emitter.on('show-confirm', show))
  onBeforeUnmount(() => emitter.off('show-confirm', show))
</script>

<style>

</style>
