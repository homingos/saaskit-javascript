import { IoIosCloseCircleOutline } from 'react-icons/io';

import Card from '../../components/atoms/Card';
import FlexCenter from '../../components/atoms/FlexCenter';
import useMessage from '../../hooks/useMessage';

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Loading from '../../components/atoms/Loading';

const Error: NextPage<{ error: any }> = ({ error }) => {
  const { sendMessage, ready } = useMessage('SANDBOX');

  const [clientData, setClientData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const receiveMessage = (event: { data: { type: string; payload: any } }) => {
    if (event.data.type === 'INITIAL_DATA_ERR') {
      setClientData(event.data.payload);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.addEventListener('message', receiveMessage);

    return () => window.removeEventListener('message', receiveMessage);
  }, []);

  useEffect(() => {
    if (ready) {
      sendMessage({
        type: 'READY_TO_RECEIVE_ERR'
      });
    }
  }, [ready]);

  return (
    <div className="h-screen w-screen">
      <FlexCenter>
        <Card className="relative px-10 py-10 flex flex-col justify-center items-center md:w-[48rem]">
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
              <img src="/wifi_error.svg" alt="error" className="h-2/5 w-auto" />
              <p className="text-2xl font-semibold text-brand_black ">
                {error}
              </p>
              <div className="text-brand_gray2 px-10 text-md my-4">
                <p color="secondary" className="text-center">
                  The server encountered an error. The incident has been
                  reported to admins.
                </p>
                <p color="secondary" className="text-center">
                  Please contact the merchant for assistance.
                </p>
              </div>
              <div className="flex gap-2 text-center">
                {clientData.email && (
                  <p className="text-brand_blue">
                    <a href={`mailto:${clientData?.email}`}>
                      {clientData?.email}
                    </a>
                  </p>
                )}
                {clientData.email && clientData.phone && (
                  <div className="text-brand_gray2">|</div>
                )}
                {clientData.phone && (
                  <p className="text-brand_blue">
                    <a href={`tel:${clientData?.phone}`}>{clientData?.phone}</a>
                  </p>
                )}
              </div>
            </>
          )}
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
