const B2 = require('backblaze-b2');

module.exports = {
  init(providerOptions) {
    const b2 = new B2({
      applicationKeyId: providerOptions.applicationKeyId,
      applicationKey: providerOptions.applicationKey,
      retry: { retries: 3 }
    });

    return {
      upload: async (file) => {
        const { downloadUrl } = await b2.authorize().then(res => res.data);
        const { bucketId } = await b2.getBucket({ bucketName: providerOptions.bucket }).then(res => res.data.buckets[0]);
        const { uploadUrl, authorizationToken: uploadAuthToken } = await b2.getUploadUrl(bucketId).then(res => res.data);
        const fileName = (file.path ? `${file.path}/` : '') + file.hash + file.ext;

        await b2.uploadFile({
          uploadAuthToken,
          uploadUrl,
          fileName,
          mime: file.mime,
          data:Buffer.from(file.buffer, 'binary')
        });

        file.url = `${downloadUrl}/file/${providerOptions.bucket}/${fileName}`;
        strapi.log.debug(fileName, 'uploaded to', providerOptions.bucket,'on B2')
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


