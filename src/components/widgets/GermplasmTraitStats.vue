<template>
  <div v-if="stats && stats.length > 0">
    <v-text-field class="mb-5" clearable :messages="searchTerm ? ['f'] : []" v-model="searchTerm" :label="$t('formLabelSearchTerm')">
      <template #message>
        <span class="mr-3"><v-icon icon="mdi-playlist-check" /> <a href="#" @click.prevent="markAll(true)">{{ $t('buttonSelectAll') }}</a></span>
        <span><v-icon icon="mdi-playlist-remove" /> <a href="#" @click.prevent="markAll(false)">{{ $t('buttonDeselectAll') }}</a></span>
      </template>
    </v-text-field>

    <v-row>
      <v-col cols="4" sm="4" md="3" lg="2" v-for="trait in filteredStats" :key="`trait-stats-${trait.traitId}`">
        <Scale
          v-model="trait.isSelected"
          selectable
          :min="trait.min"
          :max="trait.max"
          :marker="trait.avg"
          :count="trait.count"
          :heading="trait.traitName"
          :to="Pages.getPath(Pages.traitDetails, `${trait.traitId}`)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { apiGetGermplasmStatsTraits } from '@/plugins/api/germplasm';
  import { Pages } from '@/plugins/pages'
  import type { GermplasmStats } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    germplasmId: number
  }>()

  const emit = defineEmits(['has-data'])

  const searchTerm = ref<string>()
  const stats = ref<GermplasmStats[]>([])

  const filteredStats = computed(() => {
    if (searchTerm.value) {
      const lower = searchTerm.value.toLowerCase()
      return stats.value.filter(s => s.traitName.toLowerCase().includes(lower))
    } else {
      return stats.value
    }
  })

  function markAll (toSelect: boolean) {
    const ids = new Set(filteredStats.value.map(fs => fs.traitId))

    stats.value.forEach(s => {
      if (ids.has(s.traitId)) {
        s.isSelected = toSelect
      }
    })
  }

  function update () {
    apiGetGermplasmStatsTraits<GermplasmStats[]>(compProps.germplasmId, result => {
      if (result && result.length > 0) {
        result.forEach(r => {
          r.isSelected = false
        })
      }

      stats.value = result

      if (result) {
        emit('has-data', result.length)
      } else {
        emit('has-data', 0)
      }
    })
  }

  onMounted(() => {
    emitter.on('license-accepted', update)

    if (compProps.germplasmId) {
      update()
    }
  })
  onBeforeUnmount(() => emitter.off('license-accepted', update))
</script>
