// app/lib/s3/upload.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './client';

export async function generateUploadUrl(fileName: string, fileType: string) {
  const bucketName = process.env.AWS_S3_BUCKET!;
  const key = `documents/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });
  
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  
  return {
    url: signedUrl,
    key: key,
  };
}

export async function uploadDocument(
  file: File, 
  bookingId: string, 
  documentType: string,
  onProgress?: (progress: number) => void
) {
  const fileName = `${bookingId}/${documentType}/${Date.now()}-${file.name}`;
  const { url, key } = await generateUploadUrl(fileName, file.type);
  
  return new Promise<{ url: string; key: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
        resolve({ url: publicUrl, key });
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });
    
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}
