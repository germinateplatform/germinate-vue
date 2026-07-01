<template>
  <v-dialog v-model="dialog" max-width="min(90vw, 600px)">
    <v-card :title="$t('pageLocationsMapsClimateOverlaysTitle')">
      <v-card-text>
        <p>{{ $t('pageLocationsMapsClimateOverlaysText') }}</p>

        <v-list>
          <v-list-item
            v-for="climate in climates"
            :key="`climate-select-${climate.climateId}`"
            :title="climate.climateName"
            :subtitle="climate.climateDescription"
            @click="clicked(climate)"
            :color="climate.climateId === selectedClimate?.climateId ? 'primary' : undefined"
            :append-icon="climate.climateId === selectedClimate?.climateId ? mdiCheck : undefined"
          />
        </v-list>

        <div class="text-body-large mt-5">{{ $t('pageLocationsMapsClimateOverlaysOpacity') }}</div>
        <v-slider
          v-model="opacity"
          :min="0"
          :max="1"
          :step="0.1"
          :append-icon="mdiMap"
          :prepend-icon="mdiMapOutline"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="success" variant="flat" @click="select">{{ $t('buttonUpdate') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { ViewTableClimates } from '@/plugins/types/germinate'
  import { mdiCheck, mdiMap, mdiMapOutline } from '@mdi/js'

  const compProps = defineProps<{
    climates: ViewTableClimates[]
  }>()

  const dialog = ref(false)

  const selectedClimate = defineModel<ViewTableClimates>()
  const opacity = defineModel<number>('opacity', {
    default: 1,
  })

  function clicked (item: ViewTableClimates) {
    if (item.climateId === selectedClimate.value?.climateId) {
      selectedClimate.value = undefined
    } else {
      selectedClimate.value = item
    }
  }

  function select () {
    emit('select')
    hide()
  }

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  const emit = defineEmits(['select'])

  defineExpose({
    show,
    hide,
  })
</script>

<style>
</style>
