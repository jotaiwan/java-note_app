import React, { useState, useRef } from 'react';
import styles from './SqlPreviewModal.module.css';
import ReactDOM from 'react-dom';

export default function SqlPreviewModal({
    isOpen,
    onClose,
    data
}) {
    const [activeTab, setActiveTab] = useState('preview');
    const sqlContentRef = useRef(null);

    if (!isOpen || !data) return null;

    const {
        fileInfo,
        parsedData,
        sqlStatements,
        preview
    } = data;

    // Original data order: [newest (top of file), ..., oldest (bottom of file)]
    // For execution: we need oldest (bottom) first, newest (top) last
    // So we need to reverse the order for execution

    // For display: show as is (newest to oldest)
    // For execution: reverse order (oldest to newest)

    // Get execution order (reversed for oldest-first insertion)
    const executionOrderSqlStatements = [...sqlStatements].reverse();

    // Copy all SQL (in execution order: oldest to newest)
    const copyAllSQL = () => {
        // Need to reverse for execution: oldest first, newest last
        const allSQL = executionOrderSqlStatements.map(stmt => stmt.sql).join('\n\n');
        navigator.clipboard.writeText(allSQL)
            .then(() => alert('All SQL copied to clipboard! Execution order: oldest to newest (bottom to top of file)'))
            .catch(err => console.error('Failed to copy:', err));
    };

    // Download SQL file (in execution order)
    const downloadSQLFile = () => {
        // Download in execution order
        const allSQL = executionOrderSqlStatements.map(stmt => stmt.sql).join('\n\n');
        const blob = new Blob([allSQL], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes_import_${Date.now()}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Copy single SQL
    const copySingleSQL = (sql) => {
        navigator.clipboard.writeText(sql)
            .then(() => alert('SQL copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    };

    // Get oldest and newest rows for preview
    const newestRow = parsedData.rows[0]; // Top of file
    const oldestRow = parsedData.rows[parsedData.rows.length - 1]; // Bottom of file

    return ReactDOM.createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className={styles.modalHeader}>
                    <h2>SQL Preview ({sqlStatements.length} statements)</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* File Info */}
                <div className={styles.fileInfo}>
                    <div className={styles.fileInfoItem}>
                        <strong>File:</strong> {fileInfo.name}
                    </div>
                    <div className={styles.fileInfoItem}>
                        <strong>Size:</strong> {fileInfo.size}
                    </div>
                    <div className={styles.fileInfoItem}>
                        <strong>Total Rows:</strong> {fileInfo.totalRows}
                    </div>
                    <div className={styles.fileInfoItem}>
                        <strong>SQL Statements:</strong> {sqlStatements.length}
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'preview' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('preview')}
                    >
                        Preview
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'data' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('data')}
                    >
                        Data View ({parsedData.rows.length} rows)
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'sql' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('sql')}
                    >
                        SQL ({sqlStatements.length} statements)
                    </button>
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {activeTab === 'preview' && (
                        <div className={styles.previewContent}>
                            <div className={styles.previewSection}>
                                <h3>Headers ({parsedData.headers.length})</h3>
                                <div className={styles.headersGrid}>
                                    {parsedData.headers.map((header, index) => (
                                        <span key={index} className={styles.headerItem}>
                                            {header}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.previewSection}>
                                <h3>Newest Record (First in file, Last to insert)</h3>
                                <div className={styles.rowInfo}>
                                    <span className={styles.rowLabel}>
                                        Position: Top of file | Line: {newestRow?.original_line_number || 'N/A'} | Execution: Last
                                    </span>
                                </div>
                                <pre className={styles.dataRow}>
                                    {JSON.stringify(
                                        preview?.firstDataRow || newestRow?.data || newestRow || {},
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>

                            <div className={styles.previewSection}>
                                <h3>Oldest Record (Last in file, First to insert)</h3>
                                <div className={styles.rowInfo}>
                                    <span className={styles.rowLabel}>
                                        Position: Bottom of file | Line: {oldestRow?.original_line_number || 'N/A'} | Execution: First
                                    </span>
                                </div>
                                <pre className={styles.dataRow}>
                                    {JSON.stringify(
                                        preview?.lastDataRow || oldestRow?.data || oldestRow || {},
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>

                            {preview?.firstSql && (
                                <div className={styles.previewSection}>
                                    <h3>Last SQL Statement (Newest record - executes last)</h3>
                                    <div className={styles.sqlPreview}>
                                        <pre>{preview.firstSql}</pre>
                                    </div>
                                </div>
                            )}

                            {preview?.lastSql && (
                                <div className={styles.previewSection}>
                                    <h3>First SQL Statement (Oldest record - executes first)</h3>
                                    <div className={styles.sqlPreview}>
                                        <pre>{preview.lastSql}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className={styles.dataContent}>
                            <div className={styles.tableInfo}>
                                <p className={styles.infoNote}>
                                    <strong>File Order (Display):</strong> Data shown from newest (top of file) to oldest (bottom of file)
                                </p>
                                <p className={styles.infoNote}>
                                    <strong>Execution Order (INSERT):</strong> Execute from OLDEST (bottom) to NEWEST (top) - see SQL tab for correct sequence
                                </p>
                                <p className={styles.infoNote}>
                                    <strong>Rule:</strong> Oldest data first, newest data last
                                </p>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.dataTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>File Position</th>
                                            <th>Execution Order</th>
                                            {parsedData.headers.map((header, index) => (
                                                <th key={index}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.rows.map((row, rowIndex) => {
                                            // Calculate execution order (reversed)
                                            const executionOrder = parsedData.rows.length - rowIndex;

                                            return (
                                                <tr key={rowIndex}>
                                                    <td className={styles.lineNumber}>
                                                        {rowIndex + 1}
                                                    </td>
                                                    <td className={styles.filePosition}>
                                                        {row.original_line_number || rowIndex + 1}
                                                    </td>
                                                    <td className={styles.executionOrder}>
                                                        {executionOrder}
                                                        {executionOrder === 1 ? ' 👈 First' :
                                                            executionOrder === parsedData.rows.length ? ' 👈 Last' : ''}
                                                    </td>
                                                    {parsedData.headers.map((header, colIndex) => (
                                                        <td key={colIndex}>
                                                            {row.data && row.data[header] ? row.data[header] :
                                                                row[header] || <em>NULL</em>}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sql' && (
                        <div className={styles.sqlContent}>
                            <div className={styles.sqlInstructions}>
                                <div className={styles.instructionBox}>
                                    <h4>📋 Manual Execution Instructions</h4>
                                    <ol>
                                        <li><strong>Execution Order:</strong> SQL statements are listed from OLDEST to NEWEST</li>
                                        <li><strong>Why this order?</strong> File bottom = oldest record (insert first), File top = newest record (insert last)</li>
                                        <li>Execute statements in shown order (top to bottom)</li>
                                        <li>First statement = Oldest data (bottom of file)</li>
                                        <li>Last statement = Newest data (top of file)</li>
                                        <li>This ensures proper INSERT sequence (chronological order)</li>
                                        <li>Copy all SQL statements below</li>
                                        <li>Open DBeaver and connect to your database</li>
                                        <li>Paste the SQL in a new SQL editor</li>
                                        <li>Execute the statements</li>
                                    </ol>
                                    <button
                                        className={styles.instructionButton}
                                        onClick={() => alert('SQL statements are ordered from OLDEST (bottom of file) to NEWEST (top of file).\n\nFile structure:\n• Bottom = Oldest record (execute first)\n• Top = Newest record (execute last)\n\nExecute statements in the shown order for proper chronological insertion.')}
                                    >
                                        Show Instructions Again
                                    </button>
                                </div>
                            </div>

                            <div className={styles.sqlList} ref={sqlContentRef}>
                                {executionOrderSqlStatements.map((stmt, index) => {
                                    const executionNumber = index + 1;
                                    const totalStatements = executionOrderSqlStatements.length;

                                    return (
                                        <div key={index} className={styles.sqlStatement}>
                                            <div className={styles.sqlHeader}>
                                                <span className={styles.sqlNumber}>
                                                    Execution #{executionNumber} of {totalStatements}
                                                    {stmt.original_line_number &&
                                                        ` (File Line ${stmt.original_line_number})`}
                                                </span>
                                                <span className={styles.positionIndicator}>
                                                    {executionNumber === 1 ? '👈 FIRST to execute' :
                                                        executionNumber === totalStatements ? '👈 LAST to execute' : ''}
                                                </span>
                                                <button
                                                    className={styles.copyButton}
                                                    onClick={() => copySingleSQL(stmt.sql)}
                                                    title="Copy this SQL"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                            <div className={styles.sqlBody}>
                                                <pre>{stmt.sql}</pre>
                                            </div>
                                            {stmt.preview && (
                                                <div className={styles.sqlFooter}>
                                                    <small>Data: {stmt.preview}</small>
                                                    <small className={styles.executionHint}>
                                                        {executionNumber === 1 ? '← Oldest data (bottom of file)' :
                                                            executionNumber === totalStatements ? '← Newest data (top of file)' : ''}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className={styles.modalFooter}>
                    <div className={styles.leftButtons}>
                        <button
                            className={styles.actionButton}
                            onClick={copyAllSQL}
                            title="Copy all SQL to clipboard (Oldest to Newest execution order)"
                        >
                            📋 Copy All SQL (Oldest→Newest)
                        </button>
                        <button
                            className={styles.actionButton}
                            onClick={downloadSQLFile}
                            title="Download SQL file in execution order"
                        >
                            💾 Download SQL (Execution Order)
                        </button>
                    </div>
                    <div className={styles.rightButtons}>
                        <button
                            className={styles.cancelButton}
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            className={styles.infoButton}
                            onClick={() => alert('EXECUTION ORDER: Oldest → Newest\n\nFile structure:\n• Bottom of file = Oldest data (execute FIRST)\n• Top of file = Newest data (execute LAST)\n\nSQL statements are already in correct execution order.\nJust copy and execute them as shown.')}
                        >
                            ℹ️ Execution Order Info
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}