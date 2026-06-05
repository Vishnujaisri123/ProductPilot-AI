const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath, folder = 'productvision') => {
  const result = await cloudinary.uploader.upload(filePath, { folder });
  return { url: result.secure_url, public_id: result.public_id };
};

const uploadBuffer = async (buffer, folder = 'productvision') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve({ url: result.secure_url, public_id: result.public_id });
    });
    stream.end(buffer);
  });
};

module.exports = { uploadImage, uploadBuffer };
