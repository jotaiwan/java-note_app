import React from "react";
import { formatFileSize } from "../utils/fileHelpers";
import styles from "./FilePreview.module.css";

export default function FilePreview({
    files = [],
    images = [],
    onRemove,
    showRemoveButton = true,
}) {
    if (images.length === 0 && files.length === 0) return null;

    return (
        <div className={styles.filePreview}>
            {images.length > 0 && (
                <div className={styles.imagePreviews}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewTitle}>
                            🖼️ Images ({images.length})
                        </span>
                    </div>
                    <div className={styles.imageGrid}>
                        {images.map((img) => (
                            <div key={img.id} className={styles.imageItem}>
                                <div className={styles.imageContainer}>
                                    <img
                                        src={img.url}
                                        alt={img.displayName}
                                        className={styles.image}
                                    />
                                    {showRemoveButton && (
                                        <button
                                            type="button"
                                            onClick={() => onRemove?.(img.id)}
                                            className={styles.removeButton}
                                            title="Remove"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <div className={styles.imageInfo}>
                                    <div
                                        className={styles.imageName}
                                        title={img.displayName}
                                    >
                                        {img.displayName.length > 20
                                            ? img.displayName.substring(0, 17) +
                                              "..."
                                            : img.displayName}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className={styles.filePreviews}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewTitle}>
                            📎 Attachments ({files.length})
                        </span>
                    </div>
                    <div className={styles.fileGrid}>
                        {files.map((file) => (
                            <div key={file.id} className={styles.fileItem}>
                                <div className={styles.fileIcon}>
                                    {file.icon || "📎"}
                                </div>
                                <div className={styles.fileInfo}>
                                    <div
                                        className={styles.fileName}
                                        title={file.displayName}
                                    >
                                        {file.displayName.length > 30
                                            ? file.displayName.substring(
                                                  0,
                                                  27
                                              ) + "..."
                                            : file.displayName}
                                    </div>
                                    <div className={styles.fileDetails}>
                                        <span>
                                            {formatFileSize(
                                                file.sizeKB ||
                                                    Math.round(file.size / 1024)
                                            )}
                                        </span>
                                        <span className={styles.fileExt}>
                                            {file.ext?.toUpperCase() || ""}
                                        </span>
                                    </div>
                                </div>
                                {showRemoveButton && (
                                    <button
                                        type="button"
                                        onClick={() => onRemove?.(file.id)}
                                        className={styles.removeFileButton}
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
