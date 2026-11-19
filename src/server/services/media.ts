import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import {
  isValidMediaObjectKey,
  type MediaCategory,
} from "@/lib/media-keys";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const objectPrefixes: Record<MediaCategory, string> = {
  "movie-poster": "movies/posters",
  "movie-backdrop": "movies/backdrops",
  event: "events",
  news: "news",
  promotion: "promotions",
};

export class MediaServiceError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "MediaServiceError";
  }
}

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: URL;
}

let client: S3Client | undefined;

function getR2Config(): R2Config {
  const {
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET_NAME: bucketName,
    R2_PUBLIC_BASE_URL: publicBaseUrl,
  } = process.env;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    throw new MediaServiceError(
      "R2 storage is not configured. Set all R2 environment variables.",
      503,
    );
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(publicBaseUrl);
  } catch {
    throw new MediaServiceError("R2_PUBLIC_BASE_URL must be a valid URL.", 503);
  }

  const isLocalDevelopment =
    process.env.NODE_ENV !== "production" &&
    baseUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(baseUrl.hostname);
  if (
    (baseUrl.protocol !== "https:" && !isLocalDevelopment) ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new MediaServiceError(
      "R2_PUBLIC_BASE_URL must be an HTTPS URL without credentials or query parameters.",
      503,
    );
  }

  if (!/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new MediaServiceError("R2_ACCOUNT_ID is invalid.", 503);
  }

  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/i.test(bucketName)) {
    throw new MediaServiceError("R2_BUCKET_NAME is invalid.", 503);
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl: baseUrl,
  };
}

function getClient(config: R2Config) {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return client;
}

export function getImageUrl(key: string | null): string | null {
  if (key === null) {
    return null;
  }

  if (!isValidMediaObjectKey(key)) {
    throw new MediaServiceError("The stored media object key is invalid.", 500);
  }

  const { publicBaseUrl } = getR2Config();
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicBaseUrl.toString().replace(/\/+$/, "")}/${encodedKey}`;
}

export async function uploadImage(file: File, category: MediaCategory) {
  if (file.size < 1 || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new MediaServiceError("Choose an image no larger than 5 MB.");
  }

  const body = Buffer.from(await file.arrayBuffer());
  const detectedType = await fileTypeFromBuffer(body);
  if (
    !detectedType ||
    !Object.hasOwn(imageExtensions, detectedType.mime)
  ) {
    throw new MediaServiceError("Only JPEG, PNG, and WebP images are allowed.");
  }

  if (
    file.type &&
    file.type !== detectedType.mime &&
    !(file.type === "image/jpg" && detectedType.mime === "image/jpeg")
  ) {
    throw new MediaServiceError("The image file type does not match its content.");
  }

  const config = getR2Config();
  const extension =
    imageExtensions[detectedType.mime as keyof typeof imageExtensions];
  const key = `${objectPrefixes[category]}/${randomUUID()}.${extension}`;

  await getClient(config).send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentLength: body.byteLength,
      ContentType: detectedType.mime,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { key, url: getImageUrl(key) };
}

export async function deleteImage(key: string, category: MediaCategory) {
  if (!isValidMediaObjectKey(key, category)) {
    throw new MediaServiceError("The media object key is invalid.");
  }

  const config = getR2Config();
  await getClient(config).send(
    new DeleteObjectCommand({ Bucket: config.bucketName, Key: key }),
  );
}
