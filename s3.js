const S3 = require("aws-sdk/clients/s3");
const fs = require('fs');

const AWS_BUCKET_NAME_SERVICIO_ESTUDIANTES = "usevilla-fis-2021-g4-servicio-estudiantes";
const AWS_BUCKET_REGION_SERVICIO_ESTUDIANTES = "eu-west-2";
const AWS_ACCESS_KEY_SERVICIO_ESTUDIANTES = process.env.AWS_ACCESS_KEY_SERVICIO_ESTUDIANTES;
const AWS_SECRET_ACCESS_KEY_SERVICIO_ESTUDIANTES = process.env.AWS_SECRET_ACCESS_KEY_SERVICIO_ESTUDIANTES;

const s3Instance = new S3({
    region: AWS_BUCKET_REGION_SERVICIO_ESTUDIANTES,
    accessKeyId: AWS_ACCESS_KEY_SERVICIO_ESTUDIANTES,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_SERVICIO_ESTUDIANTES
});

//uploads a file to s3
function uploadFile(file)
{
    const fileStream = fs.createReadStream(file.path);

    var extension = file.originalname.split(".").pop();
    var filename = file.filename+"."+extension;

    const uploadParams = {
        Bucket: AWS_BUCKET_NAME_SERVICIO_ESTUDIANTES,
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
        Bucket: AWS_BUCKET_NAME_SERVICIO_ESTUDIANTES
    };
    return s3Instance.getObject(downloadParams).createReadStream();
}

exports.getFileStream = getFileStream;

function getTemporaryUrl(fileKey)
{
    const downloadParams = {
        Key: fileKey,
        Bucket: AWS_BUCKET_NAME_SERVICIO_ESTUDIANTES,
        Expires: 60
    };

    return s3Instance.getSignedUrlPromise('getObject', downloadParams);
}

exports.getTemporaryUrl = getTemporaryUrl;
