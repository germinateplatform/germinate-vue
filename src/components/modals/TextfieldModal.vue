<template>
  <v-dialog v-model="dialog" max-width="min(90vw, 600px)">
    <v-card :title="title">
      <v-card-text>
        <v-text-field
          :model-value="text"
          :label="label"
          :hint="hint"
          :persistent-hint="hint !== undefined"
          readonly
        >
          <template #append-inner>
            <v-icon icon="mdi-clipboard" v-tooltip:top="$t('tooltipCopyToClipboard')" v-if="copy" @click="copyToClipboard" />
          </template>
        </v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="success" variant="flat" @click="hide">{{ $t('buttonClose') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const compProps = defineProps<{
    title: string
    text: string
    label: string
    hint?: string
    copy?: boolean
  }>()

  const dialog = ref(false)

  function copyToClipboard () {
    navigator.clipboard.writeText(compProps.text)

    // Show toast
    emitter.emit('show-snackbar', {
      text: t('tooltipCopiedToClipboard'),
      color: 'success',
    })
  }

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  defineExpose({
    show,
    hide,
  })
</script>

<style>
</style>
