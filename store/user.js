import { Browser } from '@capacitor/browser'

export const state = () => ({
  user: null,
  serverConnectionConfig: null,
  selectedLibraries: [],
  selectedCollections: [],
  selectedPlaylist: [],
  isPersonalLibrary: 1,
  showProfileModal: false,
  profiles: [
    {
      id: 'personal-profile',
      name: 'My Library'
    },
    {
      id: 'jace-profile',
      name: "Jace's Library"
    }
  ],
  settings: {
    mobileOrderBy: 'addedAt',
    mobileOrderDesc: true,
    mobileFilterBy: 'all',
    playbackRate: 1,
    collapseSeries: false,
    collapseBookSeries: false
  }
})

export const getters = {
  getIsRoot: (state) => state.user && state.user.type === 'root',
  getIsAdminOrUp: (state) => state.user && (state.user.type === 'admin' || state.user.type === 'root'),
  getToken: (state) => {
    return state.user?.token || null
  },
  getServerConnectionConfigId: (state) => {
    return state.serverConnectionConfig?.id || null
  },
  getServerAddress: (state) => {
    return state.serverConnectionConfig?.address || null
  },
  getServerConfigName: (state) => {
    return state.serverConnectionConfig?.name || null
  },
  getCustomHeaders: (state) => {
    return state.serverConnectionConfig?.customHeaders || null
  },
  getUserMediaProgress:
    (state) =>
    (libraryItemId, episodeId = null) => {
      if (!state.user?.mediaProgress) return null
      return state.user.mediaProgress.find((li) => {
        if (episodeId && li.episodeId !== episodeId) return false
        return li.libraryItemId == libraryItemId
      })
    },
  getUserBookmarksForItem: (state) => (libraryItemId) => {
    if (!state?.user?.bookmarks) return []
    return state.user.bookmarks.filter((bm) => bm.libraryItemId === libraryItemId)
  },
  getUserSetting: (state) => (key) => {
    return state.settings?.[key] || null
  },
  getUserCanUpdate: (state) => {
    return !!state.user?.permissions?.update
  },
  getUserCanDelete: (state) => {
    return !!state.user?.permissions?.delete
  },
  getUserCanDownload: (state) => {
    return !!state.user?.permissions?.download
  },
  selectedLibraries: (state) => {
    return state.selectedLibraries
  },
  isPersonalLibrary: (state) => {
    return state.isPersonalLibrary
  },
  showProfileModal: (state) => {
    return state.showProfileModal
  },
  profiles: (state) => {
    return state.profiles
  },
  selectedCollections(state) {
    return state.selectedCollections
  },
  selectedPlaylist(state) {
    return state.selectedPlaylist
  }
}

