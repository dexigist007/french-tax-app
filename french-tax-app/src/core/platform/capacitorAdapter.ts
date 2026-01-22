
import type { PlatformAdapter } from './types';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export class CapacitorAdapter implements PlatformAdapter {
  platform = 'capacitor' as const;

  async saveFile(fileName: string, data: string | Blob, _mimeType: string): Promise<void> {
    // For simple string data (like CSV)
    if (typeof data === 'string') {
        await Filesystem.writeFile({
            path: fileName,
            data: data,
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });
    } else {
        // For Blob (PDF), we need to convert to base64
        const base64 = await this.blobToBase64(data);
        await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Documents
        });
    }
  }

  async shareFile(fileName: string, data: string | Blob, mimeType: string): Promise<void> {
    // First save the file locally
    await this.saveFile(fileName, data, mimeType);
    
    // Get the full URI
    const uriResult = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName
    });

    // Share it
    await Share.share({
        title: fileName,
        text: 'Voici votre fichier exporté',
        url: uriResult.uri,
        dialogTitle: 'Partager le fichier'
    });
  }

  async getDataDir(): Promise<string> {
    const uri = await Filesystem.getUri({
        directory: Directory.Data,
        path: ''
    });
    return uri.uri;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // remove data:application/pdf;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.readAsDataURL(blob);
    });
  }
}
