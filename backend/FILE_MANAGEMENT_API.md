# File and Workspace Management API Documentation

This document provides comprehensive documentation for managing files, folders, and workspaces in the SIC MUNDUS system.

## Table of Contents
1. [File Management](#file-management)
2. [Folder Management](#folder-management)
3. [Workspace Management](#workspace-management)

---

## File Management

Base URL: `/api/file-management`

### 1. Delete File
**DELETE** `/api/file-management/:id`

Deletes a file and its physical storage.

**Authorization:** Required (Admin/Editor)

**Response:**
```json
{
  "message": "File deleted successfully",
  "file": { /* deleted file object */ }
}
```

---

### 2. Move File
**PUT** `/api/file-management/:id/move`

Moves a file to a different folder or workspace.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "targetFolderId": "folder_id_or_null",
  "targetWorkspaceId": "workspace_id"
}
```

**Response:**
```json
{
  "message": "File moved successfully",
  "file": { /* updated file object */ }
}
```

---

### 3. Rename File
**PUT** `/api/file-management/:id/rename`

Renames a file and updates its description.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "newTitle": "New File Name",
  "newDescription": "Updated description"
}
```

**Response:**
```json
{
  "message": "File renamed successfully",
  "file": { /* updated file object */ }
}
```

---

### 4. Copy File
**POST** `/api/file-management/:id/copy`

Creates a copy of a file.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "targetFolderId": "folder_id_or_null",
  "targetWorkspaceId": "workspace_id",
  "newTitle": "Copy of File Name"
}
```

**Response:**
```json
{
  "message": "File copied successfully",
  "file": { /* new file object */ }
}
```

---

### 5. Get File Metadata
**GET** `/api/file-management/:id/metadata`

Retrieves detailed metadata about a file.

**Authorization:** Required

**Response:**
```json
{
  "_id": "file_id",
  "title": "File Name",
  "description": "File description",
  "fileUrl": "filename.ext",
  "mimeType": "application/pdf",
  "size": 1024000,
  "uploadedBy": { "name": "User Name", "email": "user@example.com" },
  "workspace": { "name": "Workspace Name" },
  "folder": { "name": "Folder Name", "path": "/parent/" },
  "fileExists": true,
  "fileStats": {
    "size": 1024000,
    "created": "2026-01-01T00:00:00.000Z",
    "modified": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### 6. Bulk Delete Files
**POST** `/api/file-management/bulk/delete`

Deletes multiple files at once.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "fileIds": ["file_id_1", "file_id_2", "file_id_3"]
}
```

**Response:**
```json
{
  "message": "Successfully deleted 3 files",
  "deletedCount": 3
}
```

---

### 7. Bulk Move Files
**POST** `/api/file-management/bulk/move`

Moves multiple files to a new location.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "fileIds": ["file_id_1", "file_id_2"],
  "targetFolderId": "folder_id_or_null",
  "targetWorkspaceId": "workspace_id"
}
```

**Response:**
```json
{
  "message": "Successfully moved 2 files",
  "modifiedCount": 2
}
```

---

### 8. Get Storage Statistics
**GET** `/api/file-management/stats/storage?workspaceId=xxx&folderId=xxx`

Gets storage statistics for a workspace or folder.

**Authorization:** Required

**Query Parameters:**
- `workspaceId` (optional): Filter by workspace
- `folderId` (optional): Filter by folder

**Response:**
```json
{
  "totalFiles": 15,
  "totalSize": 52428800,
  "fileTypes": {
    "application/pdf": { "count": 5, "size": 10485760 },
    "image/png": { "count": 10, "size": 41943040 }
  },
  "encryptedCount": 3,
  "latestFiles": 15
}
```

---

## Folder Management

Base URL: `/api/folders`

### 1. Create Folder
**POST** `/api/folders`

Creates a new folder.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "name": "New Folder",
  "workspaceId": "workspace_id",
  "parentId": "parent_folder_id_or_null"
}
```

**Response:**
```json
{
  "_id": "folder_id",
  "name": "New Folder",
  "workspace": "workspace_id",
  "parent": "parent_folder_id",
  "path": "/parent/",
  "createdBy": "user_id"
}
```

---

### 2. Get Folders
**GET** `/api/folders?workspaceId=xxx&parentId=xxx`

Lists folders in a workspace or parent folder.

**Authorization:** Required

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `parentId` (optional): Parent folder ID (null for root)

**Response:**
```json
[
  {
    "_id": "folder_id",
    "name": "Folder Name",
    "workspace": "workspace_id",
    "parent": null,
    "path": "/"
  }
]
```

---

### 3. Delete Folder
**DELETE** `/api/folders/:id?deleteContents=true`

Deletes a folder and optionally its contents.

**Authorization:** Required (Admin/Editor)

**Query Parameters:**
- `deleteContents` (optional): Set to "true" to delete all contents

**Response:**
```json
{
  "message": "Folder deleted successfully",
  "folder": { /* deleted folder object */ }
}
```

---

### 4. Rename Folder
**PUT** `/api/folders/:id/rename`

Renames a folder.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "newName": "New Folder Name"
}
```

**Response:**
```json
{
  "message": "Folder renamed successfully",
  "folder": { /* updated folder object */ }
}
```

---

### 5. Move Folder
**PUT** `/api/folders/:id/move`

Moves a folder to a different parent or workspace.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "targetParentId": "new_parent_id_or_null",
  "targetWorkspaceId": "workspace_id"
}
```

**Response:**
```json
{
  "message": "Folder moved successfully",
  "folder": { /* updated folder object */ }
}
```

---

### 6. Copy Folder
**POST** `/api/folders/:id/copy`

Creates a copy of a folder.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "targetParentId": "parent_id_or_null",
  "targetWorkspaceId": "workspace_id",
  "newName": "Folder Copy",
  "copyContents": true
}
```

