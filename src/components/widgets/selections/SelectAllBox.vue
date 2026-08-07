<template>
  <v-select
    :label="$t(compProps.label)"
    :hint="compProps.hint ? $t(compProps.hint) : undefined"
    :persistent-hint="compProps.hint !== undefined"
    :multiple="compProps.multiple"
    :clearable="compProps.clearable"
    v-model="selection"
    :items="compProps.items"
    :item-title="compProps.itemTitle"
    :item-key="compProps.itemKey"
    :return-object="compProps.itemKey !== undefined"
  >
    <template #prepend-item>
      <v-list-item :title="$t('buttonSelectAll')" @click="toggle">
        <template #prepend>
          <v-checkbox-btn
            :indeterminate="someSelected && !allSelected"
            :model-value="allSelected"
          />
        </template>
      </v-list-item>

      <v-divider class="mt-2" />
    </template>

    <template #selection="{ internalItem: item, index }">
      <v-chip size="small" variant="flat" v-if="index < 4" :text="item.title" />

      <span v-if="index === 4" class="text-grey text-body-small align-self-center">(+{{ (selection || []).length - 4 }} others)</span>
    </template>
    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </v-select>
</template>

<script setup lang="ts" generic="T">
  import type { SelectItemKey } from 'vuetify/lib/util/helpers.mjs'

  export interface SelectAllBoxProps<T> {
    label: string
    hint?: string
    multiple?: boolean
    clearable?: boolean
    items: T[]
    itemTitle?: SelectItemKey<T>
    itemKey?: string
    isDisabled?: (item: T) => boolean
  }

  const compProps = withDefaults(defineProps<SelectAllBoxProps<T>>(), {
    multiple: true,
    clearable: true,
  })

  const allSelected = computed(() => selectableItems.value.length === selection.value.length)
  const someSelected = computed(() => selection.value.length > 0)

  const selection = defineModel<T[]>({
    default: () => [],
  })

  const selectableItems = computed(() => {
    const isDisabled = compProps.isDisabled
    if (isDisabled) {
      return compProps.items.filter(i => !isDisabled(i))
    } else {
      return compProps.items
    }
  })

  function toggle () {
    if (allSelected.value) {
      selection.value = []
    } else {
      selection.value = selectableItems.value.slice()
    }
  }
</script>
