<template>
  <v-menu v-model="visible">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-account" />
    </template>
    <v-list>
      <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('dropdownUserSettings') }}</v-list-subheader>
      <template v-if="store.storeToken">
        <v-list-item
          prepend-icon="mdi-account"
          :subtitle="store.storeToken.userType"
          :title="store.storeToken.username"
        />
        <v-divider />
        <v-list-item @click="showTokenModal" :title="$t('dropdownUserSettingsGetToken')">
          <template #prepend>
            <v-icon color="info">mdi-circle-multiple</v-icon>
          </template>
        </v-list-item>
        <v-list-item @click="logout" :title="$t('dropdownUserSettingsLogout')">
          <template #prepend>
            <v-icon color="error">mdi-logout-variant</v-icon>
          </template>
        </v-list-item>
      </template>
      <template v-else>
        <v-list-item @click="showLogin" :title="$t('dropdownUserSettingsLogin')">
          <template #prepend>
            <v-icon color="success">mdi-login-variant</v-icon>
          </template>
        </v-list-item>
      </template>
      <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black" v-if="store.storeUserIsAdmin || store.storeUserIsDataCurator">{{ $t('dropdownUserSettingsAdvancedSettings') }}</v-list-subheader>
      <template v-if="store.storeUserIsAdmin">
        <v-list-item :to="Pages.germinateSettings.path" :title="$t('dropdownUserSettingsGerminateSettings')">
          <template #prepend>
            <v-icon color="warning">mdi-cog</v-icon>
          </template>
        </v-list-item>
        <v-list-item :to="Pages.backup.path" :title="$t('dropdownUserSettingsBackup')">
          <template #prepend>
            <v-icon color="warning">mdi-backup-restore</v-icon>
          </template>
        </v-list-item>
        <v-list-item :to="Pages.userPermissions.path" :title="$t('dropdownUserSettingsUserPermissions')">
          <template #prepend>
            <v-icon color="warning">mdi-account-key</v-icon>
          </template>
        </v-list-item>
        <v-list-item :to="Pages.userFeedback.path" :title="$t('dropdownUserSettingsUserFeedback')" v-if="store.storeServerSettings?.supportsFeedback">
          <template #prepend>
            <v-icon color="warning">mdi-comment-quote-outline</v-icon>
          </template>
        </v-list-item>
      </template>
      <template v-if="store.storeUserIsDataCurator">
        <v-list-item :to="Pages.germplasmUnifier.path" :title="$t('dropdownUserSettingsGermplasmUnifier')">
          <template #prepend>
            <v-icon color="warning">mdi-set-merge</v-icon>
          </template>
        </v-list-item>
        <v-list-item :to="Pages.germplasmMatch.path" :title="$t('dropdownUserSettingsGermplasmMatchSearch')">
          <template #prepend>
            <v-icon color="warning">mdi-text-search</v-icon>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
  import { apiDeleteToken } from '@/plugins/api/auth'
  import { Pages } from '@/plugins/pages'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'

  const store = coreStore()
  const router = useRouter()

  const visible = ref(false)

  function showTokenModal () {
    // TODO
  }

  function showLogin () {
    emitter.emit('show-login')
  }

  function logout () {
    if (!store.storeToken) {
      return
    }

    const user = {
      username: store.storeToken.username,
      password: store.storeToken.token,
    }

    apiDeleteToken(user, () => {
      // If it's successful, delete token, then redirect
      store.setToken(undefined)

      if (store.storeServerSettings?.authMode === 'FULL') {
        router.push(Pages.login.path)
      } else {
        router.push('/')
      }

      emitter.emit('update-sidebar-menu')
    }, {
      codes: [],
      callback: () => {
        // If they're wrong, remove
        store.setToken(undefined)

        emitter.emit('update-sidebar-menu')
      },
    })
  }

  // function showMenu () {
  //   visible.value = true
  // }
  // onBeforeMount(() => {
  //   emitter.on('logged-in', showMenu)
  // })
  // onBeforeUnmount(() => {
  //   emitter.off('logged-in', showMenu)
  // })
</script>
