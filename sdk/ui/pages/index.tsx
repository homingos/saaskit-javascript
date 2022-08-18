import type { NextPage } from 'next'
import Card from '../components/atoms/Card'
import FlexCenter from '../components/atoms/FlexCenter'
import {IoIosCloseCircleOutline} from "react-icons/io";
import Text from '../components/atoms/Text';
import useMessage from '../hooks/useMessage';
import ModalHeader from '../components/organisms/ModalHeader';

const Home: NextPage = () => {

  const { sendMessage } = useMessage();

  return (
    <div className='h-screen w-screen'>
      <FlexCenter>
        <Card className='relative'>
          <ModalHeader />
          <IoIosCloseCircleOutline className='absolute text-white h-8 w-8 right-0 -top-10 cursor-pointer' onClick={() => sendMessage({type: "close"})} />
        </Card>
      </FlexCenter>
    </div>
  )
}

export default Home
