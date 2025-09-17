<template>
  <div v-if="traitCategories && traitCategories.length > 0">
    <h3>{{ $t('widgetTraitCategoriesTitle') }}</h3>

    <v-chip-group
      :model-value="localSelectedCategory"
      @update:model-value="notifySelectedCategory"
      column
      selected-class="text-primary"
    >
      <v-chip
        v-for="category in traitCategories"
        :key="`trait-categories-${category.id}`"
        filter
        label
        :text="category.name"
        :value="category"
      />
    </v-chip-group>
  </div>
</template>

<script setup lang="ts">
  import { apiGetTraitCategories } from '@/plugins/api/trait'
  import type { Phenotypecategories } from '@/plugins/types/germinate'

  const compProps = defineProps<{
    modelValue: Phenotypecategories | undefined
  }>()

  const emit = defineEmits(['update:model-value'])

  const localSelectedCategory = ref<Phenotypecategories>()
  const traitCategories = ref<Phenotypecategories[]>([])

  function notifySelectedCategory (newSelection: Phenotypecategories) {
    emit('update:model-value', newSelection)
  }

  function update () {
    apiGetTraitCategories<Phenotypecategories[]>(result => {
      result.forEach(r => {
        delete r.createdOn
        delete r.description
        delete r.updatedOn
      })
      traitCategories.value = result
    })
  }

  watch(() => compProps.modelValue, async (newValue: Phenotypecategories | undefined) => {
    localSelectedCategory.value = newValue
  })

  onMounted(() => {
    update()
  })
</script>
