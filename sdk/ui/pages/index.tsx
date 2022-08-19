import Card from "../components/atoms/Card";
import FlexCenter from "../components/atoms/FlexCenter";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Text from "../components/atoms/Text";
import useMessage from "../hooks/useMessage";
import type { NextPage } from "next";
import ModalHeader from "../components/organisms/ModalHeader";
import VideoUpload from "../components/organisms/VideoUpload";
import Scrollable from "../components/atoms/Scrollable";
import CardMessage from "../components/organisms/CardMessage";
import ThemeSelect from "../components/organisms/ThemeSelect";
import ModalFooter from "../components/organisms/ModalFooter";
import ProductImage from "../components/molecules/ProductImage";

const Home: NextPage = () => {
  const { sendMessage } = useMessage();

  if (false) {
    return (
      <Card className="px-10 flex flex-col justify-center items-center">
        {/* Add S3 Link for iamge */}
        <img
          src={"../assets/images/wifi-error.png"}
          alt="error"
          className="h-40 w-40"
        />
        <div className="flex justify-center flex-col text-center gap-2">
          <Text className="font-semibold" size="h3">
            Error
          </Text>
          <div>
            <Text color="secondary" size="h5" className="text-center">
              The server encountered an error. The incident has been reported to
              admins.
            </Text>
            <Text color="secondary" size="h5" className="text-center">
              Please contact the merchant for assistance.
            </Text>
          </div>
          <div className="flex gap-2 text-center">
            <Text color="tertiary">
              <a href="support@email.com">support@email.com</a>
            </Text>
            <div>|</div>
            <Text color="tertiary">
              <a href="tel:+91 98765 43210">+91 98765 43210</a>
            </Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-screen w-screen">
      <FlexCenter>
        <Card className="relative p-8 flex flex-col">
          <IoIosCloseCircleOutline
            className="absolute text-black md:text-white h-8 w-8 right-4 top-4 md:right-0 md:-top-10 cursor-pointer"
            onClick={() => sendMessage({ type: "close" })}
          />
          <ModalHeader />

          <Scrollable className="py-4">
              <div className="md:hidden mb-3">
                <h4 className="font-bold text-sm text-[#111827] mb-2">Upload Photo</h4>
                <ProductImage /></div>
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
