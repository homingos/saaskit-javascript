import type { NextPage } from 'next'
import Card from '../components/atoms/Card'
import FlexCenter from '../components/atoms/FlexCenter'
import {IoIosCloseCircleOutline} from "react-icons/io";
import Text from '../components/atoms/Text';
import useMessage from '../hooks/useMessage';

const Home: NextPage = () => {

  const { sendMessage } = useMessage();

  return (
    <div className='h-screen w-screen'>
      <FlexCenter>
        <Card className='relative'>
          <div>Hello</div>
          <IoIosCloseCircleOutline className='absolute h-8 w-8 right-0 -top-10 cursor-pointer' />
          <Text>Upload Video</Text>
          <IoIosCloseCircleOutline className='absolute h-8 w-8 right-0 -top-10 cursor-pointer' onClick={() => sendMessage({type: "close"})} />
        </Card>
      </FlexCenter>
    </div>
  )
}

export default Home
