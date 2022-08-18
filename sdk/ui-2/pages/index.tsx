import type { NextPage } from 'next'
import Card from '../components/atoms/Card'
import FlexCenter from '../components/atoms/FlexCenter'
import {IoIosCloseCircleOutline} from "react-icons/io";

const Home: NextPage = () => {
  return (
    <div className='h-screen w-screen'>
      <FlexCenter>
        <Card className='relative'>
          <div>Hello</div>
          <IoIosCloseCircleOutline className='absolute h-8 w-8 right-0 -top-10 cursor-pointer' />
        </Card>
      </FlexCenter>
    </div>
  )
}

export default Home
