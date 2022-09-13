/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/ban-types */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

import {
  getCreatedProductData,
  getSignedURL,
  updateCard,
  UploadURLv2
} from '../../api';
import Card from '../../components/atoms/Card';
import FlexCenter from '../../components/atoms/FlexCenter';
import Loading from '../../components/atoms/Loading';
import Scrollable from '../../components/atoms/Scrollable';
import ProductImage from '../../components/molecules/ProductImage';
// import CardMessage from '../../components/organisms/CardMessage';
import ModalFooter from '../../components/organisms/ModalFooter';
import ModalHeader from '../../components/organisms/ModalHeader';
import VideoUpload from '../../components/organisms/VideoUpload';
import { uploadURL } from '../../utils';

const Update = ({ id }: { id: string }) => {
  const router = useRouter();
  const [shakeModal, setShakeModal] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cardData, setCardData] = useState<any>(null);
  const [newData, setNewData] = useState<any>({
    video: null
  });
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const onSubmitHandler = async (e: Event) => {
    setIsUpdateLoading(true);
    e.preventDefault();
    if (!newData.video) {
      setShakeModal(true);
      toast.error(`Please add video`);
      setIsUpdateLoading(false);
    } else {
      try {
        const res = await getSignedURL('SANDBOX', {
          data: [
            {
              filename: newData.video.name,
              contentType: newData.video.type
            }
          ],
          num: 1
        });
        const resData = await uploadURL(res.data, [newData.video]);
        if (resData[0]) {
          const finalRes = await updateCard({
            env: 'SANDBOX',
            data: {
              flamcardId: cardData?.id,
              newVideoUrl: resData[0]
            }
          });
          if (finalRes.status == 200 || finalRes.status == 201) {
            setIsUpdateLoading(false);
            toast.success('Video updated successfully!');
            router.reload();
          } else {
            throw 'Something went wrong';
          }
        } else {
          throw 'Something went wrong';
        }
      } catch (err) {
        console.log('ERR', err);
        setIsUpdateLoading(false);
        router.push('/error/Something went wrong');
      }
    }
  };

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res: any = await getCreatedProductData({
            env: 'SANDBOX',
            flamCardId: id
          });
          if (res.status == 200 && res.data) {
            setCardData(res.data);
          } else {
            if (res.detail) {
              throw res.detail;
            } else {
              throw 'Something went wrong!';
            }
          }

          setIsLoading(false);
        } catch (err: any) {
          toast.error(err?.message || 'Sonething went wrong');

          // router.push('/error/Something went wrong');
        }
      })();
    }
  }, [id]);

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
          {isLoading ? (
            <FlexCenter>
              <Loading />
            </FlexCenter>
          ) : cardData?.clientVideoURL ? (
            <div className="w-full h-full flex flex-col justify-center items-center text-center">
              <img src="/wifi_error.svg" alt="error" className="h-2/5 w-auto" />
              <h1 className="text-2xl font-semibold">Video already uploaded</h1>
              <p className="">
                You can only upload the video once and you have already done
                that!
              </p>
            </div>
          ) : (
            <>
              <ModalHeader
                clientData={{
                  name: 'SmartPhotos',
                  logoUrl:
                    'https://flam-videoshop-assets.s3.ap-south-1.amazonaws.com/flam/web/flam_logo.png'
                }}
                existingPhoto={cardData?.clientPhotoURL}
                title={cardData?.productHeader || ''}
                showPhoto={cardData?.clientPhotoURL}
              />

              <Scrollable className="py-4">
                <div className="md:hidden mb-3">
                  <h4 className="font-bold text-sm text-brand_black mb-2">
                    Upload Photo
                  </h4>
                  <ProductImage existingPhoto={cardData?.clientPhotoURL} />
                </div>
                <VideoUpload
                  existingVideo={cardData?.clientVideoURL || ''}
                  video={newData.video}
                  setData={setNewData}
                />
                {/* 
              <CardMessage
                existingText=""
                text={cardData.text}
                setData={setCardData}
              />
             */}
                {/* <ThemeSelect /> */}
              </Scrollable>

              <ModalFooter
                isLoading={isUpdateLoading}
                showLaterOption={false}
                handleSubmit={onSubmitHandler}
                is_deferred={false}
                setData={setCardData}
              />
            </>
          )}
        </Card>
      </FlexCenter>
      <style global jsx>{`
        :root {
          --primary: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default Update;

export async function getServerSideProps(context: any) {
  return {
    props: {
      id: context?.query?.id
    }
  };
}
