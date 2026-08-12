<template>
  <div>
    <v-menu v-model="visible">
      <template #activator="{ props }">
        <v-btn v-bind="props" :icon="mdiAccount" />
      </template>
      <v-list>
        <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('dropdownUserSettings') }}</v-list-subheader>
        <template v-if="store.storeToken">
          <v-list-item
            :prepend-icon="mdiAccount"
            :subtitle="store.storeToken.userType"
            :title="store.storeToken.username"
          />
          <v-divider />
          <v-list-item @click="tokenModal?.show()" :title="$t('dropdownUserSettingsGetToken')">
            <template #prepend>
              <v-icon color="info" :icon="mdiCircleMultiple" />
            </template>
          </v-list-item>
          <v-list-item @click="logout" :title="$t('dropdownUserSettingsLogout')">
            <template #prepend>
              <v-icon color="error" :icon="mdiLogoutVariant" />
            </template>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item @click="showLogin" :title="$t('dropdownUserSettingsLogin')">
            <template #prepend>
              <v-icon color="success" :icon="mdiLoginVariant" />
            </template>
          </v-list-item>
        </template>
        <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black" v-if="store.storeUserIsAdmin || store.storeUserIsDataCurator">{{ $t('dropdownUserSettingsAdvancedSettings') }}</v-list-subheader>
        <template v-if="store.storeUserIsAdmin">
          <v-list-item :to="Pages.germinateSettings.path" :title="$t('dropdownUserSettingsGerminateSettings')">
            <template #prepend>
              <v-icon color="warning" :icon="mdiCog" />
            </template>
          </v-list-item>
          <v-list-item :to="Pages.backup.path" :title="$t('dropdownUserSettingsBackup')">
            <template #prepend>
              <v-icon color="warning" :icon="mdiBackupRestore" />
            </template>
          </v-list-item>
          <v-list-item :to="Pages.userPermissions.path" :title="$t('dropdownUserSettingsUserPermissions')">
            <template #prepend>
              <v-icon color="warning" :icon="mdiAccountKey" />
            </template>
          </v-list-item>
          <!-- <v-list-item :to="Pages.userFeedback.path" :title="$t('dropdownUserSettingsUserFeedback')" v-if="store.storeServerSettings?.supportsFeedback">
            <template #prepend>
              <v-icon color="warning" :icon="mdiCommentQuoteOutline" />
            </template>
          </v-list-item> -->
        </template>
        <template v-if="store.storeUserIsDataCurator">
          <v-list-item :to="Pages.importUpload.path" :title="$t('dropdownUserSettingsDataUpload')">
            <template #prepend>
              <v-icon color="warning" :icon="mdiUpload" />
            </template>
          </v-list-item>
          <v-list-item :title="$t('dropdownUserSettingsDataCleaning')">
            <template #prepend>
              <v-icon color="warning" :icon="mdiMonitorShimmer" />
            </template>
            <template #append>
              <v-icon :icon="mdiMenuRight" size="x-small" />
            </template>

            <v-menu :open-on-focus="false" activator="parent" submenu>
              <v-list>
                <v-list-item :to="Pages.germplasmUnifier.path" :title="$t('dropdownUserSettingsGermplasmUnifier')">
                  <template #prepend>
                    <v-icon color="warning" :icon="mdiSetMerge" />
                  </template>
                </v-list-item>
                <v-list-item :to="Pages.traitUnifier.path" :title="$t('dropdownUserSettingsTraitUnifier')">
                  <template #prepend>
                    <v-icon color="warning" :icon="mdiSetMerge" />
                  </template>
                </v-list-item>
                <v-list-item :to="Pages.germplasmMatch.path" :title="$t('dropdownUserSettingsGermplasmMatchSearch')">
                  <template #prepend>
                    <v-icon color="warning" :icon="mdiTextSearch" />
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item>
        </template>
      </v-list>
    </v-menu>

    <TextfieldModal
      :title="$t('modalTitleGetToken')"
      :text="store.storeToken?.token || ''"
      :label="$t('formLabelToken')"
      :hint="$t('formDescriptionToken')"
      copy
      ref="tokenModal"
    />
  </div>
</template>

<script setup lang="ts">
  import { apiDeleteToken } from '@/plugins/api/auth'
  import { Pages } from '@/plugins/pages'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import TextfieldModal from '@/components/modals/TextfieldModal.vue'
  import { mdiAccount, mdiAccountKey, mdiBackupRestore, mdiCircleMultiple, mdiCog, mdiCommentQuoteOutline, mdiLoginVariant, mdiLogoutVariant, mdiMenuRight, mdiMonitorShimmer, mdiSetMerge, mdiTextSearch, mdiUpload } from '@mdi/js'

  const store = coreStore()
  const router = useRouter()

  const tokenModal = useTemplateRef('tokenModal')

  const visible = ref(false)

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
        router.push({ path: Pages.login.path, query: { redirect: router.currentRoute?.value?.fullPath || '/' } })
      } else {
        router.push('/')
      }

      emitter.emit('update-sidebar-menu')
      emitter.emit('update-async-jobs')
    }, {
      codes: [],
      callback: () => {
        // If they're wrong, remove
        store.setToken(undefined)

        emitter.emit('update-sidebar-menu')
        emitter.emit('update-async-jobs')
      },
    })
  }
</script>
