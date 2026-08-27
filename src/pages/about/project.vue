<template>
  <v-container fluid>
    <div id="about-page">
      <h1 class="text-headline-large mb-3">{{ $t('pageAboutProjectTitle') }}</h1>
      <v-divider class="mb-3" />

      <HtmlTemplateEditor i18n-key="pageAboutProjectText" />
    </div>

    <div v-if="(config && config.length > 0) || store.storeUserIsAdmin">
      <h3>{{ $t('pageAboutProjectPartnersTitle') }}</h3>
      <p class="mb-10">{{ $t('pageAboutProjectPartnersText') }}</p>

      <section
        v-for="(group, groupIndex) in config"
        :key="`group-${groupIndex}`"
      >
        <h4 class="mt-4" v-if="group.name !== NO_GROUP">{{ group.name }}</h4>

        <draggable
          v-model="group.items"
          item-key="id"
          tag="div"
          handle=".drag-handle"
          class="v-row v-row--density-default"
        >
          <v-col
            v-for="(item, itemIndex) in group.items"
            :key="`group-${group.name}-item-${item.id}`"
            cols="12"
            lg="6"
            xxl="4"
          >
            <v-card class="h-100">
              <div class="d-flex flex-no-wrap justify-space-between h-100">
                <div class="d-flex justify-space-between flex-column flex-grow-1">
                  <div>
                    <v-card-title class="text-headline-small text-wrap d-flex">
                      <v-icon class="drag-handle" :icon="mdiDrag" v-if="store.storeUserIsAdmin" />
                      <v-text-field v-model="item.name" :label="$t('formLabelAboutPartnerName')" hide-details v-if="store.storeUserIsAdmin && item.isEditing === true" />
                      <span v-else>{{ item.name }}</span>
                    </v-card-title>

                    <v-card-subtitle class="text-wrap">
                      <v-text-field v-model="item.description" :label="$t('formLabelAboutPartnerDescription')" hide-details v-if="store.storeUserIsAdmin && item.isEditing === true" />
                      <span v-else>{{ item.description }}</span>
                    </v-card-subtitle>

                    <v-card-text v-if="store.storeUserIsAdmin && item.isEditing === true">
                      <v-text-field v-model="item.url" :label="$t('formLabelAboutPartnerUrl')" hide-details />
                    </v-card-text>
                  </div>

                  <v-card-actions class="mb-2">
                    <v-btn
                      class="ms-2"
                      rel="noopener noreferrer"
                      target="_blank"
                      :text="$t('buttonVisit')"
                      variant="tonal"
                      color="primary"
                      :prepend-icon="mdiOpenInNew"
                      :href="item.url"
                      v-if="item.url"
                    />
                    <v-btn
                      v-if="store.storeUserIsAdmin"
                      variant="tonal"
                      color="error"
                      :prepend-icon="mdiDelete"
                      @click="deleteItem(groupIndex, itemIndex)"
                      :text="$t('buttonDelete')"
                    />
                    <v-switch
                      v-if="store.storeUserIsAdmin"
                      v-model="item.isEditing"
                      hide-details
                      density="compact"
                      color="primary"
                      class="ms-2"
                      :label="$t('buttonEdit')"
                    />
                  </v-card-actions>
                </div>

                <v-img crossorigin="anonymous" aspect-ratio="1/1" class="ma-4" inline width="125" height="125" contain :src="`${store.storeBaseUrl}image/src/?name=${item.image}&type=template`" />
              </div>
            </v-card>
          </v-col>
        </draggable>
      </section>

      <div v-if="store.storeUserIsAdmin" class="mt-3">
        <v-btn class="me-2" @click="save" variant="tonal" color="success" :prepend-icon="mdiContentSave" :text="$t('buttonSubmit')" />
        <v-btn class="me-2" @click="showAddModal" variant="tonal" color="info" :prepend-icon="mdiPlusBox" :text="$t('genericAdd')" />
      </div>
    </div>

    <!-- @vue-generic {import('@/plugins/types/germinate').AboutInfo} -->
    <GenericAddEditFormModal
      title="modalTitleAddAboutPartner"
      v-model="selectedInfo"
      :notify="onSendInfo"
      :fields="infoFields"
      @items-changed="update"
      ref="infoModal"
      v-if="selectedInfo"
    />
  </v-container>