export const actions = {
  // When changing libraries make sure sort and filter is still valid
  checkUpdateLibrarySortFilter({ state, dispatch, commit }, mediaType) {
    const settingsUpdate = {}
    if (mediaType == 'podcast') {
      if (state.settings.mobileOrderBy == 'media.metadata.authorName' || state.settings.mobileOrderBy == 'media.metadata.authorNameLF') {
        settingsUpdate.mobileOrderBy = 'media.metadata.author'
      }
      if (state.settings.mobileOrderBy == 'media.duration') {
        settingsUpdate.mobileOrderBy = 'media.numTracks'
      }
      if (state.settings.mobileOrderBy == 'media.metadata.publishedYear') {
        settingsUpdate.mobileOrderBy = 'media.metadata.title'
      }
      const invalidFilters = ['series', 'authors', 'narrators', 'languages', 'progress', 'issues']
      const filterByFirstPart = (state.settings.mobileFilterBy || '').split('.').shift()
      if (invalidFilters.includes(filterByFirstPart)) {
        settingsUpdate.mobileFilterBy = 'all'
      }
    } else {
      if (state.settings.mobileOrderBy == 'media.metadata.author') {
        settingsUpdate.mobileOrderBy = 'media.metadata.authorName'
      }
      if (state.settings.mobileOrderBy == 'media.numTracks') {
        settingsUpdate.mobileOrderBy = 'media.duration'
      }
    }
    if (Object.keys(settingsUpdate).length) {
      dispatch('updateUserSettings', settingsUpdate)
    }
  },
  async updateUserSettings({ state, commit }, payload) {
    if (!payload) return false

    let hasChanges = false
    const existingSettings = { ...state.settings }
    for (const key in existingSettings) {
      if (payload[key] !== undefined && existingSettings[key] !== payload[key]) {
        hasChanges = true
        existingSettings[key] = payload[key]
      }
    }
    if (hasChanges) {
      commit('setSettings', existingSettings)
      await this.$localStore.setUserSettings(existingSettings)
      this.$eventBus.$emit('user-settings', state.settings)
    }
  },
  async loadUserSettings({ state, commit }) {
    const userSettingsFromLocal = await this.$localStore.getUserSettings()

    if (userSettingsFromLocal) {
      const userSettings = { ...state.settings }
      for (const key in userSettings) {
        if (userSettingsFromLocal[key] !== undefined) {
          userSettings[key] = userSettingsFromLocal[key]
        }
      }
      commit('setSettings', userSettings)
      this.$eventBus.$emit('user-settings', state.settings)
    }
  },
  async openWebClient({ getters }, path = null) {
    const serverAddress = getters.getServerAddress
    if (!serverAddress) {
      console.error('openWebClient: No server address')
      return
    }
    try {
      let url = serverAddress.replace(/\/$/, '') // Remove trailing slash
      if (path?.startsWith('/')) url += path

      await Browser.open({ url })
    } catch (error) {
      console.error('Error opening browser', error)
    }
  }
}

export const mutations = {
  logout(state) {
    state.user = null
    state.serverConnectionConfig = null
  },
  setUser(state, user) {
    state.user = user
  },
  removeMediaProgress(state, id) {
    if (!state.user) return
    state.user.mediaProgress = state.user.mediaProgress.filter((mp) => mp.id != id)
  },
  updateUserMediaProgress(state, data) {
    if (!data || !state.user) return
    const mediaProgressIndex = state.user.mediaProgress.findIndex((mp) => mp.id === data.id)
    if (mediaProgressIndex >= 0) {
      state.user.mediaProgress.splice(mediaProgressIndex, 1, data)
    } else {
      state.user.mediaProgress.push(data)
    }
  },
  setServerConnectionConfig(state, serverConnectionConfig) {
    state.serverConnectionConfig = serverConnectionConfig
  },
  setSettings(state, settings) {
    if (!settings) return
    state.settings = settings
  },
  updateBookmark(state, bookmark) {
    if (!state.user?.bookmarks) return
    state.user.bookmarks = state.user.bookmarks.map((bm) => {
      if (bm.libraryItemId === bookmark.libraryItemId && bm.time === bookmark.time) {
        return bookmark
      }
      return bm
    })
  },
  deleteBookmark(state, { libraryItemId, time }) {
    if (!state.user?.bookmarks) return
    state.user.bookmarks = state.user.bookmarks.filter((bm) => {
      if (bm.libraryItemId === libraryItemId && bm.time === time) return false
      return true
    })
  },
  selectedLibraries(state, selectedLibrariesList) {
    console.log({ selectedLibrariesList })
    state.selectedLibraries = selectedLibrariesList
    this.$localStore.setSelectedLibraries(selectedLibrariesList)
    return state
  },
  setIsPersonalLibrary(state, isPersonalLibrary) {
    state.isPersonalLibrary = isPersonalLibrary
    this.$localStore.setIsPersonalLibrary(isPersonalLibrary)
    return state
  },
  setShowProfileModal: (state, showProfileModal) => {
    state.showProfileModal = showProfileModal
    return state
  },
  selectedCollection(state, selectedCollections) {
    state.selectedCollections = selectedCollections
    this.$localStore.setSelectedCollections(selectedCollections)
    return state
  },
  selectedPlaylist(state, selectedPlaylist) {
    state.selectedPlaylist = selectedPlaylist
    console.log('store', { selectedPlaylist })
    this.$localStore.setSelectedPlaylist(selectedPlaylist)
    return state
  }
}
