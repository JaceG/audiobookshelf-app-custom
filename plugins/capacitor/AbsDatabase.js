import { registerPlugin, Capacitor, WebPlugin } from '@capacitor/core'

class AbsDatabaseWeb extends WebPlugin {
  constructor() {
    super()
  }

  async getDeviceData() {
    var dd = localStorage.getItem('device')
    if (dd) {
      return JSON.parse(dd)
    }
    const deviceData = {
      serverConnectionConfigs: [],
      lastServerConnectionConfigId: null,
      currentLocalPlaybackSession: null,
      deviceSettings: {}
    }
    return deviceData
  }

  async setCurrentServerConnectionConfig(serverConnectionConfig) {
    var deviceData = await this.getDeviceData()

    var ssc = deviceData.serverConnectionConfigs.find((_ssc) => _ssc.id == serverConnectionConfig.id)
    if (ssc) {
      deviceData.lastServerConnectionConfigId = ssc.id
      ssc.name = `${ssc.address} (${serverConnectionConfig.username})`
      ssc.token = serverConnectionConfig.token
      ssc.userId = serverConnectionConfig.userId
      ssc.username = serverConnectionConfig.username
      ssc.customHeaders = serverConnectionConfig.customHeaders || {}
      localStorage.setItem('device', JSON.stringify(deviceData))
    } else {
      ssc = {
        id: encodeURIComponent(Buffer.from(`${serverConnectionConfig.address}@${serverConnectionConfig.username}`).toString('base64')),
        index: deviceData.serverConnectionConfigs.length,
        name: `${serverConnectionConfig.address} (${serverConnectionConfig.username})`,
        userId: serverConnectionConfig.userId,
        username: serverConnectionConfig.username,
        address: serverConnectionConfig.address,
        token: serverConnectionConfig.token,
        customHeaders: serverConnectionConfig.customHeaders || {}
      }
      deviceData.serverConnectionConfigs.push(ssc)
      deviceData.lastServerConnectionConfigId = ssc.id
      localStorage.setItem('device', JSON.stringify(deviceData))
    }
    return ssc
  }

  async removeServerConnectionConfig(serverConnectionConfigCallObject) {
    var serverConnectionConfigId = serverConnectionConfigCallObject.serverConnectionConfigId
    var deviceData = await this.getDeviceData()
    deviceData.serverConnectionConfigs = deviceData.serverConnectionConfigs.filter((ssc) => ssc.id != serverConnectionConfigId)
    localStorage.setItem('device', JSON.stringify(deviceData))
  }

  async logout() {
    var deviceData = await this.getDeviceData()
    deviceData.lastServerConnectionConfigId = null
    localStorage.setItem('device', JSON.stringify(deviceData))
  }

  //
  // For testing on web
  //
  async getLocalFolders() {
    return {
      value: [
        {
          id: 'test1',
          name: 'Audiobooks',
          contentUrl: 'test',
          absolutePath: '/audiobooks',
          simplePath: 'audiobooks',
          storageType: 'primary',
          mediaType: 'book'
        }
      ]
    }
  }
  async getLocalFolder({ folderId }) {
    return this.getLocalFolders().then((data) => data.value[0])
  }
  async getLocalLibraryItems(payload) {
    return {
      value: []
    }
  }
  async getLocalLibraryItemsInFolder({ folderId }) {
    return this.getLocalLibraryItems()
  }
  async getLocalLibraryItem({ id }) {
    return this.getLocalLibraryItems().then((data) => data.value[0])
  }
  async getLocalLibraryItemByLId({ libraryItemId }) {
    return this.getLocalLibraryItems().then((data) => data.value.find((lli) => lli.libraryItemId == libraryItemId))
  }
  async getAllLocalMediaProgress() {
    return {
      value: [
        {
          id: 'local_test',
          localLibraryItemId: 'local_test',
          episodeId: null,
          duration: 100,
          progress: 0.5,
          currentTime: 50,
          isFinished: false,
          lastUpdate: 394089090,
          startedAt: 239048209,
          finishedAt: null
          // For local lib items from server to support server sync
          // var serverConnectionConfigId:String?,
          // var serverAddress:String?,
          // var serverUserId:String?,
          // var libraryItemId:String?
        }
      ]
    }
  }
  async removeLocalMediaProgress({ localMediaProgressId }) {
    return null
  }

