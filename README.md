
# strapi-provider-upload-b2

Backblaze B2 upload provider for Strapi v3

## How to install
To install this provider provider run:

    npm i strapi-provider-upload-b2 --save

To enable the provider, create or edit the file at `./config/plugins.js`
  

    module.exports = ({ env }) => ({  
	   upload: {  
	       provider: "b2",  
		   providerOptions: {  
	          applicationKeyId: env('B2_ID'),  
		      applicationKey: env('B2_KEY'),  
		      bucket: env('B2_BUCKET')  
	      }  
      }  
    });

See [this article](https://strapi.io/documentation/v3.x/plugins/upload.html#using-a-provider) for more information.
