import type { NextPage } from 'next'
import Card from '../components/atoms/Card'
import FlexCenter from '../components/atoms/FlexCenter'
import {IoIosCloseCircleOutline} from "react-icons/io";
<<<<<<< Updated upstream:sdk/ui-2/pages/index.tsx
import Text from '../components/atoms/Text';
=======
import useMessage from '../hooks/useMessage';
>>>>>>> Stashed changes:sdk/ui/pages/index.tsx

const Home: NextPage = () => {

  const { sendMessage } = useMessage();

  return (
    <div className='h-screen w-screen'>
      <FlexCenter>
        <Card className='relative'>
          <div>Hello</div>
<<<<<<< Updated upstream:sdk/ui-2/pages/index.tsx
          <IoIosCloseCircleOutline className='absolute h-8 w-8 right-0 -top-10 cursor-pointer' />
          {/* PIYUSH CODE */}
          <Text>Upload Video</Text>
=======
          <IoIosCloseCircleOutline className='absolute h-8 w-8 right-0 -top-10 cursor-pointer' onClick={() => sendMessage({type: "close"})} />
>>>>>>> Stashed changes:sdk/ui/pages/index.tsx
        </Card>
      </FlexCenter>
    </div>
  )
}

export default Home
