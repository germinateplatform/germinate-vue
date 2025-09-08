<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      scrollable
    >
      <v-card
        class="mx-auto pa-12 pb-8"
        elevation="8"
        min-width="400"
        max-width="640"
        rounded="lg"
        :loading="loading"
      >
        <template #loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="primary"
            height="4"
            indeterminate
          />
        </template>

        <LoginSection @close="hide" @loading="setLoading" />

        <v-card-actions>
          <v-spacer />

          <v-btn
            :text="$t('buttonClose')"
            @click="dialog = false"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
  import LoginSection from '@/components/widgets/LoginSection.vue'

  const dialog = ref(false)
  const loading = ref(false)

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }
  function setLoading (ld: boolean) {
    loading.value = ld
  }

  defineExpose({
    show,
    hide,
  })
</script>