</template>

<route lang="yaml">
name: aboutProject
</route>

<script setup lang="ts">
  import GenericAddEditFormModal from '@/components/modals/GenericAddEditFormModal.vue'
  import HtmlTemplateEditor from '@/components/widgets/HtmlTemplateEditor.vue'
  import { apiGetTemplateAboutConfig, apiPatchTemplateAboutConfig, apiPostAboutPartner } from '@/plugins/api/setting'
  import type { AboutInfo } from '@/plugins/types/germinate'
  import { uuidv4 } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiContentSave, mdiDelete, mdiDrag, mdiOpenInNew, mdiPlusBox } from '@mdi/js'
  import { VueDraggableNext as draggable } from 'vue-draggable-next'

  const NO_GROUP = '--NO_GROUP--'

  interface AboutGroup {
    name: string
    items: AboutInfo[]
  }

  const store = coreStore()
  const config = ref<AboutGroup[]>([])
  const selectedInfo = ref<AboutInfo>({})
  const infoModal = useTemplateRef('infoModal')

  const groupNames: ComputedRef<string[]> = computed(() => {
    if (config.value) {
      const gs = new Set<string>()
      config.value.forEach(g => gs.add(g.name))
      gs.delete(NO_GROUP)
      return [...gs]
    } else {
      return []
    }
  })

  const infoFields = computed(() => {
    return [{
      key: 'name',
      title: 'formLabelAboutPartnerName',
      type: 'text' as const,
      required: true,
      width: 2,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'description',
      title: 'formLabelAboutPartnerDescription',
      type: 'textarea' as const,
      required: false,
      width: 2,
    }, {
      key: 'group',
      title: 'formLabelAboutPartnerGroup',
      type: 'text' as const,
      inputDatalist: groupNames.value,
      required: false,
      width: 2,
    }, {
      key: 'url',
      title: 'formLabelAboutPartnerUrl',
      type: 'text' as const,
      inputType: 'url',
      required: false,
      width: 2,
    }, {
      key: 'image',
      title: 'formLabelAboutPartnerImage',
      type: 'file' as const,
      required: true,
      width: 2,
      accepts: '.jpeg, .png, .jpg, .svg',
      valid: (value: File) => value !== undefined,
    }]
  })

  function save () {
    const list: AboutInfo[] = []

    config.value.forEach(g => {
      g.items.forEach(i => {
        if (g.name === NO_GROUP) {
          delete i.group
        } else {
          i.group = g.name
        }
        list.push(i)
      })
    })

    apiPatchTemplateAboutConfig(list, () => {
      update()
    })
  }

  function onSendInfo () {
    const formData = new FormData()

    if (!selectedInfo.value.name || !selectedInfo.value.image) {
      return new Promise<boolean>((resolve, reject) => reject(false))
    }

    formData.append('name', selectedInfo.value.name)
    if (selectedInfo.value.description) {
      formData.append('description', selectedInfo.value.description)
    }
    if (selectedInfo.value.group) {
      formData.append('group', selectedInfo.value.group)
    }
    if (selectedInfo.value.url) {
      formData.append('url', selectedInfo.value.url)
    }
    formData.append('imageFile', selectedInfo.value.image)

    return new Promise<boolean>(resolve => apiPostAboutPartner(formData, () => resolve(true)))
  }

  function showAddModal () {
    selectedInfo.value = {}

    nextTick(() => infoModal.value?.show())
  }

  function deleteItem (groupIndex: number, itemIndex: number) {
    config.value[groupIndex].items.splice(itemIndex, 1)
  }

  function update () {
    apiGetTemplateAboutConfig(result => {
      if (result && result.length > 0) {
        const groups: AboutGroup[] = [{
          name: NO_GROUP,
          items: [] as AboutInfo[],
        }]

        if (result) {
          result.forEach(i => {
            const groupName = i.group || NO_GROUP
            i.isEditing = false
            i.id = uuidv4()

            const match = groups.find(g => g.name === groupName)

            if (!match) {
              groups.push({
                name: groupName,
                items: [i],
              })
            } else {
              match.items.push(i)
            }
          })
        }

        config.value = groups
      }
    }, {
      codes: [404],
      callback: () => {
        config.value = []
        // Do nothing here, it just means there is no config file
      },
    })
  }

  onMounted(() => update())
</script>
