require("dotenv").config();
const { S3 } = require("aws-sdk");
const { S3Client, PutObjectCommand,GetObjectCommand} = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;


const client = new S3Client({});

exports.s3Upload = async (files) => {
    var keys = "";
  const params = files.map((file)=>{
    keys = `products/${uuid()}-${file.originalname}`;
    return{
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: keys,
    Body: file.buffer
    }
  });
  await Promise.all(
    params.map((param) => client.send(new PutObjectCommand(param)))
  );
  return keys;
};

