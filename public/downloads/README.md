# APK Download Directory

This directory contains the Aquabridge mobile application APK files for admin distribution.

## File Structure

```
public/downloads/
├── README.md (this file)
├── aquabridge-app-v1.2.0.apk (current version)
├── aquabridge-app-v1.1.5.apk (previous version)
└── aquabridge-app-v1.1.0.apk (older version)
```

## How to Add New APK Versions

1. **Place APK File**: Add your new APK file to this directory with the naming convention:
   ```
   aquabridge-app-v{VERSION}.apk
   ```
   Example: `aquabridge-app-v1.3.0.apk`

2. **Update Component**: Edit `src/components/AppDownload.jsx` and update:
   - `currentVersion` object with new version details
   - `apkFilePath` to point to the new file
   - `apkFileName` with the new filename
   - Add new version to `versionHistory` array

3. **Version Information to Update**:
   ```javascript
   const currentVersion = {
     version: "1.3.0",           // New version number
     build: "20250115",          // Build date or number
     releaseDate: "January 15, 2025", // Release date
     fileSize: "13.2 MB",        // File size
     minAndroidVersion: "7.0 (API 24)", // Minimum Android version
     downloadCount: 1500         // Total downloads (increment this)
   }
   ```

4. **Update APK Path**:
   ```javascript
   const apkFilePath = "/downloads/aquabridge-app-v1.3.0.apk"
   const apkFileName = "aquabridge-app-v1.3.0.apk"
   ```

## Security Notes

- Only place APK files that have been properly signed and tested
- Ensure APK files are virus-free before uploading
- Consider implementing file integrity checks (MD5/SHA256 hashes)
- Keep older versions for rollback purposes if needed

## File Size Considerations

- Large APK files (>50MB) may need special handling
- Consider implementing progress indicators for large downloads
- For very large files, consider using cloud storage with signed URLs

## Testing

After adding a new APK:
1. Test the download functionality in the admin panel
2. Verify the file downloads correctly
3. Check that the version information displays properly
4. Test on different devices and browsers

## Backup

- Keep backups of all APK versions
- Consider storing APKs in version control or cloud storage
- Document release notes for each version
