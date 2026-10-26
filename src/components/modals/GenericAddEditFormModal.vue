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
              v-model="modelRecord[config.key]"
              :list="(config.inputDatalist && config.inputDatalist.length > 0) ? config.key : undefined"
              :label="$t(config.title)"
              :hide-details="config.hint === undefined"
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
              v-model="modelRecord[config.key]"
              :label="$t(config.title)"
              :hide-details="config.hint === undefined"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :items="config.selectOptions"
              :disabled="config.disabled === true"
              :required="config.required"
              v-else-if="config.type === 'select'"
            />
            <v-textarea
              v-model="modelRecord[config.key]"
              :label="$t(config.title)"
              :hide-details="config.hint === undefined"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :required="config.required"
              v-else-if="config.type === 'textarea'"
            />
            <v-row v-else-if="config.type === 'markdown'">
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="modelRecord[config.key]"
                  :label="$t(config.title)"
                  :hide-details="config.hint === undefined"
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
                  <Markdown class="mx-4 pt-8" :source="modelRecord[config.key]" />
                </div>
              </v-col>
            </v-row>
            <v-date-input
              v-else-if="config.type === 'date'"
              :hide-details="config.hint === undefined"
              :label="$t(config.title)"
              :display-format="(d: any) => d ? d.toLocaleDateString() : ''"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :clearable="!config.required"
              autocomplete="off"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              :model-value="modelRecord[config.key] ? date.toJsDate(modelRecord[config.key]) : undefined"
              @update:model-value="v => { modelRecord[config.key] = date.toISO(v) }"
            />
            <v-date-input
              v-else-if="config.type === 'dateobject'"
              :hide-details="config.hint === undefined"
              :label="$t(config.title)"
              autocomplete="off"
              :display-format="(d: any) => d ? d.toLocaleDateString() : ''"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :clearable="!config.required"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              v-model="modelRecord[config.key]"
            />
            <!-- @vue-ignore -->
            <v-file-input
              v-else-if="config.type === 'file'"
              :label="$t(config.title)"
              :hide-details="config.hint === undefined"
              v-model="modelRecord[config.key]"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              prepend-icon=""
              :prepend-inner-icon="mdiPaperclip"
              :accept="config.accepts"
            />
            <v-checkbox
              v-else-if="config.type === 'boolean'"
              v-model="modelRecord[config.key]"
              :hide-details="config.hint === undefined"
              :label="$t(config.title)"
              :disabled="config.disabled === true"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
            />
          </v-col>
        </v-row>

        <slot name="additional-fields" v-bind="{ item: item }" />
      </template>

      <v-card-actions>
        <v-spacer />
        <v-btn :text="$t('buttonCancel')" variant="plain" @click="hide()" />
        <v-btn :text="$t('buttonSave')" :disabled="!valid || disableSave === true" color="primary" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts" generic="T extends Partial<Record<keyof T, unknown>>">
  import { mdiPaperclip } from '@mdi/js'
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

  const modelRecord = computed({
    get: () => item.value as Record<string, unknown>,
    set: v => {
      item.value = v as T
    },
  })

  const compProps = defineProps<{
    title: string
    text?: string
    disableSave?: boolean
    fields: FieldConfig<T>[]
    notify: (args: T) => Promise<boolean>
  }>()

  const item = defineModel<T>({
    default: () => {
      return {} as T
    },
  })

  const date = useDate()
  const dialog = ref(false)
  const emit = defineEmits(['items-changed', 'hide'])

  const visibleFields = computed(() => {
    if (compProps.fields) {
      return compProps.fields.filter(f => !f.visible || (f.visible(item.value) === true))
    } else {
      return []
    }
  })

  const valid = computed(() => {
    return !compProps.fields.some(f => (f.valid && !f.valid(modelRecord.value[f.key])) || (f.required && modelRecord.value[f.key] === undefined))
  })

  function show () {
    if (item.value) {
      item.value = JSON.parse(JSON.stringify(item.value))
    } else {
      // @ts-ignore
      item.value = {}
    }

    dialog.value = true
  }
  function hide () {
    dialog.value = false
    emit('hide')
  }
  function save () {
    if (!valid.value) {
      return
    }

    compProps.notify(item.value)
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
