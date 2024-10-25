const { S3Client } = require('@aws-sdk/client-s3');

const r2 = new S3Client({
    endpoint: process.env.ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    region: 'auto',
    signatureVersion: 'v4',
});

module.exports = r2;