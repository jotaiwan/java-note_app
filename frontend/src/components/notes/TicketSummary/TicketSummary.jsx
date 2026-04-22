// 導入 CSS 模組
import styles from './TicketSummary.module.css'; // 或者你的 CSS 檔案路徑

export default function TicketSummary({ groupedNotes }) {
    const stats = [
        {
            icon: '🎫',
            value: Object.keys(groupedNotes || {}).length,
            label: 'Total Tickets',
            color: '#3b82f6'
        },
        {
            icon: '📝',
            value: Object.values(groupedNotes || {}).reduce((total, notes) => total + notes.length, 0),
            label: 'Total Notes',
            color: '#10b981'
        },
        {
            icon: '⏰',
            value: Object.values(groupedNotes || {})
                .flat()
                .filter(note => note.status === 'pending').length,
            label: 'Pending',
            color: '#f59e0b'
        },
        {
            icon: '✅',
            value: Object.values(groupedNotes || {})
                .flat()
                .filter(note => note.status === 'resolved').length,
            label: 'Resolved',
            color: '#8b5cf6'
        }
    ];

    return (
        <div className={styles.ticketSummary}>
            <div className={styles.header}>
                <h3 className={styles.title}>📊 Statistics Overview</h3>
            </div>

            <div className={styles.statsInline}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.inlineItem}>
                        <span className={styles.inlineIcon}>{stat.icon}</span>
                        <span className={styles.inlineValue} style={{ color: stat.color }}>
                            {stat.value}
                        </span>
                        <span className={styles.inlineLabel}>{stat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}