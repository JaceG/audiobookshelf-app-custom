import { Preferences } from '@capacitor/preferences'

class LocalStorage {
  constructor(vuexStore) {
    this.vuexStore = vuexStore
  }

  async setUserSettings(settings) {
    try {
      await Preferences.set({ key: 'userSettings', value: JSON.stringify(settings) })
    } catch (error) {
      console.error('[LocalStorage] Failed to update user settings', error)
    }
  }

  async getUserSettings() {
    try {
      const settingsObj = (await Preferences.get({ key: 'userSettings' })) || {}
      return settingsObj.value ? JSON.parse(settingsObj.value) : null
    } catch (error) {
      console.error('[LocalStorage] Failed to get user settings', error)
      return null
    }
  }

  async setServerSettings(settings) {
    try {
      await Preferences.set({ key: 'serverSettings', value: JSON.stringify(settings) })
      console.log('Saved server settings', JSON.stringify(settings))
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async setSelectedLibraries(selectedLibraries) {
    try {
      await Preferences.set({ key: 'selectedLibraries', value: JSON.stringify(selectedLibraries) })
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async getSelectedLibraries() {
    try {
      var selectedLibraries = (await Preferences.get({ key: 'selectedLibraries' })) || []
      return selectedLibraries.value ? JSON.parse(selectedLibraries.value) : []
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async setSelectedCollections(selectedCollections) {
    try {
      await Preferences.set({ key: 'selectedCollections', value: JSON.stringify(selectedCollections) })
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async getSelectedCollections() {
    try {
      var selectedCollections = (await Preferences.get({ key: 'selectedCollections' })) || []
      return selectedCollections.value ? JSON.parse(selectedCollections.value) : []
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async setSelectedPlaylist(selectedPlaylist) {
    try {
      console.log('LOCAL store', { selectedPlaylist })
      await Preferences.set({ key: 'selectedPlaylist', value: JSON.stringify(selectedPlaylist) })
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async getSelectedPlaylist() {
    try {
      var selectedPlaylist = (await Preferences.get({ key: 'selectedPlaylist' })) || []
      return selectedPlaylist.value ? JSON.parse(selectedPlaylist.value) : []
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async setIsPersonalLibrary(isPersonalLibrary) {
    try {
      await Preferences.set({ key: 'isPersonalLibrary', value: isPersonalLibrary })
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async getIsPersonalLibrary() {
    try {
      var isPersonalLibrary = (await Preferences.get({ key: 'isPersonalLibrary' })) || {}
      return isPersonalLibrary.value || 0
    } catch (error) {
      console.error('[LocalStorage] Failed to update server settings', error)
    }
  }

  async getServerSettings() {
    try {
      var settingsObj = (await Preferences.get({ key: 'serverSettings' })) || {}
      return settingsObj.value ? JSON.parse(settingsObj.value) : null
    } catch (error) {
      console.error('[LocalStorage] Failed to get server settings', error)
      return null
    }
  }

  async setPlayerSettings(playerSettings) {
    try {
      await Preferences.set({ key: 'playerSettings', value: JSON.stringify(playerSettings) })
    } catch (error) {
      console.error('[LocalStorage] Failed to set player settings', error)
    }
  }

  async getPlayerSettings() {
    try {
      const playerSettingsObj = (await Preferences.get({ key: 'playerSettings' })) || {}
      return playerSettingsObj.value ? JSON.parse(playerSettingsObj.value) : null
    } catch (error) {
      console.error('[LocalStorage] Failed to get player settings', error)
      return false
    }
  }

  async setBookshelfListView(useIt) {
    try {
      await Preferences.set({ key: 'bookshelfListView', value: useIt ? '1' : '0' })
    } catch (error) {
      console.error('[LocalStorage] Failed to set bookshelf list view', error)
    }
  }

  async getBookshelfListView() {
    try {
      var obj = (await Preferences.get({ key: 'bookshelfListView' })) || {}
      return obj.value === '1'
    } catch (error) {
      console.error('[LocalStorage] Failed to get bookshelf list view', error)
      return false
    }
  }

  async setLastLibraryId(libraryId) {
    try {
      await Preferences.set({ key: 'lastLibraryId', value: libraryId })
      console.log('[LocalStorage] Set Last Library Id', libraryId)
    } catch (error) {
      console.error('[LocalStorage] Failed to set last library id', error)
    }
  }

  async removeLastLibraryId() {
    try {
      await Preferences.remove({ key: 'lastLibraryId' })
      console.log('[LocalStorage] Remove Last Library Id')
    } catch (error) {
      console.error('[LocalStorage] Failed to remove last library id', error)
    }
  }

  async getLastLibraryId() {
    try {
      var obj = (await Preferences.get({ key: 'lastLibraryId' })) || {}
      return obj.value || null
    } catch (error) {
      console.error('[LocalStorage] Failed to get last library id', error)
      return false
    }
  }

  async setTheme(theme) {
    try {
      await Preferences.set({ key: 'theme', value: theme })
      console.log('[LocalStorage] Set theme', theme)
    } catch (error) {
      console.error('[LocalStorage] Failed to set theme', error)
    }
  }

  async getTheme() {
    try {
      var obj = (await Preferences.get({ key: 'theme' })) || {}
      return obj.value || null
    } catch (error) {
      console.error('[LocalStorage] Failed to get theme', error)
      return false
    }
  }

  async setLanguage(lang) {
    try {
      await Preferences.set({ key: 'lang', value: lang })
      console.log('[LocalStorage] Set lang', lang)
    } catch (error) {
      console.error('[LocalStorage] Failed to set lang', error)
    }
  }

  async getLanguage() {
    try {
      var obj = (await Preferences.get({ key: 'lang' })) || {}
      return obj.value || null
    } catch (error) {
      console.error('[LocalStorage] Failed to get lang', error)
      return false
    }
  }

  /**
   * Get preference value by key
   *
   * @param {string} key
   * @returns {Promise<string>}
   */
  async getPreferenceByKey(key) {
    try {
      const obj = (await Preferences.get({ key })) || {}
      return obj.value || null
    } catch (error) {
      console.error(`[LocalStorage] Failed to get preference "${key}"`, error)
      return null
    }
  }
}

export default ({ app, store }, inject) => {
  inject('localStore', new LocalStorage(store))
}