**Response:**
```json
{
  "message": "Folder copied successfully",
  "folder": { /* new folder object */ }
}
```

---

### 7. Get Folder Contents
**GET** `/api/folders/:id/contents`

Gets all files and subfolders in a folder.

**Authorization:** Required

**Response:**
```json
{
  "folder": { /* folder object */ },
  "subfolders": [ /* array of subfolder objects */ ],
  "files": [ /* array of file objects */ ],
  "stats": {
    "subfolderCount": 3,
    "fileCount": 10,
    "totalSize": 52428800
  }
}
```

---

### 8. Get Folder Tree
**GET** `/api/folders/tree/view?workspaceId=xxx`

Gets the complete folder hierarchy for a workspace.

**Authorization:** Required

**Query Parameters:**
- `workspaceId` (required): Workspace ID

**Response:**
```json
[
  {
    "_id": "folder_id",
    "name": "Root Folder",
    "fileCount": 5,
    "children": [
      {
        "_id": "subfolder_id",
        "name": "Subfolder",
        "fileCount": 2,
        "children": []
      }
    ]
  }
]
```

---

## Workspace Management

Base URL: `/api/workspaces`

### 1. Create Workspace
**POST** `/api/workspaces`

Creates a new workspace.

**Authorization:** Required (Admin/Editor)

**Request Body:**
```json
{
  "name": "My Workspace",
  "description": "Workspace description"
}
```

**Response:**
```json
{
  "_id": "workspace_id",
  "name": "My Workspace",
  "description": "Workspace description",
  "owner": "user_id",
  "members": [
    { "user": "user_id", "role": "admin" }
  ]
}
```

---

### 2. Get Workspaces
**GET** `/api/workspaces`

Lists all workspaces the user has access to.

**Authorization:** Required

**Response:**
```json
[
  {
    "_id": "workspace_id",
    "name": "Workspace Name",
    "owner": { "name": "Owner Name", "email": "owner@example.com" },
    "members": [ /* array of member objects */ ]
  }
]
```

---

### 3. Delete Workspace
**DELETE** `/api/workspaces/:id?deleteContents=true`

Deletes a workspace and optionally all its contents.

**Authorization:** Required (Owner only)

**Query Parameters:**
- `deleteContents` (optional): Set to "true" to delete all contents

**Response:**
```json
{
  "message": "Workspace deleted successfully",
  "workspace": { /* deleted workspace object */ }
}
```

---

### 4. Update Workspace
**PUT** `/api/workspaces/:id`

Updates workspace details.

