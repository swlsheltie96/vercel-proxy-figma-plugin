// api/upload.js
import { put } from "@vercel/blob";

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

    // Upload to Vercel Blob Storage
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
    });

    console.log("Blob upload successful:", blob.url);

    return res.status(200).json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
}
