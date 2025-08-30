import { Alert, Toast } from "react-bootstrap"

import "./Notification.css"

interface Props {
    message: string
    variant: string
    onClose: () => void
}

function Notification(props: Props) {
    const { message, variant, onClose } = props
    return (
        <Toast
            className="notification"
            show={message !== ""}
            onClose={onClose}
            autohide={true}
            delay={5000}
        >
            <Alert
                variant={variant}
                dismissible={true}
                onClose={onClose}
            >
                {message}
            </Alert>
        </Toast>
    )
}

export default Notification