**Authorization:** Required (Owner/Admin)

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "settings": {
    "storageLimit": 10737418240,
    "isE2EEnabled": true
  }
}
```

**Response:**
```json
{
  "message": "Workspace updated successfully",
  "workspace": { /* updated workspace object */ }
}
```

---

### 5. Invite Member
**POST** `/api/workspaces/invite`

Invites a user to a workspace.

**Authorization:** Required (Owner/Admin)

**Request Body:**
```json
{
  "workspaceId": "workspace_id",
  "email": "user@example.com",
  "role": "editor"
}
```

**Response:**
```json
{
  "message": "User added successfully",
  "user": { /* invited user object */ }
}
```

---

### 6. Remove Member
**POST** `/api/workspaces/remove-member`

Removes a member from a workspace.

**Authorization:** Required (Owner/Admin)

**Request Body:**
```json
{
  "workspaceId": "workspace_id",
  "userId": "user_id"
}
```

**Response:**
```json
{
  "message": "Member removed successfully",
  "workspace": { /* updated workspace object */ }
}
```

---

### 7. Update Member Role
**POST** `/api/workspaces/update-role`

Updates a member's role in a workspace.

**Authorization:** Required (Owner/Admin)

**Request Body:**
```json
{
  "workspaceId": "workspace_id",
  "userId": "user_id",
  "newRole": "admin"
}
```

**Response:**
```json
{
  "message": "Member role updated successfully",
  "workspace": { /* updated workspace object */ }
}
```

---

### 8. Transfer Ownership
**POST** `/api/workspaces/transfer-ownership`

Transfers workspace ownership to another member.

**Authorization:** Required (Owner only)

**Request Body:**
```json
{
  "workspaceId": "workspace_id",
  "newOwnerId": "user_id"
}
```

**Response:**
```json
{
  "message": "Ownership transferred successfully",
  "workspace": { /* updated workspace object */ }
}
```

---

### 9. Get Workspace Statistics
**GET** `/api/workspaces/:id/stats`

Gets detailed statistics about a workspace.

**Authorization:** Required

**Response:**
```json
{
  "workspace": { /* workspace object */ },
  "folderCount": 10,
  "fileCount": 50,
  "totalSize": 104857600,
  "storageUsedPercentage": 1.0,
  "memberCount": 5,
  "encryptedFileCount": 15,
  "fileTypes": {
    "application/pdf": { "count": 20, "size": 52428800 },
    "image/png": { "count": 30, "size": 52428800 }
  }
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Usage Examples

### Example 1: Upload and Organize Files

```javascript
// 1. Create a workspace
const workspace = await fetch('/api/workspaces', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Project X', description: 'Main project workspace' })
});

// 2. Create a folder
const folder = await fetch('/api/folders', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Documents', workspaceId: workspace._id })
});

// 3. Upload a file (using existing upload endpoint)
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('title', 'Important Document');
formData.append('workspaceId', workspace._id);
formData.append('folderId', folder._id);

const file = await fetch('/api/models', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: formData
});
```

### Example 2: Bulk File Operations

```javascript
// Move multiple files to a different folder
await fetch('/api/file-management/bulk/move', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileIds: ['file1_id', 'file2_id', 'file3_id'],
    targetFolderId: 'new_folder_id'
  })
});

// Delete multiple files
await fetch('/api/file-management/bulk/delete', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileIds: ['file1_id', 'file2_id']
  })
});
```

### Example 3: Workspace Management

```javascript
// Get workspace statistics
const stats = await fetch('/api/workspaces/workspace_id/stats', {
  headers: { 'Authorization': 'Bearer token' }
});

// Invite a team member
await fetch('/api/workspaces/invite', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workspaceId: 'workspace_id',
    email: 'teammate@example.com',
    role: 'editor'
  })
});

// Update member role
await fetch('/api/workspaces/update-role', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workspaceId: 'workspace_id',
    userId: 'user_id',
    newRole: 'admin'
  })
});
```

---

## Notes

- All endpoints require authentication via Bearer token in the Authorization header
- Admin and Editor roles are required for most modification operations
- Workspace owners have exclusive rights to delete workspaces and transfer ownership
- Bulk operations are atomic - if one fails, all fail
- File deletions also remove the physical file from storage
- Moving folders updates all subfolder paths and file workspace references automatically
