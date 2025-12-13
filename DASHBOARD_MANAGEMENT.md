# Dashboard Management System

## Overview

The Standalone IoT Dashboard Renderer now includes a comprehensive dashboard management system with persistent localStorage storage. This allows users to manage multiple dashboards, with all configurations automatically saved and persisted across browser sessions.

## Features

### 1. **Persistent Storage**
- All dashboards are automatically saved to browser localStorage
- Dashboards persist across page refreshes and browser restarts
- No server or database required - fully client-side storage

### 2. **Multi-Dashboard Management**
- Add unlimited dashboards through JSON import
- View all saved dashboards in an organized list
- Quick dashboard switching without reconfiguration
- Track dashboard metadata (name, description, creation/update times)

### 3. **Dashboard Operations**

#### **Import Dashboard**
- Upload JSON dashboard configuration files
- Automatic validation and storage
- Instant availability after import

#### **Export Dashboard**
- Download any dashboard as a JSON file
- Portable configurations for backup or sharing
- Timestamped filenames for easy organization

#### **Delete Dashboard**
- Remove unwanted dashboards
- Confirmation dialog to prevent accidents
- Automatic cleanup of active dashboard references

#### **Load Dashboard**
- Click any dashboard in the list to load it
- Visual indication of currently selected dashboard
- Quick switching between multiple dashboards

## User Interface

### Configuration Screen

**Saved Dashboards Section**
- Displays all stored dashboards
- Shows dashboard metadata:
  - Name and description
  - Number of pages and widgets
  - Last updated date
- Action buttons for each dashboard:
  - Export (download JSON)
  - Delete (remove from storage)
- Collapsible section to save screen space
- Scrollable list for many dashboards

**Add New Dashboard Section**
- File upload for JSON import
- Automatic save on successful import
- Visual feedback on selected dashboard

**WebSocket Configuration**
- URL and connection ID settings
- Persistent across sessions
- Shared across all dashboards

### Runtime View

**Dashboard Header**
- Current dashboard name display
- WebSocket connection info
- Dashboard counter (e.g., "2 of 5 dashboards")
- Export button for quick backup
- Switch/Reconfigure button for navigation

## Storage Architecture

### localStorage Keys

```javascript
// All dashboard configurations
'standalone_dashboards' → Array<StoredDashboard>

// Currently active dashboard ID
'standalone_active_dashboard_id' → string

// WebSocket settings (shared)
'standalone_ws_url' → string
'standalone_conn_id' → string
```

### Data Structure

```typescript
interface StoredDashboard {
  id: string;                      // Unique identifier
  name: string;                    // Dashboard name
  description?: string;            // Optional description
  config: IoTDashboardConfig;     // Full dashboard configuration
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}
```

## Usage Guide

### Adding Your First Dashboard

1. **Import Dashboard JSON**
   - Click "Upload Dashboard JSON File"
   - Select your `.json` dashboard configuration
   - Dashboard is automatically saved and selected

2. **Configure WebSocket**
   - Enter your WebSocket server URL
   - Set a unique connection ID
   - Settings are saved for all dashboards

3. **Start Renderer**
   - Click "Start Renderer" button
   - Dashboard loads in runtime mode
   - All settings persist for next session

### Managing Multiple Dashboards

1. **View Saved Dashboards**
   - Expand "Saved Dashboards" section
   - See all your imported dashboards
   - Review metadata and widget counts

2. **Switch Dashboards**
   - Click on any dashboard in the list
   - Dashboard is loaded and marked as active
   - WebSocket settings remain unchanged

3. **Export Dashboard**
   - Click the download icon on any dashboard
   - JSON file downloads automatically
   - Use for backup or sharing

4. **Delete Dashboard**
   - Click the trash icon on any dashboard
   - Confirm deletion in dialog
   - Dashboard removed from storage

### Session Persistence

**On Page Load:**
- Previously active dashboard automatically loads
- WebSocket settings restore from storage
- Dashboard list populates from localStorage

**On Browser Restart:**
- All dashboards remain available
- Active dashboard selection persists
- Configuration settings preserved

## API Reference

### Dashboard Storage Utilities

Located in `src/utils/dashboardStorage.ts`

#### Core Functions

