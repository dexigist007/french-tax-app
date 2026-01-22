
import type { PlatformAdapter } from './types';
import { CapacitorAdapter } from './capacitorAdapter';
import { ElectronAdapter } from './electronAdapter';
import { Capacitor } from '@capacitor/core';

export class PlatformFactory {
  private static instance: PlatformAdapter;

  static getAdapter(): PlatformAdapter {
    if (this.instance) return this.instance;

    if (Capacitor.isNativePlatform()) {
      this.instance = new CapacitorAdapter();
    } else if (this.isElectron()) {
      this.instance = new ElectronAdapter();
    } else {
      // Fallback for web dev (save as download)
      this.instance = new WebAdapter();
    }

    return this.instance;
  }

  private static isElectron(): boolean {
    return navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
  }
}

class WebAdapter implements PlatformAdapter {
  platform = 'web' as const;

  async saveFile(fileName: string, data: string | Blob, mimeType: string): Promise<void> {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async shareFile(fileName: string, data: string | Blob, mimeType: string): Promise<void> {
    if (navigator.share) {
        const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
        const file = new File([blob], fileName, { type: mimeType });
        try {
            await navigator.share({
                files: [file],
                title: fileName
            });
        } catch (err) {
            // Fallback to save if share fails or cancelled
            await this.saveFile(fileName, data, mimeType);
        }
    } else {
        await this.saveFile(fileName, data, mimeType);
    }
  }

  async getDataDir(): Promise<string> {
    return ''; // Not relevant for Web
  }
}
