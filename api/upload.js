// api/upload.js
export default async function handler(req, res) {
  // Enable CORS for your Figma plugin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(image, "base64");

    // Generate unique filename
    const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    // Option 1: Upload to Vercel Blob Storage (easiest)
    const { put } = require("@vercel/blob");
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
    });

    // Option 2: Upload to AWS S3 (uncomment to use)
    /*
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    };

    const result = await s3.upload(uploadParams).promise();
    
    return res.status(200).json({ 
      success: true, 
      url: result.Location 
    });
    */
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
}
