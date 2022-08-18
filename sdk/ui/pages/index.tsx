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

const Home: NextPage = () => {
  const { sendMessage } = useMessage();

  return (
    <div className="h-screen w-screen">
      <FlexCenter>
        <Card className="relative p-8">
          <ModalHeader />
          <IoIosCloseCircleOutline
            className="absolute text-white h-8 w-8 right-0 -top-10 cursor-pointer"
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
              <input type={"button"} value="Submit" className="inputButton" />
            </div>
          </div>
        </Card>
      </FlexCenter>
    </div>
  );
};

export default Home;
