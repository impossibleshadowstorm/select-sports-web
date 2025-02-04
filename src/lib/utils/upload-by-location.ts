import { s3, putObjectCommand } from '@/lib/s3-client';
import fs from 'fs';
import path from 'path';

const uploadFile = async (filePath: string): Promise<string | void> => {
  try {
    const fileName: string = path.basename(filePath);
    const fileContent: Buffer = fs.readFileSync(filePath);

    const params = {
      Bucket: process.env.BUCKET,
      Key: fileName,
      Body: fileContent
    };
    const command = new putObjectCommand(params);
    await s3.send(command);
    console.log('File uploaded successfully!');
    const fileUrl: string = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    console.log('Access URL:', fileUrl);

    return fileUrl; // Return the file URL
  } catch (err) {
    console.error('Upload Error:', err);
  }
};

export default uploadFile;
