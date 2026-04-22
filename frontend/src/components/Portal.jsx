// frontend/src/components/Portal.jsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }) => {
    const [portalElement, setPortalElement] = useState(null);

    useEffect(() => {
        // Get or Create portal Element
        let element = document.getElementById('emoji-portal');
        if (!element) {
            element = document.createElement('div');
            element.id = 'emoji-portal';
            document.body.appendChild(element);
        }
        setPortalElement(element);

        return () => {
            // 清理
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }, []);

    if (!portalElement) return null;

    return createPortal(children, portalElement);
};

export default Portal;