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
import { getProductData } from '../api';
import Loading from '../components/atoms/Loading';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const Home: NextPage = () => {
  const router = useRouter();

  const { sendMessage } = useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [dataFromClient, setDataFromClient] =
    useState<dataFromClientType | null>(null);
  const [productData, setProductData] = useState<productDataType | null>(null);
  const [userSelectedData, setUserSelectedData] = useState<any>({});

  const receiveMessage = (event: { data: { type: string; data: any } }) => {
    if (event.data.type === 'INITIAL_DATA') {
      setDataFromClient(event.data.data);
    }
  };

  const onSubmitHandler = (e: Event) => {
    console.log('Submit');
    e.preventDefault();
    ['photo', 'video', 'text'].every((item: string) => {
      if (
        !(
          Boolean(productData?.productMetaData[item]?.isActive) ==
          Boolean(userSelectedData[item])
        )
      ) {
        // toast.error(`Please add ${item}`);
        alert(`Please add ${item}`);
        return false;
      }

      return true;
    });
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
        console.log('DATA', dataFromClient);

        try {
          const res = await getProductData({
            apiKey: dataFromClient?.client_data?.key,
            productId: dataFromClient?.product_id
          });
          console.log(res.data);
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
        <Card className="relative p-8 flex flex-col">
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
                    <h4 className="font-bold text-sm text-[#111827] mb-2">
                      Upload Photo
                    </h4>
                    <ProductImage
                      existingPhoto=""
                      photo={userSelectedData.photo}
                      setData={setUserSelectedData}
                    />
                  </div>
                )}
                {productData?.productMetaData?.video?.isActive && (
                  <VideoUpload
                    existingVideo=""
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
                handleSubmit={onSubmitHandler}
                is_deferred={userSelectedData.is_deferred}
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

export async function getServerSideProps() {
  return {
    props: {}
  };
}
