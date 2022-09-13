import { useEffect, useState } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';

import Card from '../../components/atoms/Card';
import FlexCenter from '../../components/atoms/FlexCenter';
import Loading from '../../components/atoms/Loading';
import useMessage from '../../hooks/useMessage';

import type { NextPage } from 'next';
import { getCLientData } from '../../api';

const Error: NextPage<{ error: any }> = ({ error }) => {
  const { sendMessage, parentUrl, receiveMessage } = useMessage('SANDBOX');

  const [clientData, setClientData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleMessage = async (event: {
    origin: string;
    data: { type: string; payload: any };
  }) => {
    if (event?.data?.type === 'INITIAL_DATA_ERR') {
      const eventData = event.data.payload;
      if (!eventData?.email || !eventData?.phone) {
        try {
          const res = await getCLientData({
            env: eventData.environment,
            apiKey: eventData.key
          });
          if (res.status == 200) {
            setClientData({
              email: eventData?.email || res?.data?.businessEmail || '',
              phone:
                eventData?.phone ||
                res?.data?.countryCode + res?.data?.phoneNumber ||
                ''
            });
          } else {
            throw '';
          }
        } catch (err: any) {
          setClientData({
            email: '',
            phone: ''
          });
        }
      } else {
        setClientData({
          email: eventData?.email,
          phone: eventData?.phone
        });
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const listener = (event: ReceivedEventType) =>
      receiveMessage(event, handleMessage);
    window.addEventListener('message', listener);

    return () => window.removeEventListener('message', listener);
  }, [parentUrl]);

  useEffect(() => {
    if (parentUrl) {
      sendMessage({
        type: 'READY_TO_RECEIVE_ERR'
      });
    }
  }, [parentUrl]);

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
                <p className="text-center">
                  The server encountered an error. The incident has been
                  reported to admins.
                </p>
                <p className="text-center">
                  Please contact the merchant for assistance.
                </p>
              </div>
              <div className="flex gap-2 text-center">
                {clientData?.email && (
                  <p className="text-[color:var(--primary)]">
                    <a href={`mailto:${clientData?.email}`}>
                      {clientData?.email}
                    </a>
                  </p>
                )}
                {clientData?.email && clientData?.phone && (
                  <div className="text-brand_gray2">|</div>
                )}
                {clientData?.phone && (
                  <p className="text-[color:var(--primary)]">
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
