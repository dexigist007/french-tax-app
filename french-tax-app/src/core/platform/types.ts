
export interface PlatformAdapter {
  platform: 'electron' | 'capacitor' | 'web';
  
  /**
   * Writes a file to the platform's file system (for exports).
   * @param fileName Name of the file
   * @param data Data to write (string or blob)
   * @param mimeType Mime type of the file
   */
  saveFile(fileName: string, data: string | Blob, mimeType: string): Promise<void>;
  
  /**
   * Shares a file using the native share sheet (mobile) or opens file dialog (desktop).
   */
  shareFile(fileName: string, data: string | Blob, mimeType: string): Promise<void>;

  /**
   * Gets the base directory for persistent storage if needed (mostly handled by IDB, but useful for backups)
   */
  getDataDir(): Promise<string>;
}
