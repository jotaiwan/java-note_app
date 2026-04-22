// frontend/src/pages/notes/components/Auth/VaultAuth.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Vault.css'; // Create this CSS file for styling
import { useCredential, useCopyToClipboard } from '../../../../hooks';

const Vault = () => {
    const { getCredentialAndCopy, isLoading: isFetchingCredential, error } = useCredential();
    const { copyToClipboard } = useCopyToClipboard();
    const [copied, setCopied] = useState(false);

    // Tooltip states
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    const timeoutRef = useRef(null);

    // Define your vault links/commands
    const vaultLinks = [
        {
            id: 'jenkins',
            name: 'Jenkins CI',
            command: 'https://jenkins.group1.example.com/job/ci',
            icon: '⚙️',
            credentialKey: 'jenkins_ci',
            needsCredential: true
        },
        {
            id: 'vault',
            name: 'Vault UI',
            command: 'https://vault.example.com',
            icon: '🔐',
            credentialKey: 'vault_admin',
            needsCredential: true
        },
        {
            id: 'k8s',
            name: 'Kubernetes',
            command: 'kubectl get pods',
            icon: '☸️',
            credentialKey: 'k8s_token',
            needsCredential: true
        },
        {
            id: 'aws',
            name: 'AWS CLI',
            command: 'aws sts get-caller-identity',
            icon: '☁️',
            credentialKey: 'aws_access',
            needsCredential: true
        }
    ];

    // Handle click on a vault link
    const handleLinkClick = async (link) => {
        if (link.needsCredential) {
            const success = await getCredentialAndCopy(link.credentialKey, 'int'); // Assuming 'int' environment
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);

                // Optional: Auto-open the URL after copying
                if (link.command.startsWith('http')) {
                    setTimeout(() => {
                        window.open(link.command, '_blank');
                    }, 500);
                }
            } else if (error) {
                // The hook now handles its own error logging, but you can add UI feedback
                alert('Failed to fetch credential');
            }
        } else {
            // For non-credential commands, just copy
            copyToClipboard(link.command);
        }
    };

    // Handle direct copy without credential fetch
    const handleCopyClick = (command, e) => {
        if (e) e.stopPropagation();
        copyToClipboard(command);
    };

    // Tooltip handlers
    const handleButtonMouseEnter = (tooltipType = 'vault') => {
        clearTimeout(timeoutRef.current);
        setActiveTooltip(tooltipType);
        setIsTooltipVisible(true);
    };

    const handleButtonMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsTooltipVisible(false);
            setActiveTooltip(null);
            setActiveItem(null);
        }, 300);
    };

    const handleItemMouseEnter = (id) => {
        clearTimeout(timeoutRef.current);
        setActiveItem(id);
    };

    const handleItemMouseLeave = () => {
        clearTimeout(timeoutRef.current);
    };

    const handleTooltipMouseEnter = () => {
        clearTimeout(timeoutRef.current);
    };

    const handleTooltipMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsTooltipVisible(false);
            setActiveTooltip(null);
            setActiveItem(null);
        }, 300);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="vault-container">
            {/* Vault Button with Tooltip */}
            <div className="vault-button-wrapper">
                <button
                    className={`vault-button ${isFetchingCredential ? 'loading' : ''} ${copied ? 'copied' : ''}`}
                    onMouseEnter={() => handleButtonMouseEnter('vault')}
                    onMouseLeave={handleButtonMouseLeave}
                    title="Vault Credentials"
                    disabled={isFetchingCredential}
                >
                    {isFetchingCredential ? (
                        <span className="vault-icon spinner">⏳</span>
                    ) : copied ? (
                        <span className="vault-icon">✓</span>
                    ) : (
                        <span className="vault-icon">🔐</span>
                    )}
                </button>

                {/* Vault Tooltip */}
                {isTooltipVisible && activeTooltip === 'vault' && (
                    <div
                        className="vault-tooltip"
                        onMouseEnter={handleTooltipMouseEnter}
                        onMouseLeave={handleTooltipMouseLeave}
                    >
                        <div className="tooltip-header">
                            <h4>🔐 Vault Credentials</h4>
                            <p className="tooltip-subtitle">Click to copy credentials</p>
                        </div>
                        <ul className="tooltip-list">
                            {vaultLinks.map((link) => (
                                <li
                                    key={link.id}
                                    onMouseEnter={() => handleItemMouseEnter(link.id)}
                                    onMouseLeave={handleItemMouseLeave}
                                    onClick={() => handleLinkClick(link)}
                                    className={`tooltip-item ${activeItem === link.id ? 'active-item' : ''}`}
                                >
                                    <span className="item-icon">{link.icon}</span>
                                    <div className="item-content">
                                        <span className="item-label">{link.name}</span>
                                        <span className="item-command">{link.command}</span>
                                    </div>
                                    <button
                                        className="copy-button"
                                        onClick={(e) => handleCopyClick(link.command, e)}
                                        title="Copy command"
                                    >
                                        {link.needsCredential ? '🔑' : '📋'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="tooltip-footer">
                            <span className="footer-text">Click to copy credential + open link</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vault;