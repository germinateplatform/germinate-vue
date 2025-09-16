<template>
  <v-dialog v-model="dialog" max-width="min(90vw, 1024px)">
    <v-card
      :title="$t(compProps.title)"
    >
      <template #text>
        <p v-if="compProps.text">{{ $t(compProps.text) }}</p>

        <v-row>
          <v-col
            v-for="config in visibleFields"
            :key="`form-field-${config.key}`"
            cols="12"
            :md="6 * config.width"
          >
            <v-text-field
              v-model="formModel[config.key]"
              :list="(config.inputDatalist && config.inputDatalist.length > 0) ? config.key : undefined"
              :label="$t(config.title)"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :type="config.inputType || 'text'"
              :required="config.required"
              v-if="config.type === 'text'"
            />
            <datalist :id="config.key" v-if="config.type === 'text' && config.inputDatalist && config.inputDatalist.length > 0">
              <option v-for="option in config.inputDatalist" :key="`item-${option}`">{{ option }}</option>
            </datalist>
            <v-select
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :items="config.selectOptions"
              :disabled="config.disabled === true"
              :required="config.required"
              v-else-if="config.type === 'select'"
            />
            <v-textarea
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :required="config.required"
              v-else-if="config.type === 'textarea'"
            />
            <v-row v-else-if="config.type === 'markdown'">
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="formModel[config.key]"
                  :label="$t(config.title)"
                  :required="config.required"
                  :hint="config.hint ? $t(config.hint) : undefined"
                  :messages="['f']"
                  :persistent-hint="config.hint !== undefined"
                >
                  <template #message>
                    <a href="https://www.markdownguide.org/" rel="noopener noreferrer" target="_blank">{{ $t('formDescriptionMarkdown') }}</a>
                  </template>
                </v-textarea>
              </v-col>

              <v-col cols="12" md="6">
                <div class="v-textarea v-field__input v-input--density-default v-field--variant-filled markdown-area">
                  <div class="v-field__overlay" />
                  <label class="mx-4 v-label v-field-label v-field-label--floating" aria-hidden="false">{{ $t('formLabelGenericMarkdownPreview') }}</label>
                  <Markdown class="mx-4 pt-8" :source="formModel[config.key]" />
                </div>
              </v-col>
            </v-row>
            <v-date-input
              v-else-if="config.type === 'date'"
              hide-details
              :label="$t(config.title)"
              :display-format="(d: any) => d ? d.toLocaleDateString() : ''"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :clearable="!config.required"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              :model-value="formModel[config.key] ? date.toJsDate(formModel[config.key]) : undefined"
              @update:model-value="v => { formModel[config.key] = date.toISO(v) }"
            />
            <v-date-input
              v-else-if="config.type === 'dateobject'"
              hide-details
              :label="$t(config.title)"
              :display-format="(d: any) => d ? d.toLocaleDateString() : ''"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :clearable="!config.required"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              v-model="formModel[config.key]"
            />
            <v-file-input
              v-else-if="config.type === 'file'"
              :label="$t(config.title)"
              v-model="formModel[config.key]"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              :accept="config.accepts"
            />
            <v-checkbox
              v-else-if="config.type === 'boolean'"
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :disabled="config.disabled === true"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
            />
          </v-col>
        </v-row>

        <slot name="additional-fields" v-bind="{ item: formModel }" />
      </template>

      <v-divider />

      <v-card-actions class="bg-surface-light">
        <v-btn :text="$t('buttonCancel')" variant="plain" @click="dialog = false" />

        <v-spacer />

        <v-btn :text="$t('buttonSave')" :disabled="!valid" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts" generic="T">
  import Markdown from 'vue3-markdown-it'
  import { useDate } from 'vuetify'

  export interface SelectOption {
    title: string
    value: number | string
  }

  export interface FieldConfig<T> {
    key: string
    title: string
    hint?: string
    type: 'text' | 'textarea' | 'number' | 'date' | 'dateobject' | 'markdown' | 'boolean' | 'file' | 'select'
    valid?: (args: any) => boolean
    selectOptions?: SelectOption[]
    disabled?: boolean
    width: number
    required: boolean
    inputType?: string
    inputDatalist?: string[]
    accepts?: string
    visible?: (item: T) => boolean
  }

  const compProps = defineProps<{
    title: string
    text?: string
    item: T
    fields: FieldConfig<T>[]
    notify: (args: T) => Promise<boolean>
  }>()

  const date = useDate()
  const dialog = ref(false)
  // @ts-ignore
  const formModel = ref<T>({})
  const emit = defineEmits(['items-changed'])

  const visibleFields = computed(() => {
    if (compProps.fields) {
      return compProps.fields.filter(f => !f.visible || (f.visible(formModel.value) === true))
    } else {
      return []
    }
  })

  const valid = computed(() => {
    return !compProps.fields.some(f => f.valid && !f.valid(formModel.value[f.key]))
  })

  function show () {
    if (compProps.item) {
      formModel.value = JSON.parse(JSON.stringify(compProps.item))
    } else {
      formModel.value = {}
    }

    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }
  function save () {
    if (!valid.value) {
      return
    }

    compProps.notify(formModel.value)
      .then((result: boolean) => {
        if (result === true) {
          emit('items-changed')
          hide()
        }
      })
  }

  defineExpose({
    show,
    hide,
  })
</script>

<style scoped>
.markdown-area {
  flex-direction: column;
  align-items: start;
}
.markdown-area label {
  visibility: visible;
  top: 7px;
}
</style>
