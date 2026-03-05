// Test script for File Management API
// Run this with: node testFileManagement.js

const baseURL = 'https://project-exhibition.onrender.com/api';

// You'll need to replace this with a valid JWT token from your login
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
};

async function testEndpoints() {
    console.log('🧪 Testing File Management Endpoints\n');

    try {
        // Test 1: Get workspaces
        console.log('1️⃣ Testing GET /api/workspaces');
        const workspacesRes = await fetch(`${baseURL}/workspaces`, { headers });
        const workspaces = await workspacesRes.json();
        console.log('✅ Workspaces:', workspaces.length, 'found');
        console.log('');

        if (workspaces.length > 0) {
            const workspaceId = workspaces[0]._id;

            // Test 2: Get workspace stats
            console.log('2️⃣ Testing GET /api/workspaces/:id/stats');
            const statsRes = await fetch(`${baseURL}/workspaces/${workspaceId}/stats`, { headers });
            const stats = await statsRes.json();
            console.log('✅ Workspace Stats:');
            console.log('   - Files:', stats.fileCount);
            console.log('   - Folders:', stats.folderCount);
            console.log('   - Total Size:', (stats.totalSize / 1024 / 1024).toFixed(2), 'MB');
            console.log('');

            // Test 3: Get folders
            console.log('3️⃣ Testing GET /api/folders');
            const foldersRes = await fetch(`${baseURL}/folders?workspaceId=${workspaceId}`, { headers });
            const folders = await foldersRes.json();
            console.log('✅ Folders:', folders.length, 'found');
            console.log('');

            // Test 4: Get folder tree
            console.log('4️⃣ Testing GET /api/folders/tree/view');
            const treeRes = await fetch(`${baseURL}/folders/tree/view?workspaceId=${workspaceId}`, { headers });
            const tree = await treeRes.json();
            console.log('✅ Folder Tree:', JSON.stringify(tree, null, 2).substring(0, 200), '...');
            console.log('');

            // Test 5: Get storage stats
            console.log('5️⃣ Testing GET /api/file-management/stats/storage');
            const storageRes = await fetch(`${baseURL}/file-management/stats/storage?workspaceId=${workspaceId}`, { headers });
            const storage = await storageRes.json();
            console.log('✅ Storage Stats:');
            console.log('   - Total Files:', storage.totalFiles);
            console.log('   - Total Size:', (storage.totalSize / 1024 / 1024).toFixed(2), 'MB');
            console.log('   - Encrypted:', storage.encryptedCount);
            console.log('');

            // Test 6: Get models (files)
            console.log('6️⃣ Testing GET /api/models');
            const modelsRes = await fetch(`${baseURL}/models?workspaceId=${workspaceId}`, { headers });
            const models = await modelsRes.json();
            console.log('✅ Files:', models.length, 'found');

            if (models.length > 0) {
                const fileId = models[0]._id;

                // Test 7: Get file metadata
                console.log('');
                console.log('7️⃣ Testing GET /api/file-management/:id/metadata');
                const metadataRes = await fetch(`${baseURL}/file-management/${fileId}/metadata`, { headers });
                const metadata = await metadataRes.json();
                console.log('✅ File Metadata:');
                console.log('   - Title:', metadata.title);
                console.log('   - Size:', (metadata.size / 1024).toFixed(2), 'KB');
                console.log('   - File Exists:', metadata.fileExists);
                console.log('');
            }
        }

        console.log('✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Instructions
console.log('📋 File Management API Test Script');
console.log('=====================================\n');
console.log('⚠️  Before running this script:');
console.log('1. Make sure the backend server is running (npm run dev)');
console.log('2. Login to get a JWT token');
console.log('3. Replace AUTH_TOKEN in this file with your token');
console.log('4. Run: node testFileManagement.js\n');

if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Please set AUTH_TOKEN first!\n');
    console.log('To get a token:');
    console.log('1. POST to /api/auth/login with your credentials');
    console.log('2. Copy the token from the response');
    console.log('3. Update AUTH_TOKEN in this file\n');
} else {
    testEndpoints();
}
