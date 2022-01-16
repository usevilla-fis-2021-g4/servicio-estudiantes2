const S3 = require("aws-sdk/clients/s3");
const fs = require('fs');

const AWS_BUCKET_NAME_SERVICIO_PROFESORES = "usevilla-fis-2021-g4-servicio-profesores";
const AWS_BUCKET_REGION_SERVICIO_PROFESORES = "eu-west-2";
const AWS_ACCESS_KEY_SERVICIO_PROFESORES = process.env.AWS_ACCESS_KEY_SERVICIO_PROFESORES;
const AWS_SECRET_ACCESS_KEY_SERVICIO_PROFESORES = process.env.AWS_SECRET_ACCESS_KEY_SERVICIO_PROFESORES;

const s3Instance = new S3({
    region: AWS_BUCKET_REGION_SERVICIO_PROFESORES,
    accessKeyId: AWS_ACCESS_KEY_SERVICIO_PROFESORES,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_SERVICIO_PROFESORES
});

//uploads a file to s3
function uploadFile(file)
{
    const fileStream = fs.createReadStream(file.path);

    var extension = file.originalname.split(".").pop();
    var filename = file.filename+"."+extension;

    const uploadParams = {
        Bucket: AWS_BUCKET_NAME_SERVICIO_PROFESORES,
        Body: fileStream,
        Key: filename
    };

    return s3Instance.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;

//downloads a file from s3
function getFileStream(fileKey)
{
    const downloadParams = {
        Key: fileKey,
        Bucket: AWS_BUCKET_NAME_SERVICIO_PROFESORES
    };
    return s3Instance.getObject(downloadParams).createReadStream();
}

exports.getFileStream = getFileStream;

function getTemporaryUrl(fileKey)
{
    const downloadParams = {
        Key: fileKey,
        Bucket: AWS_BUCKET_NAME_SERVICIO_PROFESORES,
        Expires: 60
    };

    return s3Instance.getSignedUrlPromise('getObject', downloadParams);
}

exports.getTemporaryUrl = getTemporaryUrl;
