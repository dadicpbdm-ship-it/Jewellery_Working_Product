import React from 'react';

const RewardsHistory = ({ history }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const styles = {
        container: {
            marginTop: '20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        },
        header: {
            padding: '15px 20px',
            borderBottom: '1px solid #eee',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#333'
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        item: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #f5f5f5'
        },
        itemLeft: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },
        description: {
            fontWeight: '500',
            color: '#333'
        },
        date: {
            fontSize: '0.85rem',
            color: '#888'
        },
        points: {
            fontWeight: 'bold',
            fontSize: '1rem'
        },
        positive: {
            color: '#28a745'
        },
        negative: {
            color: '#dc3545'
        },
        empty: {
            padding: '30px',
            textAlign: 'center',
            color: '#888'
        }
    };

    if (!history || history.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>Points History</div>
                <div style={styles.empty}>No points history yet. Start shopping to earn!</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>Points History</div>
            <ul style={styles.list}>
                {history.map((item, index) => (
                    <li key={index} style={styles.item}>
                        <div style={styles.itemLeft}>
                            <span style={styles.description}>{item.description}</span>
                            <span style={styles.date}>{formatDate(item.date)}</span>
                        </div>
                        <span style={{
                            ...styles.points,
                            ...(item.points > 0 ? styles.positive : styles.negative)
                        }}>
                            {item.points > 0 ? '+' : ''}{item.points}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RewardsHistory;
