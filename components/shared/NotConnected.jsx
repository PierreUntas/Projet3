import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const NotConnected = () => {
    return (
        <Alert variant="default | destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
                Please connect your wallet to use the Dapp.
            </AlertDescription>
        </Alert>
    );
};

export default NotConnected;