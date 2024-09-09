import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-bootstrap";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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

const Toaster = ({ type, header, message }) => {
    const [toastArray, setToastArray] = useState([]);

    const iconType = [
        { success: <CheckCircleOutlineIcon /> },
        { danger: <ErrorOutlineIcon /> },
    ];

    useEffect(() => {
        const newToast = {
            show: true,
            setShow: setToastArray,
            type: type,
            headerStrong: header,
            body: message,
            icon: iconType[type],
        };

        setToastArray([...toastArray, newToast]);
    }, [type, header, message]);

    return (
        <ToastContainer
            className="p-3"
            position="bottom-start"
            style={{ zIndex: 1 }}>
            {toastArray &&
                toastArray.map((toast) => (
                    <ToastStatus
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

