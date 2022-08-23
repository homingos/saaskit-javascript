import { useRouter } from "next/router";
import Card from "../../components/atoms/Card";

function Error() {
    const router = useRouter();

    console.log("Router", router.query)
    return (
        <Card className="px-10 flex flex-col justify-center items-center">
            {/* Add S3 Link for iamge */}
            <img src={'../assets/images/wifi-error.png'} alt="error" className="h-40 w-40" />
            <div className="flex justify-center flex-col text-center gap-2">
                <p className="font-semibold">
                    Error
                </p>
                <div>
                    <p color="secondary" className="text-center">
                        The server encountered an error. The incident has been reported to admins.
                    </p>
                    <p color="secondary" className="text-center">
                        Please contact the merchant for assistance.
                    </p>
                </div>
                <div className="flex gap-2 text-center">
                    <p color="tertiary">
                        <a href="support@email.com">support@email.com</a>
                    </p>
                    <div>|</div>
                    <p color="tertiary">
                        <a href="tel:+91 98765 43210">+91 98765 43210</a>
                    </p>
                </div>
            </div>
        </Card>
    );

}

export default Error;