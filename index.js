const B2 = require('backblaze-b2');

function init(applicationKeyId, applicationKey) {
  const b2 = new B2({
    applicationKeyId: applicationKeyId,
    applicationKey: applicationKey,
    retry: { retries: 3 }
  });

  return { b2, authorization: b2.authorize() };
}

module.exports = {
  init(providerOptions) {
    const { b2, authorization } = init(providerOptions.applicationKeyId, providerOptions.applicationKey);

    return {
      upload: async (file) => {
        const { downloadUrl } = await authorization.then(res => res.data)
            , { bucketId } = await b2.getBucket({ bucketName: providerOptions.bucket }).then(res => res.data.buckets[0])
            , { uploadUrl, uploadAuthToken } = await b2.getUploadUrl(bucketId).then(res => res.data)
            , fileName = (file.path ? `${file.path}/` : '') + file.hash + file.ext;

        await b2.uploadFile({
          uploadAuthToken,
          uploadUrl,
          fileName,
          mime: file.mime,
          data:Buffer.from(file.buffer, 'binary')
        });

        file.url = `${downloadUrl}/file/${providerOptions.bucket}/${filePathName}`;
        strapi.log.debug(filePathName, 'uploaded to', providerOptions.bucket,'on B2')
      },
      delete: async (file) => {
        const { bucketId } = await b2.getBucket({ bucketName: providerOptions.bucket }).then(res => res.data.buckets[0])
            , startFileName = (file.path ? `${file.path}/` : '') + file.hash + file.ext;

        const { files: fileVersions } = await b2.listFileVersions({
          bucketId,
          startFileName,
          prefix: startFileName
        }).then(res => res.data);

        for (const version of fileVersions) b2.deleteFileVersion(version);

        strapi.log.debug(startFileName, 'deleted from', providerOptions.bucket,'on B2')
      },
    };
  },
};


