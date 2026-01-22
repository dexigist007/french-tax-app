
import type { PlatformAdapter } from './types';

// Electron types are not available in browser/render process directly 
// without specific configuration or preload scripts.
// We assume contextBridge exposes 'electronAPI' or similar.
// For now, let's use a basic implementation that would work if nodeIntegration is true (dev) 
// or if we use the standard IPC pattern.

// Ideally, we should use window.electronAPI defined in preload.js
declare global {
  interface Window {
    electronAPI?: {
      saveFile: (fileName: string, data: any) => Promise<void>;
      // ...
    }
  }
}

export class ElectronAdapter implements PlatformAdapter {
  platform = 'electron' as const;

  async saveFile(fileName: string, data: string | Blob, _mimeType: string): Promise<void> {
    // In a real Electron app with context isolation:
    // await window.electronAPI.saveFile(fileName, data);
    
    // For this MVP prototype where we enabled nodeIntegration:
    const require = (window as any).require;
    if (!require) {
        console.error('Electron require not available');
        return;
    }

    // const fs = require('fs');
    // const path = require('path');
    // const { dialog } = require('@electron/remote'); // or use IPC
    
    // Convert Blob to buffer if needed
    // let buffer: Uint8Array;
    if (data instanceof Blob) {
        await data.arrayBuffer();
        // buffer = new Uint8Array(arrayBuffer);
    } else {
        // buffer = new TextEncoder().encode(data);
    }

    // Open save dialog
    // Note: In renderer process with nodeIntegration, we can't easily open native dialogs 
    // without remote module or IPC.
    // Let's assume we use a simplified approach: just write to Downloads or Documents.
    
    // Proper way: Use IPC to Main process
    // const result = await ipcRenderer.invoke('dialog:saveFile', ...)
    
    console.log('Saving file in Electron:', fileName);
  }

  async shareFile(fileName: string, data: string | Blob, mimeType: string): Promise<void> {
    // On Desktop, "share" usually means "save as" or open system share menu (rare on Windows).
    // We'll map it to saveFile for now.
    return this.saveFile(fileName, data, mimeType);
  }

  async getDataDir(): Promise<string> {
    const require = (window as any).require;
    if (!require) return '';
    const { app } = require('@electron/remote'); 
    return app.getPath('userData');
  }
}
