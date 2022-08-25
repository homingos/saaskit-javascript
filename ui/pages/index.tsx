/* eslint-disable @typescript-eslint/ban-types */
import { useEffect, useState } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';

import Card from '../components/atoms/Card';
import FlexCenter from '../components/atoms/FlexCenter';
import Scrollable from '../components/atoms/Scrollable';
import ProductImage from '../components/molecules/ProductImage';
import CardMessage from '../components/organisms/CardMessage';
import ModalFooter from '../components/organisms/ModalFooter';
import ModalHeader from '../components/organisms/ModalHeader';
// import ThemeSelect from '../components/organisms/ThemeSelect';
import VideoUpload from '../components/organisms/VideoUpload';
import useMessage from '../hooks/useMessage';

import type { NextPage } from 'next';
import { createCard, getProductData, getSignedURL, UploadURLv2 } from '../api';
import Loading from '../components/atoms/Loading';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import ClientData from '../components/molecules/ClientData';

const Home: NextPage = () => {
  const router = useRouter();

  const { sendMessage } = useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [dataFromClient, setDataFromClient] =
    useState<dataFromClientType | null>(null);
  const [productData, setProductData] = useState<productDataType | null>(null);
  const [userSelectedData, setUserSelectedData] = useState<any>({});
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const receiveMessage = (event: { data: { type: string; data: any } }) => {
    if (event.data.type === 'INITIAL_DATA') {
      setDataFromClient(event.data.data);
    }
  };

  const uploadURL = async (data: any, acceptedFiles: any) => {
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
      throw new Error('Failed to upload content!');
    }
  };

  const onSubmitHandler = async (e: Event) => {
    e.preventDefault();
    setIsCreateLoading(true);
    let validData = true;
    ['photo', 'video', 'text'].every((item: string) => {
      if (item === 'video') {
        if (Boolean(productData?.productMetaData[item]?.isActive)) {
          if (userSelectedData.is_deferred) {
            return true;
          } else {
            if (userSelectedData.video || dataFromClient?.order_details[item]) {
              return true;
            } else {
              validData = false;
              alert(`Please add ${item}`);
              setIsCreateLoading(false);
              return false;
            }
          }
        }
      } else if (
        !(
          Boolean(productData?.productMetaData[item]?.isActive) ==
          (Boolean(userSelectedData[item]) ||
            Boolean(dataFromClient?.order_details[item]))
        )
      ) {
        // toast.error(`Please add ${item}`);
        validData = false;
        alert(`Please add ${item}`);
        setIsCreateLoading(false);
        return false;
      }
      return true;
    });

    if (validData) {
      // data to be sent to create api
      const finalData = {
        refId: dataFromClient?.order_details?.refId || '',
        productId: dataFromClient?.product_id || '',
        theme: dataFromClient?.order_details?.animation || '',
        clientPhotoURL: '',
        clientVideoURL: '',
        is_deferred: userSelectedData.is_deferred
      };

      // photo
      if (dataFromClient?.order_details?.photo) {
        finalData.clientPhotoURL = dataFromClient?.order_details?.photo;
      } else if (userSelectedData.photo) {
        const res = await getSignedURL({
          data: [
            {
              filename: userSelectedData.photo.name,
              contentType: userSelectedData.photo.type
            }
          ],
          num: 1
        });
        const resData = await uploadURL(res.data, [userSelectedData.photo]);
        if (resData[0]) {
          finalData.clientPhotoURL = resData[0];
        }
      }

      // video
      if (
        dataFromClient?.order_details?.video &&
        !userSelectedData.is_deferred
      ) {
        finalData.clientPhotoURL = dataFromClient?.order_details?.video;
      } else if (userSelectedData.video) {
        const res = await getSignedURL({
          data: [
            {
              filename: userSelectedData.video.name,
              contentType: userSelectedData.video.type
            }
          ],
          num: 1
        });
        const resData = await uploadURL(res.data, [userSelectedData.video]);
        if (resData[0]) {
          finalData.clientVideoURL = resData[0];
        }
      }

      // create
      const finalRes = await createCard({
        apiKey: dataFromClient?.client_data?.key || '',
        data: finalData
      });

      setIsCreateLoading(false);

      // send message to parent
      sendMessage({
        type: 'CREATED',
        payload: finalRes.data
      });
    }
  };

  useEffect(() => {
    window.addEventListener('message', receiveMessage);

    return () => window.removeEventListener('message', receiveMessage);
  }, []);

  useEffect(() => {
    sendMessage({
      type: 'READY_TO_RECEIVE'
    });
  }, []);

  useEffect(() => {
    if (dataFromClient) {
      (async () => {
        try {
          const res = await getProductData({
            apiKey: dataFromClient?.client_data?.key,
            productId: dataFromClient?.product_id
          });
          setProductData(res.data);
          setIsLoading(false);
        } catch (err) {
          console.log('ERR', err);
          router.push('/error/Something went wrong');
        }
      })();
    }
  }, [dataFromClient]);

  return (
    <div className="h-screen w-screen">
      <FlexCenter>
        <Card
          className={`relative p-8 flex flex-col ${
            isLoading && 'items-center justify-center'
          } h-full`}
        >
          <IoIosCloseCircleOutline
            className="absolute text-black md:text-white h-8 w-8 right-4 top-4 md:right-0 md:-top-10 cursor-pointer"
            onClick={() => sendMessage({ type: 'CLOSE' })}
          />
          {isLoading ? (
            <FlexCenter>
              <Loading />
            </FlexCenter>
          ) : (
            <>
              <ModalHeader
                clientData={{
                  name: dataFromClient?.client_data.name || '',
                  logoUrl: dataFromClient?.client_data.logoUrl || ''
                }}
                existingPhoto={dataFromClient?.order_details?.photo || ''}
                title={productData?.productHeader || ''}
                showPhoto={
                  productData?.productMetaData?.photo?.isActive as boolean
                }
                photo={userSelectedData.photo}
                setData={setUserSelectedData}
              />

              <Scrollable className="py-4">
                {productData?.productMetaData?.photo?.isActive && (
                  <div className="md:hidden mb-3">
                    <h4 className="font-bold text-sm text-brand_black mb-2">
                      Upload Photo
                    </h4>
                    <ProductImage
                      existingPhoto={dataFromClient?.order_details?.photo || ''}
                      photo={userSelectedData.photo}
                      setData={setUserSelectedData}
                    />
                  </div>
                )}
                {productData?.productMetaData?.video?.isActive && (
                  <VideoUpload
                    is_defered={Boolean(userSelectedData.is_deferred)}
                    existingVideo={dataFromClient?.order_details?.video || ''}
                    video={userSelectedData.video}
                    setData={setUserSelectedData}
                  />
                )}
                {productData?.productMetaData?.text?.isActive && (
                  <CardMessage
                    existingText=""
                    text={userSelectedData.text}
                    setData={setUserSelectedData}
                  />
                )}
                {/* <ThemeSelect /> */}
              </Scrollable>

              <ModalFooter
                isLoading={isCreateLoading}
                showLaterOption={!Boolean(dataFromClient?.order_details?.video)}
                handleSubmit={onSubmitHandler}
                is_deferred={Boolean(userSelectedData.is_deferred)}
                setData={setUserSelectedData}
              />
            </>
          )}
        </Card>
      </FlexCenter>
    </div>
  );
};

export default Home;
