const Model3D = require("../models/Model3D");
const { logActivity } = require("../utils/auditLogger");
const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const { upsertDocument } = require("../utils/vectorStore");

async function extractAndIndex(model, filePath) {
  if (model.mimeType === "application/pdf") {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      const text = data.text;

      // Simple chunking (e.g., every 1000 chars)
      const chunkSize = 1000;
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
      }

      // Index chunks
      for (let j = 0; j < chunks.length; j++) {
        await upsertDocument(
          `${model._id}_${j}`,
          chunks[j],
          {
            documentId: model._id.toString(),
            documentTitle: model.title,
            workspaceId: model.workspace.toString(),
            chunkIndex: j
          }
        );
      }

      // Save text summary to model
      model.extractedText = text.slice(0, 5000); // Store first 5k chars for quick preview
      await model.save();
    } catch (err) {
      console.error("Extraction/Indexing failed:", err);
    }
  }
}

exports.uploadModel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const {
      title,
      description,
      workspaceId,
      folderId,
      isEncrypted,
      encryptedKey,
      iv,
      previousVersionId
    } = req.body;

    let version = 1;
    if (previousVersionId) {
      const prev = await Model3D.findById(previousVersionId);
      if (prev) {
        version = prev.version + 1;
        // Mark old versions as not latest
        await Model3D.updateMany({ _id: previousVersionId }, { isLatest: false });
        // Actually we might want to update all previous ones just in case
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
      isEncrypted: isEncrypted === "true",
      encryptedKey,
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
      details: `Uploaded ${model.isEncrypted ? 'encrypted ' : ''}file version ${version}`,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    // Trigger background extraction and indexing
    const filePath = path.join(__dirname, "../../uploads", model.fileUrl);
    extractAndIndex(model, filePath);

    res.json(model);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getModels = async (req, res) => {
  const { workspaceId, folderId } = req.query;
  const filter = { $or: [{ isLatest: true }, { isLatest: { $exists: false } }] };
  if (workspaceId) filter.workspace = workspaceId;
  if (folderId) filter.folder = folderId;

  try {
    const models = await Model3D.find(filter).populate("uploadedBy", "name email");
    res.json(models);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch models" });
  }
};

exports.getVersions = async (req, res) => {
  const { title, workspaceId } = req.query;
  try {
    const versions = await Model3D.find({ title, workspace: workspaceId }).sort({ version: -1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch versions" });
  }
};

exports.rollbackVersion = async (req, res) => {
  const { id } = req.params;
  try {
    const versionToRestore = await Model3D.findById(id);
    if (!versionToRestore) return res.status(404).json({ message: "Version not found" });

    // Mark current latest as not latest
    await Model3D.updateMany(
      { title: versionToRestore.title, workspace: versionToRestore.workspace },
      { isLatest: false }
    );

    // Mark this one as latest
    versionToRestore.isLatest = true;
    await versionToRestore.save();

    logActivity({
      user: req.user.userId,
      userName: req.user.name,
      document: versionToRestore._id,
      documentTitle: versionToRestore.title,
      action: "role_change", // Reusing for version change
      details: `Rolled back to version ${versionToRestore.version}`,
      ipAddress: req.ip
    });

    res.json({ message: "Rolled back successfully", model: versionToRestore });
  } catch (err) {
    res.status(500).json({ message: "Rollback failed", error: err.message });
  }
};

exports.getSingleModel = async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id).populate("uploadedBy", "name");

    logActivity({
      user: req.user.userId,
      userName: req.user.name,
      document: model._id,
      documentTitle: model.title,
      action: "view",
      ipAddress: req.ip
    });

    res.json(model);
  } catch (err) {
    res.status(404).json({ message: "Not found" });
  }
};

exports.downloadModel = async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id);
    if (!model) return res.status(404).json({ message: "File not found" });

    // Access Control check (Role)
    // Subscription check (e.g. only premium can download 4K)
    // if (model.size > 100000000 && req.user.subscriptionStatus === 'free') ...

    const filePath = path.join(__dirname, "../../uploads", model.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Physical file missing" });
    }

    logActivity({
      user: req.user.userId,
      userName: req.user.name,
      document: model._id,
      documentTitle: model.title,
      workspaceId: model.workspace,
      action: "download",
      details: "Secure download",
      ipAddress: req.ip
    });

    res.download(filePath, model.title); // Sets proper headers
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Download failed" });
  }
};
