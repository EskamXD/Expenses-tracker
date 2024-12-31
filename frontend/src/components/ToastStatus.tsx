import { Toast } from "react-bootstrap";

interface ToastStatusProps {
    show: boolean;
    setShow: Function;
    type: string;
    headerStrong: string;
    body: string;
    icon: any;
}
const ToastStatus: React.FC<ToastStatusProps> = ({
    show,
    setShow,
    type,
    headerStrong,
    body,
    icon,
}) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0"); // Get hours (0-23) and pad with leading 0 if needed
    const minutes = now.getMinutes().toString().padStart(2, "0"); // Get minutes (0-59) and pad with leading 0 if needed

    return (
        <Toast
            bg={type}
            show={show}
            onClose={() => setShow(false)}
            delay={5000}
            autohide>
            <Toast.Header>
                {icon}
                <strong className="me-auto">{headerStrong}</strong>
                <small>{`${hours}:${minutes}`}</small>
            </Toast.Header>
            <Toast.Body>{body}</Toast.Body>
        </Toast>
    );
};

export default ToastStatus;
