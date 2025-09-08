<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card :title="$t('modalTitleFileResourceType')">
      <v-card-text>
        <v-form @submit.prevent>
          <v-text-field
            v-model="name"
            :label="$t('formLabelFileResourceTypeName')"
            prepend-inner-icon="mdi-form-textbox"
            required
          />

          <v-textarea
            v-model="description"
            :label="$t('formLabelFileResourceTypeDescription')"
            prepend-inner-icon="mdi-form-textarea"
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
</template>

<script setup lang="ts">
  import { apiPostFileresourceType } from '@/plugins/api/dataset'
  import { isAnyMissing } from '@/plugins/util/formatting'

  import emitter from 'tiny-emitter/instance'

  const emit = defineEmits(['type-added'])

  const dialog = ref(false)

  const name = ref<string>()
  const description = ref<string>()

  const formValid = computed(() => {
    if (isAnyMissing(name.value)) {
      return false
    }

    return true
  })

  function show () {
    dialog.value = true
  }
  function hide () {
    name.value = undefined
    description.value = undefined

    dialog.value = false
  }

  function onSubmit () {
    if (!name.value) {
      return
    }

    emitter.emit('show-loading', true)
    apiPostFileresourceType({
      name: name.value,
      description: description.value,
    }, result => {
      emitter.emit('show-loading', false)
      if (result) {
        emit('type-added', result)
        hide()
      }
    })
  }

  defineExpose({
    show,
    hide,
  })
</script>
