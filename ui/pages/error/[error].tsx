import { IoIosCloseCircleOutline } from 'react-icons/io';

import Card from '../../components/atoms/Card';
import FlexCenter from '../../components/atoms/FlexCenter';
import useMessage from '../../hooks/useMessage';

import type { NextPage } from 'next';

const Error: NextPage<{ error: any }> = ({ error }) => {
  const { sendMessage } = useMessage();

  return (
    <div className="h-screen w-screen">
      <FlexCenter>
        <Card className="relative px-10 flex flex-col justify-center items-center md:w-[48rem]">
          <IoIosCloseCircleOutline
            className="absolute text-black md:text-white h-8 w-8 right-4 top-4 md:right-0 md:-top-10 cursor-pointer"
            onClick={() => sendMessage({ type: 'CLOSE' })}
          />
          <img src="/wifi_error.svg" alt="error" className="h-2/5 w-auto" />
          <p className="text-2xl font-semibold text-brand_black ">{error}</p>
          <div className="text-brand_gray2 px-10 text-md my-4">
            <p color="secondary" className="text-center">
              The server encountered an error. The incident has been reported to
              admins.
            </p>
            <p color="secondary" className="text-center">
              Please contact the merchant for assistance.
            </p>
          </div>
          <div className="flex gap-2 text-center">
            <p className="text-brand_blue">
              <a href="mailto:support@gmail.com">support@gmail.com</a>
            </p>
            <div className="text-brand_gray2">|</div>
            <p className="text-brand_blue">
              <a href="tel:+919876543210">+91 98765 43210</a>
            </p>
          </div>
        </Card>
      </FlexCenter>
    </div>
  );
};

export default Error;

export async function getServerSideProps(context: {
  query: { error: string };
}) {
  return {
    props: { error: context.query.error }
  };
}
