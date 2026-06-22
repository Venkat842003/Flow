const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

async function uploadImage(req, res) {
  try {
    const { stepId, publicId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const stepResult = await pool.query("SELECT * FROM steps WHERE id = $1", [
      stepId,
    ]);

    const currentStep = stepResult.rows[0];

    const publicIdToDelete = publicId || currentStep?.cloudinary_public_id;

    if (publicIdToDelete) {
      await cloudinary.uploader.destroy(publicIdToDelete);
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "flow_step_images",
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    await pool.query(
      `UPDATE steps SET image_url = $1, cloudinary_public_id = $2 WHERE id = $3`,
      [uploadResult.secure_url, uploadResult.public_id, stepId],
    );

    res.json({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
}

module.exports = { uploadImage };
