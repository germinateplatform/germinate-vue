<template>
  <v-card
    :title="$t(title)"
    :subtitle="$t(subtitle)"
    :color="bgColor"
    variant="tonal"
  >
    <div>
      <v-card-text class="py-0">
        <v-row align="center" no-gutters>
          <v-col
            class="text-display-medium"
            cols="6"
          >
            {{ getNumberWithSuffix(highlight || 0, 1) }}
          </v-col>

          <v-col class="text-right" cols="6">
            <v-icon
              :icon="icon"
              size="60"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </div>

    <!-- <div class="d-flex py-0 justify-space-between" v-if="keys && keys.length > 0">
      <v-list-item
        density="compact"
        :prepend-icon="mdiChevronLeft"
      >
        <v-list-item-subtitle>{{ keys[0] }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item
        density="compact"
        :append-icon="mdiChevronRight"
      >
        <v-list-item-subtitle>{{ keys.at(-1) }}</v-list-item-subtitle>
      </v-list-item>
    </div> -->

    <v-card-text class="py-0 pb-3">
      <v-sparkline
        v-if="aggregated"
        :model-value="aggregated"
        :color="bgColor"
        padding="10"
        height="50"
        line-width="2"
        stroke-linecap="round"
        :gradient="gradient"
        gradient-direction="top"
        auto-draw
      >
        <template #label="item">
          {{ (item.index === 0 || item.index === aggregated.length - 1) ? keys[item.index] : '' }}
        </template>
      </v-sparkline>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { useTheme } from 'vuetify'

  const compProps = defineProps<{
    title: string
    subtitle: string
    values: number[]
    keys: string[]
    highlight: 'cumulative' | 'last'
    aggregation: 'values' | 'cumulative'
    icon: string
    color: string
    bgColor: string
  }>()

  const theme = useTheme()
  const mutedColor = computed(() => theme.current.value.colors.muted)

  const gradient = computed(() => [compProps.color, `${mutedColor.value}` || '#ffffff'])
  const aggregated = computed(() => {
    if (compProps.values) {
      if (compProps.aggregation === 'cumulative') {
        const vs: number[] = []

        compProps.values.forEach((v, i) => {
          vs.push(i > 0 ? (vs[i - 1] + v) : v)
        })

        return vs
      } else {
        return compProps.values
      }
    } else {
      return []
    }
  })

  const highlight = computed(() => {
    if (compProps.values && compProps.values.length > 0) {
      if (compProps.highlight === 'last') {
        return compProps.values[compProps.values.length - 1]
      } else {
        return compProps.values.reduce((a, b) => a + b, 0)
      }
    } else {
      return undefined
    }
  })
</script>
