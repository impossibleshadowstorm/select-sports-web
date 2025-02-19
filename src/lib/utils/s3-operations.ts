import { s3 } from '@/lib/s3-client';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const uploadFileToS3 = async (file: File): Promise<string | void> => {
  try {
    const fileName = `${Date.now()}-${file.name}`;

    // Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET!,
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return `https://${params.Bucket}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (err) {
    console.error('Upload Error:', err);
  }
};

export const deleteS3Image = async (imageUrl: string) => {
  try {
    const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET!;

    const key = imageUrl.split(`/`)[3];

    if (!key) {
      console.warn('Invalid S# image URL:', imageUrl);
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3.send(command);
    console.log(`Image deleted from S3: ${imageUrl}`);
  } catch (error) {
    console.error(`Failed to delete image from S3:`, error);
  }
};
