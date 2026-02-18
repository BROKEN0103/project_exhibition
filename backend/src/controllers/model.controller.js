const Model3D = require("../models/Model3D");
const { logActivity } = require("../utils/auditLogger");
const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const { encryptBuffer } = require("../utils/security.utils");

exports.uploadModel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const {
      title,
      description,
      workspaceId,
      folderId,
      previousVersionId
    } = req.body;

    // 1. Read the uploaded file
    const tempPath = req.file.path;
    const fileBuffer = fs.readFileSync(tempPath);

    // 2. Encrypt the file (AES-256)
    // Requirement: "Use AES-256 encryption for stored files."
    const { iv, content: encryptedContent } = encryptBuffer(fileBuffer);

    // 3. Overwrite the file with encrypted content
    fs.writeFileSync(tempPath, encryptedContent);

    let version = 1;
    if (previousVersionId) {
      const prev = await Model3D.findById(previousVersionId);
      if (prev) {
        version = prev.version + 1;
        await Model3D.updateMany({ title: prev.title, workspace: workspaceId }, { isLatest: false });
      }
    }

    const model = await Model3D.create({
      title,
      description,
      fileUrl: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.userId,
      workspace: workspaceId,
      folder: folderId || null,
      isEncrypted: true,
      iv,
      version,
      isLatest: true,
      previousVersion: previousVersionId || null
    });

    logActivity({
      user: req.user.userId,
      userName: req.user.name,
      document: model._id,
      documentTitle: model.title,
      workspaceId,
      action: "upload",
      details: `Uploaded encrypted file version ${version}`,
      ipAddress: req.ip
    });

    res.json(model);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.getModels = async (req, res) => {
  const { workspaceId, folderId } = req.query;
  const filter = { isLatest: true };
  if (workspaceId) filter.workspace = workspaceId;
  if (folderId) filter.folder = folderId;

  try {
    const models = await Model3D.find(filter).populate("uploadedBy", "name email");
    res.json(models);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch models" });
  }
};

exports.getSingleModel = async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id).populate("uploadedBy", "name");
    res.json(model);
  } catch (err) {
    res.status(404).json({ message: "Not found" });
  }
};

// downloadModel removed in favor of contentController.streamContent
