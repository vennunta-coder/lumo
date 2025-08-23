import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';
const s3 = new S3Client({ region: config.s3.region, endpoint: config.s3.endpoint, forcePathStyle: true, credentials: { accessKeyId: config.s3.accessKeyId, secretAccessKey: config.s3.secretAccessKey } });
export async function uploadBuffer(key: string, buffer: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: config.s3.bucket, Key: key, Body: buffer, ContentType: contentType, ACL: 'public-read' }));
  return `${config.s3.endpoint}/${config.s3.bucket}/${key}`;
}
