import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET } from "../config/s3client.js";

export const getPresignedUrl = async (req, res) => {
  try {
    const { filename, filetype } = req.query;
    if (!filename || !filetype) {
      return res.status(400).json({ error: "Faltan parámetros filename o filetype" });
    }

    const key = `productos/${Date.now()}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: filetype
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 200 });

    return res.status(200).json({ url, key });
  } catch (error) {
    console.error("❌ Error generando presigned URL:", error);
    return res.status(500).json({ error: "Error generando presigned URL", details: error.message });
  }
};