  async syncLocalSessionsWithServer({ isFirstSync }) {
    return null
  }

  async syncServerMediaProgressWithLocalMediaProgress(payload) {
    return null
  }

  async updateLocalTrackOrder({ localLibraryItemId, tracks }) {
    return []
  }

  async updateLocalMediaProgressFinished(payload) {
    // { localLibraryItemId, localEpisodeId, isFinished }
    return null
  }

  async updateDeviceSettings(payload) {
    const deviceData = await this.getDeviceData()
    deviceData.deviceSettings = payload
    localStorage.setItem('device', JSON.stringify(deviceData))
    return deviceData
  }

  async getMediaItemHistory({ mediaId }) {
    console.log('Get media item history', mediaId)
    return {
      id: mediaId,
      mediaDisplayTitle: 'Test Book',
      libraryItemId: mediaId,
      episodeId: null,
      isLocal: false,
      serverConnectionConfigId: null,
      serverAddress: null,
      createdAt: Date.now(),
      events: [
        {
          name: 'Pause',
          type: 'Playback',
          description: null,
          currentTime: 81,
          serverSyncAttempted: true,
          serverSyncSuccess: true,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 22 + 13000 // 22 mins ago + 13s
        },
        {
          name: 'Play',
          type: 'Playback',
          description: null,
          currentTime: 68,
          serverSyncAttempted: false,
          serverSyncSuccess: null,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 22 // 22 mins ago
        },
        {
          name: 'Pause',
          type: 'Playback',
          description: null,
          currentTime: 68,
          serverSyncAttempted: true,
          serverSyncSuccess: false,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 + 58000 // 1 hour ago + 58s
        },
        {
          name: 'Save',
          type: 'Playback',
          description: null,
          currentTime: 55,
          serverSyncAttempted: true,
          serverSyncSuccess: true,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 + 45000 // 1 hour ago + 45s
        },
        {
          name: 'Save',
          type: 'Playback',
          description: null,
          currentTime: 40,
          serverSyncAttempted: true,
          serverSyncSuccess: true,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 + 30000 // 1 hour ago + 30s
        },
        {
          name: 'Save',
          type: 'Playback',
          description: null,
          currentTime: 25,
          serverSyncAttempted: true,
          serverSyncSuccess: true,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 + 15000 // 1 hour ago + 15s
        },
        {
          name: 'Play',
          type: 'Playback',
          description: null,
          currentTime: 10,
          serverSyncAttempted: false,
          serverSyncSuccess: null,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 // 1 hour ago
        },
        {
          name: 'Stop',
          type: 'Playback',
          description: null,
          currentTime: 10,
          serverSyncAttempted: true,
          serverSyncSuccess: true,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 * 25 + 10000 // 25 hours ago + 10s
        },
        {
          name: 'Seek',
          type: 'Playback',
          description: null,
          currentTime: 6,
          serverSyncAttempted: true,
          serverSyncSuccess: true,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 * 25 + 2000 // 25 hours ago + 2s
        },
        {
          name: 'Play',
          type: 'Playback',
          description: null,
          currentTime: 0,
          serverSyncAttempted: false,
          serverSyncSuccess: null,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 * 25 // 25 hours ago
        },
        {
          name: 'Play',
          type: 'Playback',
          description: null,
          currentTime: 0,
          serverSyncAttempted: false,
          serverSyncSuccess: null,
          serverSyncMessage: null,
          timestamp: Date.now() - 1000 * 60 * 60 * 50 // 50 hours ago
        }
      ]
    }
  }
}

const AbsDatabase = registerPlugin('AbsDatabase', {
  web: () => new AbsDatabaseWeb()
})

export { AbsDatabase }
