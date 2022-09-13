/* eslint-disable no-extra-boolean-cast */
/* eslint-disable @typescript-eslint/ban-types */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

import { getCreatedProductData, UploadURLv2 } from '../../api';
import Card from '../../components/atoms/Card';
import FlexCenter from '../../components/atoms/FlexCenter';
import Loading from '../../components/atoms/Loading';
import Scrollable from '../../components/atoms/Scrollable';
import ProductImage from '../../components/molecules/ProductImage';
// import CardMessage from '../../components/organisms/CardMessage';
import ModalFooter from '../../components/organisms/ModalFooter';
import ModalHeader from '../../components/organisms/ModalHeader';
import VideoUpload from '../../components/organisms/VideoUpload';

const Update = ({ id }: { id: string }) => {
  const router = useRouter();
  const [shakeModal, setShakeModal] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cardData, setCardData] = useState<any>(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const onSubmitHandler = async (e: Event) => {
    e.preventDefault();
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
                  is_defered={false}
                  existingVideo={''}
                  video={cardData.video}
                  setData={setCardData}
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
