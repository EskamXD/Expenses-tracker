import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-bootstrap";
// import { ToastPosition } from "react-bootstrap/esm/ToastContainer";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import ToastStatus from "./ToastStatus";

interface ToasterProps {
    type: string;
    header: string;
    message: string;
}

interface ToastInterface {
    show: boolean;
    setShow: Function;
    type: string;
    headerStrong: string;
    body: string;
    icon: any;
}

interface ToastIcons {
    success: JSX.Element;
    danger: JSX.Element;
}

/**
 * @brief A React component for displaying a toast notification.
 * @file Toaster.jsx
 * This component renders a toast notification that displays a message with an icon.
 * The icon can be an error icon (red) or a success icon (green).
 *
 * @component
 * @param {string} type - The type of toast notification (error or success).
 * @param {string} header - The header text to display in the toast notification.
 * @param {string} message - The message to display in the toast notification.
 *
 * @return {JSX.Element} A toast notification component.
 */

const Toaster: React.FC<ToasterProps> = ({ type, header, message }) => {
    const [toastArray, setToastArray] = useState<ToastInterface[]>([]);

    const iconType: ToastIcons = {
        success: <CheckCircleOutlineIcon />,
        danger: <ErrorOutlineIcon />,
    };

    useEffect(() => {
        const newToast = {
            show: true,
            setShow: setToastArray,
            type: type,
            headerStrong: header,
            body: message,
            icon: iconType[type as keyof ToastIcons],
        };

        setToastArray([...toastArray, newToast]);
    }, [type, header, message]);

    return (
        <ToastContainer
            className="p-3"
            position="bottom-start"
            style={{ zIndex: 1 }}>
            {toastArray &&
                toastArray.map((toast, index) => (
                    <ToastStatus
                        key={index}
                        show={toast.show}
                        setShow={toast.setShow}
                        type={toast.type}
                        headerStrong={toast.headerStrong}
                        body={toast.body}
                        icon={toast.icon}
                    />
                ))}
        </ToastContainer>
    );
};

export default Toaster;