```typescript
// Get all stored dashboards
getAllDashboards(): StoredDashboard[]

// Get specific dashboard by ID
getDashboardById(id: string): StoredDashboard | null

// Save new or update existing dashboard
saveDashboard(config: IoTDashboardConfig, existingId?: string): StoredDashboard

// Delete dashboard by ID
deleteDashboard(id: string): boolean

// Set active dashboard
setActiveDashboardId(id: string): void

// Get active dashboard
getActiveDashboard(): StoredDashboard | null

// Import from JSON file
importDashboardFromFile(file: File): Promise<IoTDashboardConfig>

// Export to JSON file
exportDashboardToFile(dashboard: StoredDashboard): void

// Clear all dashboards (destructive)
clearAllDashboards(): void
```

## Storage Limits

### Browser localStorage Limits

- **Typical Limit**: 5-10 MB per domain
- **Dashboard Size**: Varies (typically 10-500 KB per dashboard)
- **Estimated Capacity**: 20-100 dashboards (depending on complexity)

### Best Practices

1. **Regular Exports**
   - Export important dashboards as backup
   - Store JSON files externally for disaster recovery

2. **Cleanup**
   - Delete unused dashboards periodically
   - Monitor browser storage if importing many dashboards

3. **Validation**
   - Test imported dashboards before deletion
   - Keep original JSON files as master copies

## Migration & Backup

### Manual Backup

1. Export all dashboards individually
2. Store JSON files in secure location
3. Optional: Create consolidated backup archive

### Restore Process

1. Import JSON files one by one
2. Verify each dashboard loads correctly
3. Set active dashboard as needed

### Bulk Operations

For advanced users who need to manage many dashboards:

```javascript
// Browser Console Commands

// Export all dashboards
const dashboards = JSON.parse(localStorage.getItem('standalone_dashboards'));
console.log(JSON.stringify(dashboards, null, 2));

// Import bulk dashboards
const bulkData = [...]; // Your dashboard array
localStorage.setItem('standalone_dashboards', JSON.stringify(bulkData));
window.location.reload();
```

## Troubleshooting

### Dashboard Not Loading

**Symptoms**: Dashboard list empty after refresh

**Solutions**:
1. Check browser localStorage is enabled
2. Verify no browser extensions blocking storage
3. Check browser console for errors
4. Try importing dashboard again

### Storage Quota Exceeded

**Symptoms**: Error when importing new dashboard

**Solutions**:
1. Delete unused dashboards
2. Export and remove large dashboards
3. Clear browser cache (preserves dashboards)
4. Use browser's storage management tools

### Corrupted Data

**Symptoms**: Dashboard list shows but won't load

**Solutions**:
1. Open browser console
2. Run: `localStorage.removeItem('standalone_dashboards')`
3. Re-import dashboards from JSON backups
4. Contact support with error messages

## Security Considerations

### localStorage Security

⚠️ **Important Notes**:
- localStorage data is stored unencrypted
- Accessible to JavaScript running on the same domain
- Persists until explicitly cleared

### Recommendations

1. **Network Security**
   - Use on trusted, isolated networks only
   - Deploy behind firewall for industrial use
   - Avoid storing sensitive information in dashboards

2. **Access Control**
   - Rely on network-level authentication
   - Use browser profiles for multi-user systems
   - Implement device-level access controls

3. **Data Protection**
   - Regular backups of critical dashboards
   - Version control for dashboard configurations
   - Test disaster recovery procedures

## Advanced Features

### Dashboard Versioning

Track changes manually:
1. Export dashboard before modifications
2. Rename with version number (e.g., `dashboard_v1.2.json`)
3. Keep version history externally
4. Import previous versions as needed

### Dashboard Templates

Create reusable templates:
1. Design base dashboard configuration
2. Export as template JSON
3. Import and modify for new instances
4. Maintain template library externally

### Bulk Management

For managing multiple installations:
1. Create centralized dashboard repository
2. Export standardized configurations
3. Distribute JSON files to all installations
4. Import via file upload on each system

## Future Enhancements

Potential improvements being considered:

- [ ] Dashboard duplication within UI
- [ ] Search and filter dashboards
- [ ] Dashboard tags and categories
- [ ] Import/export all dashboards (bulk)
- [ ] Dashboard version history
- [ ] Cloud sync option (optional)
- [ ] Dashboard templates library
- [ ] Usage analytics per dashboard

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify JSON dashboard format
3. Test with sample dashboard
4. Review this documentation
5. Contact system administrator

---

**Last Updated**: 2025-12-13  
**Version**: 1.0.0
