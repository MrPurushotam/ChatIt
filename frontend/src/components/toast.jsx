import { Toaster, toast } from 'react-hot-toast';

export const showToast = (message, type, position = "top-center") => {
    switch (type) {
        case 'success':
            toast.success(message, { position });
            break;
        case 'error':
            toast.error(message, { position });
            break;
        case 'loading':
            toast.loading(message, { position });
            break;
        default:
            toast(message, { position });
    }
};

const ToastNotification = () => {
    return <Toaster />;
};

export default ToastNotification;
