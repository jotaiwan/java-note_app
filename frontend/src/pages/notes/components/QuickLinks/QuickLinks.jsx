import React from 'react';
import styles from './QuickLinks.module.css';
import { getCombinedSections } from './utils/configLoader';
import { useCredential } from '../../../../hooks';

const QuickLinks = ({
    groups = ['group1', 'personal'] // Default to both groups
}) => {
    const { getCredentialAndCopy, isLoading, error } = useCredential();
    // Get all sections from all groups
    const allSections = getCombinedSections(groups);

    // Handle vault link click
    const handleVaultClick = async (link, event) => {
        event.preventDefault(); // Stop the normal link behavior
        event.stopPropagation(); // Stop event bubbling

        const credentialKey = link.credentialKey || 'vault';
        const credentialEnvironment = link.credentialEnvironment || 'int';

        const success = await getCredentialAndCopy(credentialKey, credentialEnvironment);

        if (success) {
            // Still open the URL in new tab
            window.open(link.url, '_blank', 'noopener,noreferrer');
        } else {
            // Fallback: just open the link
            window.open(link.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className={styles.container}>
            {allSections.map((section, sectionIndex) => (
                <div
                    key={sectionIndex}
                    className={styles.linkRow}
                    data-type={section.type.toUpperCase()}
                >
                    {/* Icon section */}
                    <div className={styles.iconSection}>
                        {section.image ? (
                            <div className={styles.imageContainer}>
                                <img
                                    src={section.image}
                                    alt={section.type}
                                    className={styles.iconImage}
                                />
                            </div>
                        ) : (
                            <span className={styles.icon}>{section.icon}</span>
                        )}
                        <span className={styles.strongSeparator}>·</span>
                    </div>

                    {/* Links section */}
                    <div className={styles.linksSection}>
                        {section.links.map((link, linkIndex) => {
                            // Check if this is a vault link that needs credential
                            const isVaultLink = section.type === 'vault' || link.credentialType === 'api';

                            return (
                                <React.Fragment key={link.name}>
                                    {isVaultLink ? (
                                        // Vault link - use button with click handler
                                        <button
                                            onClick={(e) => handleVaultClick(link, e)}
                                            className={styles.linkButton}
                                            title={`Click to copy credential and open ${link.name}`}
                                            style={{ '--hover-color': link.color }}
                                            disabled={isLoading}
                                        >
                                            <span className={styles.linkText}>{link.name}</span>
                                        </button>
                                    ) : (
                                        // Regular link - use normal anchor tag
                                        <a
                                            href={link.url}
                                            target={link.url.startsWith('http') ? '_blank' : '_self'}
                                            rel={link.url.startsWith('http') ? 'noopener noreferrer' : ''}
                                            className={styles.linkButton}
                                            title={link.name}
                                            style={{ '--hover-color': link.color }}
                                        >
                                            <span className={styles.linkText}>{link.name}</span>
                                        </a>
                                    )}
                                    {linkIndex < section.links.length - 1 && (
                                        <span className={styles.strongSeparator}>·</span>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuickLinks;