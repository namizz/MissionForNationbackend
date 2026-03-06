const express = require('express');
const multer = require('multer');
const { authRequired, requireRole } = require('../middleware/auth');
const { cloudinary, uploadBufferToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024
  }
});

const anyUploadField = upload.any();

function runMulter(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Max size is 200MB' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: "Unexpected file field. Use form-data key 'file' (or 'image'/'video')." });
        }
        return res.status(400).json({ error: err.message });
      }
      return next(err);
    });
  };
}

function getSingleUploadedFile(req) {
  if (Array.isArray(req.files) && req.files.length > 0) {
    return req.files[0];
  }
  return null;
}

function requireCloudinaryConfig(req, res, next) {
  const hasConfig =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasConfig) {
    return res.status(500).json({ error: 'Cloudinary is not configured on server' });
  }
  next();
}

function mapCloudinaryAsset(resource) {
  return {
    public_id: resource.public_id,
    resource_type: resource.resource_type,
    format: resource.format,
    secure_url: resource.secure_url,
    url: resource.url,
    bytes: resource.bytes,
    created_at: resource.created_at
  };
}

async function listCloudinaryImages(req, res) {
  try {
    const folder = req.query.folder || 'mission-for-nation/images';
    const nextCursor = req.query.next_cursor;
    const maxResultsRaw = Number(req.query.max_results || 100);
    const maxResults = Number.isFinite(maxResultsRaw)
      ? Math.min(Math.max(maxResultsRaw, 1), 500)
      : 100;

    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix: folder,
      max_results: maxResults,
      next_cursor: nextCursor
    });

    const assets = Array.isArray(result.resources)
      ? result.resources.map(mapCloudinaryAsset)
      : [];

    return res.json({
      ok: true,
      assets,
      next_cursor: result.next_cursor || null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch Cloudinary images' });
  }
}

router.get('/upload/images', requireCloudinaryConfig, listCloudinaryImages);
router.get('/upload/image/all', requireCloudinaryConfig, listCloudinaryImages);

router.post(
  '/upload/image',
  authRequired,
  requireRole('super', 'regional_admin'),
  requireCloudinaryConfig,
  runMulter(anyUploadField),
  async (req, res) => {
    try {
      const file = getSingleUploadedFile(req);
      if (!file) return res.status(400).json({ error: 'Missing file in form-data body' });
      if (!file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Only image files are allowed' });

      const folder = req.body.folder || 'mission-for-nation/images';
      const result = await uploadBufferToCloudinary(file.buffer, {
        resource_type: 'image',
        folder
      });

      return res.json({
        ok: true,
        asset: {
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          secure_url: result.secure_url,
          url: result.url,
          bytes: result.bytes,
          created_at: result.created_at
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err?.message || 'Image upload failed' });
    }
  }
);

router.post(
  '/upload/video',
  authRequired,
  requireRole('super', 'regional_admin'),
  requireCloudinaryConfig,
  runMulter(anyUploadField),
  async (req, res) => {
    try {
      const file = getSingleUploadedFile(req);
      if (!file) return res.status(400).json({ error: 'Missing file in form-data body' });
      if (!file.mimetype.startsWith('video/')) return res.status(400).json({ error: 'Only video files are allowed' });

      const folder = req.body.folder || 'mission-for-nation/videos';
      const result = await uploadBufferToCloudinary(file.buffer, {
        resource_type: 'video',
        folder
      });

      return res.json({
        ok: true,
        asset: {
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          secure_url: result.secure_url,
          url: result.url,
          bytes: result.bytes,
          created_at: result.created_at
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err?.message || 'Video upload failed' });
    }
  }
);

module.exports = router;
