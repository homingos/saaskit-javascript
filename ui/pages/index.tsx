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
import ThemeSelect from '../components/organisms/ThemeSelect';
import VideoUpload from '../components/organisms/VideoUpload';
import useMessage from '../hooks/useMessage';

import type { NextPage } from 'next';
const Home: NextPage = () => {
  const { sendMessage } = useMessage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.addEventListener('message', event => {
      console.log('Event recieved in child', event);
    });

    return () =>
      window.removeEventListener('message', event => {
        console.log('Event recieved in child', event);
      });
  }, []);

  return (
    <div className="h-screen w-screen">
      <FlexCenter>
        <Card className="relative p-8 flex flex-col">
          <IoIosCloseCircleOutline
            className="absolute text-black md:text-white h-8 w-8 right-4 top-4 md:right-0 md:-top-10 cursor-pointer"
            onClick={() => sendMessage({ type: 'close' })}
          />
          <ModalHeader />

          <Scrollable className="py-4">
            <div className="md:hidden mb-3">
              <h4 className="font-bold text-sm text-[#111827] mb-2">
                Upload Photo
              </h4>
              <ProductImage />
            </div>
            <VideoUpload />
            <CardMessage />
            <ThemeSelect />
          </Scrollable>

          <ModalFooter />
        </Card>
      </FlexCenter>
    </div>
  );
};

export default Home;

// export async function getServerSideProps(context: { query: { product_id: string } }) {
//   try {
//     if (context.query.product_id) {
//       const res = await axios.get(`https://dev.homingos.com/saas/api/v1/products`, {
//         params: {
//           product_id: context.query.product_id
//         },
//         headers: {
//           "x-api-key": "o78N5gJ639CcgCbc9zsj-00edz0"
//         }
//       });
//       return {
//         props: { data: res.data.data }
//       }
//     } else {
//       throw new Error("Product ID missing")
//     }
//   } catch (err) {
//     return {
//       props: { error: "Error occured!" }
//     }
//   }
// }
