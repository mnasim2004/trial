require('dotenv').config();
const { S3 } = require('aws-sdk');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const uuid = require('uuid').v4;

// exports.s3Uploadv2 = async (files) => {
//   const s3 = new S3();

//   const params = files.map((file) => {
//     return {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `products/${uuid()}-${file.originalname}`,
//       Body: file.buffer
//     };
//   });
//   return await Promise.all(params.map((param) => s3.upload(param).promise()));
// };

exports.s3Uploadv2 = async (files) => {
  const s3 = new S3();

  const uploadPromises = files.map((file) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `products/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
    return s3
      .upload(params)
      .promise()
      .then(() => params.Key); // Resolve with the generated Key
  });

  return Promise.all(uploadPromises);
};

exports.s3Uploadv3 = async (files) => {
  const s3client = new S3Client();

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `products/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(
    params.map((param) => s3client.send(new PutObjectCommand(param)))
  );
};
