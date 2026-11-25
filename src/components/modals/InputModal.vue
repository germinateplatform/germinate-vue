<template>
  <v-dialog v-model="dialog" max-width="min(90vw, 600px)">
    <v-card :title="title">
      <v-card-text>
        <v-text-field
          v-model="text"
          :persistent-hint="$attrs?.hint !== undefined"
          v-bind="$attrs"
          v-if="type === 'text'"
        >
          <template #append-inner>
            <v-icon :icon="mdiClipboard" v-tooltip:top="$t('tooltipCopyToClipboard')" v-if="copy" @click="copyToClipboard" />
          </template>
        </v-text-field>
        <v-textarea
          v-model="text"
          :persistent-hint="$attrs?.hint !== undefined"
          v-bind="$attrs"
          v-else
        >
          <template #append-inner>
            <v-icon :icon="mdiClipboard" v-tooltip:top="$t('tooltipCopyToClipboard')" v-if="copy" @click="copyToClipboard" />
          </template>
        </v-textarea>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="flat" @click="hide" v-if="showCancel">{{ $t('buttonCancel') }}</v-btn>
        <v-btn color="success" variant="flat" @click="save">{{ okText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { mdiClipboard } from '@mdi/js'
  import emitter from 'tiny-emitter/instance'

  const { t } = useI18n()

  const compProps = withDefaults(defineProps<{
    title: string
    copy?: boolean
    type?: 'textarea' | 'text'
    okText?: string
    showCancel?: boolean
    onSave?: () => Promise<boolean>
  }>(), {
    type: 'text',
    showCancel: false,
  })

  const dialog = ref(false)
  const text = defineModel<string>({
    default: '',
  })

  const okText = computed(() => t(compProps.okText ?? 'buttonClose'))

  function copyToClipboard () {
    navigator.clipboard.writeText(text.value)

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
  function save () {
    if (compProps.onSave) {
      compProps.onSave()
        .then(close => {
          if (close) {
            dialog.value = false
          }
        })
    } else {
      dialog.value = false
    }
  }

  defineExpose({
    show,
    hide,
  })
</script>

<style>
</style>
