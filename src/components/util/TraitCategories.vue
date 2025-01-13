<template>
  <div v-if="traitCategories && traitCategories.length" class="mb-3">
    <h3>{{ $t('widgetTraitCategoriesTitle') }}</h3>
    <b-badge class="mr-3" href="#" @click.native.prevent="onCategoryClicked(null)" variant="danger" v-if="selectedCategory">
      <MdiIcon :path="mdiClose" />
      <span> {{ $t('widgetTraitCategoriesDeselect') }}</span>
    </b-badge>
    <b-badge v-for="(category, index) in traitCategories" :key="`image-category-${index}`" class="mr-1" href="#" @click.native.prevent="onCategoryClicked(category)" :variant="(selectedCategory !== null && category.id === selectedCategory.id) ? 'primary' : null">
      <MdiIcon :path="mdiLabelMultiple" />
      <span> {{ category.name }}</span>
    </b-badge>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { apiGetTraitCategories } from '@/mixins/api/trait'

import { mdiClose, mdiLabelMultiple } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      mdiClose,
      mdiLabelMultiple,
      selectedCategory: null,
      traitCategories: []
    }
  },
  methods: {
    selectCategory: function (category) {
      this.selectedCategory = category
    },
    onCategoryClicked: function (category) {
      this.selectedCategory = category
      this.$emit('category-selected', category)
    },
    refresh: function () {
      apiGetTraitCategories(result => {
        this.traitCategories = result
      })
    }
  },
  mounted: function () {
    this.refresh()
  }
}
</script>

<style>

</style>
