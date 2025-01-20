<template>
  <modals-modal v-model="show" :width="300" :processing="processing" height="100%">
    <template #outer>
      <div class="absolute top-11 left-4 z-40" style="max-width: 80%">
        <p class="text-white text-2xl truncate">Profiles</p>
      </div>
    </template>

    <div class="w-full h-full overflow-hidden absolute top-0 left-0 flex items-center justify-center" @click="show = false">
      <div class="w-full overflow-x-hidden overflow-y-auto bg-secondary rounded-lg border border-border" style="max-height: 75%" @click.stop>
        <ul class="h-full w-full" role="listbox" aria-labelledby="listbox-label">
          <template v-for="profile in profiles">
            <li :key="profile.id" class="text-fg select-none relative py-3 cursor-pointer" :class="currentProfileId === profile.id ? 'bg-primary bg-opacity-80' : ''" role="option" @click="clickedOption(profile)">
              <div v-show="currentProfileId === profile.id" class="absolute top-0 left-0 w-0.5 bg-warning h-full" />
              <div class="flex items-center px-3">
                <span class="font-normal block truncate text-lg ml-4">{{ profile.name }}</span>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </modals-modal>
</template>

<script>
export default {
  data() {
    return {
      processing: false
    }
  },
  computed: {
    show: {
      get() {
        return this.$store.state.user.showProfileModal
      },
      set(val) {
        this.$store.commit('user/setShowProfileModal', val)
      }
    },
    currentProfileId() {
      return Boolean(Number(this.$store.state.user.isPersonalLibrary)) ? 'personal-profile' : 'jace-profile'
    },
    profiles() {
      return this.$store.state.user.profiles
    }
  },
  methods: {
    async clickedOption(profile) {
      const isPersonal = profile.id === 'personal-profile' ? 1 : 0
      this.show = false
      if (profile.id === this.currentProfileId) return
      this.$store.commit('user/setIsPersonalLibrary', isPersonal)
      this.$eventBus.$emit('profile-changed', isPersonal)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  },
  mounted() {}
}
</script>
