<template>
  <v-client-table :columns="columns" :data="users" :options="options">
    <div slot="h__selected">
      <b-form-checkbox :checked="allSelected" @change="onSelectionHeaderClicked"/>
    </div>
    <b-form-checkbox slot="selected" slot-scope="props" :value="props.row.id" v-model="selectedItems" />

    <div slot="afterTable">
      <b-button-group>
        <b-button v-b-tooltip.hover
                  :title="isAdd ? 'Add' : 'Remove'"
                  @click="$emit('action-clicked', selectedItems)">
          <i :class="`mdi mdi-18px ${isAdd ? 'mdi-plus-box' : 'mdi-delete'}`" />
        </b-button>
      </b-button-group>
    </div>
  </v-client-table>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      default: () => []
    },
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      columns: ['selected', 'id', 'username', 'fullName', 'emailAddress', 'name'],
      options: {
        headings: {
          selected: '',
          id: () => 'Id',
          username: () => 'Username',
          fullName: () => 'Full name',
          emailAddress: () => 'Email',
          name: () => 'Institution'
        },
        sortable: ['id', 'username', 'fullName', 'emailAddress', 'name'],
        filterable: ['id', 'username', 'fullName', 'emailAddress', 'name'],
        skin: 'table table-striped table-hover',
        texts: this.getPaginationTexts(),
        perPage: 2147483647,
        perPageValues: [],
        pagination: {
          chunk: 5
        }
      },
      selectedItems: []
    }
  },
  computed: {
    allSelected: function () {
      return this.selectedItems.length > 0
    }
  },
  watch: {
    users: function (newValue, oldValue) {
      this.selectedItems = []
    }
  },
  methods: {
    onSelectionHeaderClicked: function (value) {
      if (value) {
        this.selectedItems = this.users.map(u => u.id)
      } else {
        this.selectedItems = []
      }
    }
  }
}
</script>

<style>

</style>
