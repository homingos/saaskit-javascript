/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/ban-types */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { IoIosCloseCircleOutline } from 'react-icons/io';

import {
  createCard,
  getCLientData,
  getProductData,
  getSignedURL,
  UploadURLv2
} from '../api';
import Card from '../components/atoms/Card';
import FlexCenter from '../components/atoms/FlexCenter';
import Loading from '../components/atoms/Loading';
import Scrollable from '../components/atoms/Scrollable';
import ProductImage from '../components/molecules/ProductImage';
import CardMessage from '../components/organisms/CardMessage';
import ModalFooter from '../components/organisms/ModalFooter';
import ModalHeader from '../components/organisms/ModalHeader';
import VideoUpload from '../components/organisms/VideoUpload';
import useMessage from '../hooks/useMessage';

const Home = ({ theme }: { theme: string }) => {
  const router = useRouter();
  const [shakeModal, setShakeModal] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataFromClient, setDataFromClient] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [userSelectedData, setUserSelectedData] = useState<any>({});
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const { sendMessage, ready, parentUrl } = useMessage(
    dataFromClient?.client_data.environment || 'SANDBOX'
  );

  const receiveMessage = async (event: {
    data: { type: string; payload: any };
    origin: string;
  }) => {
    if (event.origin.concat('/') === parentUrl) {
      if (event.data.type === 'INITIAL_DATA') {
        let eventData = event.data.payload;
        if (
          !eventData.order_details.logo ||
          !eventData.order_details?.prefill?.name ||
          !eventData?.order_details?.prefill?.email ||
          !eventData?.order_details?.prefill?.phone
        ) {
          try {
            const res = await getCLientData({
              env: eventData.client_data.environment,
              apiKey: eventData.client_data.key
            });
            if (res.status == 200) {
              console.log('RES', res.data);
              console.log('INIT', eventData);
              setDataFromClient(eventData);
              setDataFromClient({
                ...eventData,
                order_details: {
                  ...eventData?.order_details,
                  logo: eventData.logo || res.data.logoURL || '',
                  prefill: {
                    name:
                      eventData?.order_details?.prefill?.name ||
                      res?.data?.clientName ||
                      '',
                    email:
                      eventData?.order_details?.prefill?.email ||
                      res?.data?.businessEmail ||
                      '',
                    phone:
                      eventData?.order_details?.prefill?.phone ||
                      res?.data?.phoneNumber ||
                      ''
                  }
                }
              });
            } else if (res.detail) {
              throw {
                code: 401,
                message: res.detail
              };
            } else {
              throw {
                code: 500,
                message: 'Something went wrong'
              };
            }
          } catch (err: any) {
            sendMessage({
              type: 'ERROR',
              payload: {
                message: err?.message || 'Something went wrong!',
                code: err?.code || 500
              }
            });
            router.push('/error/Something went wrong');
          }
        }
      }
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
      throw 'Failed to upload content!';
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
              setShakeModal(true);
              toast.error(`Please add ${item}`);
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
        setShakeModal(true);
        toast.error(`Please add ${item}`);
        validData = false;
        setIsCreateLoading(false);
        return false;
      }
      return true;
    });

    try {
      if (validData) {
        // data to be sent to create api
        const finalData = {
          refId: dataFromClient?.order_details?.refId || '',
          productId: dataFromClient?.order_details?.productId || '',
          theme:
            dataFromClient?.order_details?.animation ||
            productData?.productMetaData?.theme?.name ||
            'hearts',
          clientPhotoURL: '',
          clientVideoURL: '',
          orderType: userSelectedData.is_deferred ? 'DEFERRED' : 'INSTANT'
        };

        // photo
        if (dataFromClient?.order_details?.photo) {
          finalData.clientPhotoURL = dataFromClient?.order_details?.photo;
        } else if (userSelectedData.photo) {
          const res = await getSignedURL(
            dataFromClient?.client_data.environment || 'SANDBOX',
            {
              data: [
                {
                  filename: userSelectedData.photo.name,
                  contentType: userSelectedData.photo.type
                }
              ],
              num: 1
            }
          );
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
        } else if (userSelectedData.video && !userSelectedData.is_deferred) {
          const res = await getSignedURL(
            dataFromClient?.client_data.environment,
            {
              data: [
                {
                  filename: userSelectedData.video.name,
                  contentType: userSelectedData.video.type
                }
              ],
              num: 1
            }
          );
          const resData = await uploadURL(res.data, [userSelectedData.video]);
          if (resData[0]) {
            finalData.clientVideoURL = resData[0];
          }
        }

        // create
        const finalRes = await createCard({
          env: dataFromClient?.client_data.environment || 'SANDBOX',
          apiKey: dataFromClient?.client_data?.key || '',
          data: finalData
        });

        if (finalRes.status == 200 || finalRes.status == 201) {
          setIsCreateLoading(false);

          // send message to parent
          sendMessage({
            type: 'CREATED',
            payload: {
              ...finalRes.data,
              mediaLink: null
            }
          });
        } else {
          // send message to parent
          sendMessage({
            type: 'ERROR',
            payload: {
              message: finalRes?.data?.message || 'Something went wrong!',
              code: finalRes?.status || 500
            }
          });
          router.push('/error/Something went wrong');
        }
      }
    } catch (err: any) {
      // send message to parent
      sendMessage({
        type: 'ERROR',
        payload: {
          code: 500,
          message: err?.message || 'Something went wrong!'
        }
      });
      router.push('/error/Something went wrong');
    }
  };

  useEffect(() => {
    window.addEventListener('message', receiveMessage);

    return () => window.removeEventListener('message', receiveMessage);
  }, [parentUrl]);

  useEffect(() => {
    if (ready) {
      sendMessage({
        type: 'READY_TO_RECEIVE'
      });
    }
  }, [ready]);

  useEffect(() => {
    if (dataFromClient) {
      (async () => {
        try {
          const res = await getProductData({
            env: dataFromClient.client_data.environment,
            apiKey: dataFromClient?.client_data?.key,
            productId: dataFromClient?.order_details?.productId || ''
          });
          if (res.status == 200 && res.data) {
            setProductData(res.data);
          } else {
            if (res.detail) {
              throw new res.detail();
            } else {
              throw 'Something went wrong!';
            }
          }
          setIsLoading(false);
        } catch (err: any) {
          sendMessage({
            type: 'ERROR',
            payload: {
              code: 500,
              message: err.message
            }
          });

          router.push('/error/Something went wrong');
        }
      })();
    }
  }, [dataFromClient]);

  return (
    <div className="h-screen w-screen">
      <div>
        <Toaster />
      </div>
      <FlexCenter>
        <Card
          shake={shakeModal}
          setShake={setShakeModal}
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
                  name:
                    dataFromClient?.order_details?.prefill?.name ||
                    'SmartPhotos',
                  logoUrl:
                    dataFromClient?.order_details?.logo ||
                    'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/flam_logo.png'
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
                showLaterOption={false}
                handleSubmit={onSubmitHandler}
                is_deferred={Boolean(userSelectedData.is_deferred)}
                setData={setUserSelectedData}
              />
            </>
          )}
        </Card>
      </FlexCenter>
      <style global jsx>{`
        :root {
          --primary: ${theme};
        }
      `}</style>
    </div>
  );
};

export default Home;

export async function getServerSideProps(context: any) {
  return {
    props: {
      theme: context.query.theme || '#1d4ed8'
    }
  };
}
