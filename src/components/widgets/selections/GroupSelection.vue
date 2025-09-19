<template>
  <div>
    <slot name="title"><h3>{{ $t('pageTrialsExportSelectGroupTitle') }}</h3></slot>
    <slot name="text" />
    <v-autocomplete
      v-model="selectedGroups"
      autocomplete="off"
      :label="$t('pageTrialsExportSelectGroupTitle')"
      :disabled="groupSelection === 'all'"
      return-object
      hide-details
      :multiple="multiple"
      chips
      clearable
      :items="allGroups"
    />
    <v-btn-toggle class="mt-2" color="primary" variant="outlined" v-model="groupSelection" v-if="multiple">
      <v-btn value="groups" :text="$t('pageExportGroupSelectModeSelect')" prepend-icon="mdi-arrow-up-box" />
      <v-btn value="all" :text="$t('pageExportGroupSelectModeAll')" prepend-icon="mdi-select-all" />
    </v-btn-toggle>
  </div>
</template>

<script setup lang="ts">
  import type { ViewTableGroups } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import { useI18n } from 'vue-i18n'

  interface GroupSelectItem {
    value: ViewTableGroups
    title: string
    props?: any
    type?: string
  }

  interface GroupSelectionProps {
    markedItemType: string
    modelValue: ViewTableGroups[]
    groups: ViewTableGroups[]
    multiple?: boolean
  }

  export type GroupSelectionType = 'all' | 'groups'

  const compProps = withDefaults(defineProps<GroupSelectionProps>(), {
    multiple: true,
  })

  const emit = defineEmits(['update:model-value'])

  const store = coreStore()
  const { t } = useI18n()

  const selectedGroups = ref<GroupSelectItem[] | GroupSelectItem>([])
  const groupSelection = defineModel<GroupSelectionType>('groupSelection', {
    default: 'all',
  })
  // const groupSelection = ref<GroupSelectionType>('all')

  watch(groupSelection, async newValue => {
    if (newValue === 'all') {
      selectedGroups.value = []
    }
  })

  watch(() => compProps.modelValue, async newValue => {
    if (newValue) {
      const ids = new Set(newValue.map(nv => nv.groupId))
      selectedGroups.value = allGroups.value.filter(ag => ag.type !== 'subheader' && ids.has(ag.value.groupId))
    } else {
      selectedGroups.value = []
    }
  })
  watch(selectedGroups, async newValue => {
    if (!newValue) {
      newValue = []
    }
    const asArray = Array.isArray(newValue) ? newValue : [newValue]
    const toNotify = (asArray || []).map(nv => nv.value)
    if (JSON.stringify(toNotify) !== JSON.stringify(compProps.modelValue)) {
      emit('update:model-value', toNotify)
    }
  })

  const allGroups: ComputedRef<GroupSelectItem[]> = computed(() => {
    const localGroups: any[] = compProps.groups.concat().map(g => {
      return {
        value: g,
        title: `${g.groupName} (${g.count || 0})`,
        props: { disabled: false },
      }
    })

    if (store.storeMarkedIds[compProps.markedItemType]) {
      localGroups.unshift({ type: 'subheader', title: t('pageGroupsTitle') })
      const count = (store.storeMarkedIds[compProps.markedItemType] || []).length
      localGroups.unshift({
        title: `${t('pageExportSelectMarkedItems')} (${count || 0})`,
        props: { disabled: count === 0 },
        value: {
          groupId: -1,
          groupName: t('pageExportSelectMarkedItems'),
          count: count,
        },
      })
      localGroups.unshift({ type: 'subheader', title: t('pageMarkedItemsTitle') })
    }

    return localGroups
  })
</script>
