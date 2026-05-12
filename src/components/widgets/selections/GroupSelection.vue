<template>
  <div>
    <h3><slot name="title">{{ $t('pageTrialsExportSelectGroupTitle') }}</slot></h3>
    <p><slot name="text" /></p>
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
    <v-btn-toggle class="mt-2" color="primary" variant="outlined" v-model="groupSelection" v-if="multiple && type === 'export'">
      <v-btn value="groups" :text="$t('pageExportGroupSelectModeSelect')" :prepend-icon="mdiFormatListChecks" />
      <v-btn value="all" :text="$t('pageExportGroupSelectModeAll')" :prepend-icon="mdiSelectAll" />
    </v-btn-toggle>
  </div>
</template>

<script setup lang="ts">
  import type { ViewTableGroups } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import { mdiFormatListChecks, mdiSelectAll } from '@mdi/js'
  import { useI18n } from 'vue-i18n'

  interface GroupSelectItem {
    value: ViewTableGroups
    title: string
    props?: any
    type?: string
  }

  interface GroupSelectionProps {
    markedItemType: string
    groups: ViewTableGroups[]
    multiple?: boolean
    type?: 'groups' | 'export'
  }

  export type GroupSelectionType = 'all' | 'groups'

  const compProps = withDefaults(defineProps<GroupSelectionProps>(), {
    multiple: true,
    type: 'export',
  })

  const emit = defineEmits(['update:model-value'])

  const store = coreStore()
  const { t } = useI18n()

  const selectedGroups = ref<GroupSelectItem[] | GroupSelectItem>([])
  const modelValue = defineModel<ViewTableGroups[]>()
  const groupSelection = defineModel<GroupSelectionType>('groupSelection', {
    default: 'all',
  })
  // const groupSelection = ref<GroupSelectionType>('all')

  watch(groupSelection, async newValue => {
    if (newValue === 'all') {
      selectedGroups.value = []
    }
  })

  watch(modelValue, async newValue => {
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
    if (JSON.stringify(toNotify) !== JSON.stringify(modelValue.value)) {
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

    if (store.storeMarkedIds[compProps.markedItemType] && compProps.type === 'export') {
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

  watch(() => compProps.type, async newValue => {
    if (newValue === 'groups') {
      groupSelection.value = 'groups'
    }
  }, { immediate: true })

  watch(() => store.storeMarkedIds[compProps.markedItemType], async newValue => {
    const asArray = Array.isArray(selectedGroups.value) ? selectedGroups.value : [selectedGroups.value]
    if ((!newValue || newValue.length === 0) && asArray && asArray.length > 0 && asArray[0].value.groupId === -1) {
      // Marked items group was selected, but items have been unmarked elsewhere -> de-select group
      selectedGroups.value = asArray.filter(g => g.value.groupId !== -1)
    }
  })
</script>
