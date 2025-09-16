<template>
  <v-dialog v-model="dialog" scrollable max-width="min(800px, 50vw)">
    <v-card v-if="compProps.dataset && compProps.license">
      <template #title>
        <div class="d-flex justify-space-between align-center">
          {{ $t('modalTitleLicense') }}
          <v-menu v-if="store.storeUserIsDataCurator">
            <template #activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
            </template>

            <v-list>
              <v-list-item prepend-icon="mdi-delete" :title="$t('buttonLicenseRemoveFromDataset')" @click="onDelete" />
              <v-list-item prepend-icon="mdi-square-edit-outline" :title="$t('buttonEdit')" @click="onEdit" />
            </v-list>
          </v-menu>
        </div>
      </template>
      <v-card-text>
        <div v-html="licenseContent" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn prepend-icon="mdi-download" @click="download">{{ $t('buttonDownload') }}</v-btn>
        <!-- Close OR accept/decline -->
        <v-btn color="primary" variant="flat" v-if="compProps.isAccepted" @click="hide" prepend-icon="mdi-cancel">{{ $t('buttonClose') }}</v-btn>
        <template v-else>
          <v-btn color="error" variant="flat" @click="hide" prepend-icon="mdi-cancel">{{ $t('buttonDecline') }}</v-btn>
          <v-btn color="success" variant="flat" @click="accept" prepend-icon="mdi-check">{{ $t('buttonAccept') }}</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { apiGetAcceptLicense } from '@/plugins/api/dataset'
  import type { ViewTableDatasets, ViewTableLicenses } from '@/plugins/types/germinate'
  import { downloadBlob } from '@/plugins/util'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    dataset?: ViewTableDatasets
    license?: ViewTableLicenses
    isAccepted?: boolean
  }>()

  const emit = defineEmits(['delete-clicked', 'edit-clicked'])

  const store = coreStore()
  const dialog = ref(false)

  const licenseContent = computed(() => {
    if (compProps.license) {
      if (compProps.license.licenseContent) {
        return compProps.license.licenseContent[store.storeLocale] || compProps.license.licenseContent.en_GB
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  })

  function onDelete () {
    emit('delete-clicked')
    hide()
  }

  function onEdit () {
    emit('edit-clicked')
    hide()
  }

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  function accept () {
    if (compProps.license) {
      apiGetAcceptLicense(compProps.license.licenseId, () => {
        emitter.emit('license-accepted', compProps.license?.licenseId)

        hide()
      })
    }
  }

  function download () {
    downloadBlob({
      blob: new Blob([licenseContent.value || ''], { type: 'text/html' }),
      filename: compProps.license?.licenseName.replace(' ', '-') || '',
      extension: 'html',
    })
  }

  defineExpose({
    show,
    hide,
  })
</script>
