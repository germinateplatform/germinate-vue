<template>
  <div>
    <v-dialog v-model="dialog" max-width="400">
      <v-card :title="$t('modalTitleFileResource')">
        <v-card-text>
          <v-form @submit.prevent>
            <v-select
              v-model="selectedFileresourceType"
              :items="fileresourceTypes"
              :label="$t('formLabelFileResourceType')"
              required
              prepend-inner-icon="mdi-tag"
              return-object
              append-icon="mdi-plus"
              @click:append="fileresourceTypeModal?.show()"
              :item-title="(r: Fileresourcetypes) => r.name + (r.description ? (' - ' + r.description) : '')"
            />

            <v-text-field
              v-model="name"
              :label="$t('formLabelFileResourceName')"
              prepend-inner-icon="mdi-form-textbox"
              required
            />

            <v-textarea
              v-model="description"
              :label="$t('formLabelFileResourceDescription')"
              prepend-inner-icon="mdi-form-textarea"
            />

            <v-file-input
              v-model="file"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              :label="$t('formLabelFileResourceFile')"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn :text="$t('buttonCancel')" @click="hide" />
          <v-btn :disabled="!formValid" color="success" variant="flat" @click="onSubmit">{{ $t('buttonUpload') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AddFileresourceTypeModal ref="fileresourceTypeModal" @type-added="(typeId: number) => updateTypes(typeId)" />
  </div>
</template>

<script setup lang="ts">
  import { apiGetFileResourceTypes, apiPostFileresourceFile, apiPutFileresource } from '@/plugins/api/dataset'
  import type { Fileresourcetypes } from '@/plugins/types/germinate'
  import { isAnyMissing } from '@/plugins/util/formatting'
  import AddFileresourceTypeModal from '@/components/modals/AddFileresourceTypeModal.vue'

  import emitter from 'tiny-emitter/instance'

  const emit = defineEmits(['fileresource-added'])

  const dialog = ref(false)

  const fileresourceTypeModal = useTemplateRef('fileresourceTypeModal')

  const name = ref<string>()
  const description = ref<string>()
  const file = ref<File>()
  const selectedFileresourceType = ref<Fileresourcetypes>()
  const selectedDatasetIds = ref<number[]>([])

  const fileresourceTypes = ref<Fileresourcetypes[]>()

  const formValid = computed(() => {
    if (isAnyMissing(name.value) || !file.value || !selectedFileresourceType.value) {
      return false
    }

    return true
  })

  function show () {
    dialog.value = true
  }
  function hide () {
    file.value = undefined
    name.value = undefined
    description.value = undefined
    selectedDatasetIds.value = []
    selectedFileresourceType.value = undefined

    dialog.value = false
  }

  function updateTypes (toSelect?: number) {
    apiGetFileResourceTypes((result: Fileresourcetypes[]) => {
      if (result && result.length > 0) {
        fileresourceTypes.value = result

        if (toSelect) {
          selectedFileresourceType.value = result.find(fr => fr.id === toSelect)
        } else {
          selectedFileresourceType.value = result[0]
        }
      }
    })
  }

  function onSubmit () {
    if (!file.value) {
      return
    }

    const formData = new FormData()
    formData.append('file', file.value)

    emitter.emit('show-loading', true)
    apiPostFileresourceFile(formData, (result: string) => {
      if (result) {
        apiPutFileresource({
          fileresourceName: name.value || 'N/A',
          fileresourcePath: result,
          fileresourceDescription: description.value,
          fileresourcetypeId: selectedFileresourceType.value?.id || -1,
          datasetIds: selectedDatasetIds.value,
        }, () => {
          emit('fileresource-added')
          emitter.emit('show-loading', false)
          emitter.emit('update-sidebar-menu')
          hide()
        })
      }
    })
  }

  defineExpose({
    show,
    hide,
  })

  onMounted(() => updateTypes())
</script>
