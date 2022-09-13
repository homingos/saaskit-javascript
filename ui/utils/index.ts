import { UploadURLv2 } from '../api';

export const uploadURL = async (data: any, acceptedFiles: any) => {
  try {
    const posts: any[] = [];
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      const imageItem = acceptedFiles[index];
      const res = await UploadURLv2(item?.uploadUrl, imageItem);
      if (res.status == 200) {
        posts.push(item.resourceUrl);
      }
    }

    return posts;
  } catch (err) {
    throw 'Failed to upload content!';
  }
};
