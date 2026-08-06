import { Audio } from 'expo-av';

export class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const response = await Audio.requestPermissionsAsync();
      return response.granted;
    } catch (error) {
      console.warn('Audio permission error:', error);
      return false;
    }
  }

  /**
   * Start recording microphone input
   */
  async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording microphone input and return recorded URI
   */
  async stopRecording(): Promise<string | null> {
    if (!this.recording) return null;
    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  /**
   * Play back AI response audio from URI or URL
   */
  async playAudioResponse(audioUrl: string): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      this.sound = sound;
    } catch (error) {
      console.warn('Playback error (Simulated playback):', error);
    }
  }

  /**
   * Unload resources
   */
  async cleanup(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    if (this.recording) {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
    }
  }
}

export const audioService = new AudioService();
