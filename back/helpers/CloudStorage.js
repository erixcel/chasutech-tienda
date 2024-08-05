const { Storage } = require('@google-cloud/storage');
const { Readable } = require('stream');
const path = require('path');

const projectId = 'admin-tienda-erixcel';
const bucketName = 'admin-tienda-erixcel.appspot.com';
const keyFilename = path.join(__dirname,'admin-tienda-erixcel.json');
const storage = new Storage({projectId, keyFilename});

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

function uploadImage(fileName, file) {
  const fileStream = storage.bucket(bucketName).file(fileName);

  const stream = fileStream.createWriteStream({
    metadata: {
      contentType: file.type,
      cacheControl: 'no-cache',
    },
    resumable: false
  });

  stream.on('error', (err) => {
    console.error(err);
  });

  stream.on('finish', async () => {
    try {
      await fileStream.makePublic();
      console.log(`Imagen subida a Cloud Storage con éxito`);
    } catch (err) {
      console.error(err);
    }
  });

  bufferToStream(file.buffer).pipe(stream);

  // Retorna la URL de la imagen inmediatamente
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

function removeImage(fileName) {
  try {
    storage.bucket(bucketName).file(fileName).delete();
    console.log(`Imagen ${fileName} eliminada de Cloud Storage con éxito`);
  } catch (err) {
    console.error(err);
  }
}

module.exports = { uploadImage, removeImage };