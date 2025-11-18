import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, S3_BUCKET } from "../config/s3client.js";

export const getPresignedUrl = async (req, res) => {
  try {
    let { filename, filetype } = req.query;

    if (!filename || !filetype) {
      return res
        .status(400)
        .json({ error: "Faltan parámetros filename o filetype" });
    }

    // 1️⃣ Decodificar
    let decoded = decodeURIComponent(filename);

    // 2️⃣ Sanitizar: reemplazar espacios y cualquier caracter raro
    let sanitized = decoded.replace(/[^a-zA-Z0-9._-]/g, "_");

    // 3️⃣ Generar KEY final para S3
    const key = `productos/${Date.now()}_${sanitized}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: filetype,
    });

    // 4️⃣ Generar presigned URL
    const url = await getSignedUrl(s3Client, command, { expiresIn: 200 });

    return res.status(200).json({ url, key });
  } catch (error) {
    console.error("❌ Error generando presigned URL:", error);
    return res.status(500).json({
      error: "Error generando presigned URL",
      details: error.message,
    });
  }
};
