import Card from "../components/atoms/Card";
import FlexCenter from "../components/atoms/FlexCenter";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Text from "../components/atoms/Text";
import useMessage from "../hooks/useMessage";
import { FcInfo } from "react-icons/fc";
import type { NextPage } from "next";
import FileContainer from "../components/atoms/FileContainer";
import ModalHeader from "../components/organisms/ModalHeader";
import Tooltip from "../components/atoms/Tooltip";
import FilterBox from "../components/atoms/FilterBox";

const Home: NextPage = () => {
  const { sendMessage } = useMessage();

  // return (
  //   <Card className="px-10 flex flex-col justify-center items-center">
  //     {/* Add S3 Link for iamge */}
  //     <img
  //       src={"https://assets.codepen.io/32795/poster.png"}
  //       alt="error"
  //       className="h-40 w-40 mb-16"
  //     />
  //     <div className="flex justify-center flex-col text-center gap-4">
  //       <Text className="font-semibold" size="h2">
  //         Error
  //       </Text>
  //       <div>
  //         <Text color="secondary" size="h5" className="text-center">
  //           The server encountered an error. The incident has been reported to
  //           admins.
  //         </Text>
  //         <Text color="secondary" size="h5" className="text-center">
  //           Please contact the merchant for assistance.
  //         </Text>
  //       </div>
  //       <div className="flex justify-center gap-2">
  //         <Text color="tertiary" size="h5">
  //           <a href="mailto:support@email.com">support@email.com</a>
  //         </Text>
  //         <Text color="secondary">|</Text>
  //         <Text color="tertiary" size="h5">
  //           <a href="tel:+91 98765 43210">+919876543210</a>
  //         </Text>
  //       </div>
  //     </div>
  //   </Card>
  // );

  return (
    <div className="h-screen w-screen">
      <FlexCenter>
        <Card className="relative p-8">
          <ModalHeader />
          <IoIosCloseCircleOutline
            className="absolute text-black md:text-white h-8 w-8 right-4 top-4 md:right-0 md:-top-10 cursor-pointer"
            onClick={() => sendMessage({ type: "close" })}
          />
          {/* PIYUSH CODE */}

          {/* Video Section */}
          <div>
            <Text className="font-semibold mb-4">Upload Video</Text>
            <FileContainer>
              <div>Hello</div>
            </FileContainer>
          </div>

          {/* Message Section */}
          <div>
            <Text className="font-semibold mt-6 mb-4">Message</Text>
            <input
              type="text"
              placeholder="Enter your message"
              className="messageInput"
            />
          </div>

          {/* 3D Filter Section */}
          <div>
            <Text className="font-semibold mt-6 mb-4">Select 3D Filter</Text>
            <div className="flex gap-4 overflow-x-auto w-auto">
              {Array.of(
                [1, 2, 3]
                  .fill(1)
                  .map((item, index) => <FilterBox key={index} />)
              )}
              {Array.of(
                [1, 2, 3]
                  .fill(1)
                  .map((item, index) => <FilterBox key={index} />)
              )}
              {Array.of(
                [1, 2, 3]
                  .fill(1)
                  .map((item, index) => <FilterBox key={index} />)
              )}
              {Array.of(
                [1, 2, 3]
                  .fill(1)
                  .map((item, index) => <FilterBox key={index} />)
              )}
              {Array.of(
                [1, 2, 3]
                  .fill(1)
                  .map((item, index) => <FilterBox key={index} />)
              )}
            </div>
          </div>

          {/* Upload Video Later Section */}
          <div className="text-justify uploadSection">
            <div>
              <div className="flex items-center gap-2">
                <input type={"checkbox"} className="inputCheckbox" />
                <Text className="font-semibold">Upload video later</Text>
                <Tooltip
                  title={`Once your order is placed, you will get a link on your email to
                upload the video and select 3D filter. The link will be live for
                72 hours from the time the order is placed.`}
                  className="sm:hidden"
                >
                  <FcInfo className="sm:hidden" />
                </Tooltip>
              </div>
              <Text color="secondary" size="h6" className="hidden sm:block">
                Once your order is placed, you will get a link on your email to
                upload the video and select 3D filter. The link will be live for
                72 hours from the time the order is placed.
              </Text>
            </div>
            <div>
              <input type="button" value="Submit" className="inputButton" />
            </div>
          </div>
        </Card>
      </FlexCenter>
    </div>
  );
};

export default Home;
