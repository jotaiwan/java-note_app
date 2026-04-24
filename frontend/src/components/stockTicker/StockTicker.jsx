import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import styles from './StockTicker.module.css';

const StockTicker = ({ symbols = ['TRIP'] }) => {
    const [stocks, setStocks] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [source, setSource] = useState('alpaca');
    const [showSourceMenu, setShowSourceMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
    const sourceButtonRef = useRef(null);
    const [showTicker, setShowTicker] = useState(false);

    const pendingRequests = useRef({});

    const sourceLabel = source === 'finnhub' ? 'Finnhub' : 'AlpacaMarkets';

    const fetchAllStocks = useCallback(async () => {
        // Don't check showTickerRef here - rely on the calling useEffect
        if (!showTicker) return;

        try {
            setLoading(true);

            const promises = symbols.map(symbol => {
                const url = `/api/stocks/${symbol}/json?source=${source}`;

                if (pendingRequests.current[url]) {
                    return pendingRequests.current[url];
                }

                const reqPromise = axios.get(url)
                    .finally(() => {
                        delete pendingRequests.current[url];
                    });

                pendingRequests.current[url] = reqPromise;

                return reqPromise
                    .then(response => {
                        console.log('Stock API response:', response);
                        const data = response.data;
                        // Handle both nested (stockInfo) and flat response structures
                        const stockInfo = data?.stockInfo || data;
                        const riseOrDrop = stockInfo.rise_or_drop || {};
                        const dailyHighestObj = stockInfo.daily_highest || {
                            price: stockInfo.high || stockInfo.highest || 0,
                            timestamp_sydney: stockInfo.daily_highest?.timestamp_sydney || stockInfo.daily_highest?.timestamp || ''
                        };

                        const currentPrice = parseFloat(riseOrDrop.latest_close || stockInfo.current || stockInfo.c) || 0;
                        const openingPrice = parseFloat(riseOrDrop.opening || stockInfo.open || stockInfo.o) || 0;
                        const dailyHigh = parseFloat(dailyHighestObj.price) || parseFloat(stockInfo.high || stockInfo.h) || 0;
                        const change = parseFloat(riseOrDrop.change) || 0;
                        const percentChange = parseFloat(riseOrDrop.change_percent) || 0;

                        return {
                            symbol,
                            data: {
                                c: currentPrice,
                                d: change,
                                dp: percentChange,
                                dailyHighest: dailyHigh,
                                isAtDailyHigh: currentPrice === dailyHigh,
                                original: {
                                    daily_highest: dailyHigh,
                                    opening_price: openingPrice,
                                    latest_close: currentPrice,
                                    change: change,
                                    change_percent: percentChange,
                                    trend: change >= 0 ? '▲' : '▼',
                                    source: stockInfo.source,
                                    daily_highest_timestamp: dailyHighestObj.timestamp_sydney || dailyHighestObj.timestamp_utc
                                }
                            }
                        };
                    })
                    .catch(err => ({
                        symbol,
                        data: {
                            c: 0, d: 0, dp: 0, dailyHighest: 0, isAtDailyHigh: false,
                            error: true,
                            errorMessage: `Failed to load from ${source}: ${err.response?.data?.error || err.message}`
                        }
                    }));
            });

            const results = await Promise.all(promises);
            const stockData = {};
            results.forEach(result => {
                if (result) {
                    stockData[result.symbol] = result.data;
                    console.log('Loaded stock:', result.symbol, result.data);
                }
            });

            console.log('Setting stocks state:', stockData);
            setStocks(stockData);
            setError(null);
        } catch (err) {
            console.error('Stock fetch error:', err.message);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [symbols, source, showTicker]);

    const intervalTime = 600000;

    useEffect(() => {
        if (showTicker) {
            fetchAllStocks();
            const interval = setInterval(fetchAllStocks, intervalTime);
            return () => clearInterval(interval);
        }
    }, [fetchAllStocks, showTicker]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSourceMenu && sourceButtonRef.current &&
                !sourceButtonRef.current.contains(event.target) &&
                !event.target.closest(`.${styles['source-menu-portal']}`)) {
                setShowSourceMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSourceMenu]);

    const formatPrice = (price) => {
        if (price === undefined || price === null || price === 0) return 'N/A';
        return `$${parseFloat(price).toFixed(2)}`;
    };

    const formatChange = (change, changePercent) => {
        if (change === undefined || change === null || change === 0) return '';
        const numericChange = parseFloat(change);
        const numericPercent = parseFloat(changePercent);
        const sign = numericChange > 0 ? '+' : numericChange < 0 ? '-' : '';
        const percentSign = numericPercent > 0 ? '+' : numericPercent < 0 ? '-' : '';
        const changeValue = Math.abs(numericChange).toFixed(2);
        const percentValue = Math.abs(numericPercent).toFixed(2);
        return `${sign}${changeValue} (${percentSign}${percentValue}%)`;
    };

    const handleRefresh = () => fetchAllStocks();

    const toggleSourceMenu = () => {
        if (sourceButtonRef.current) {
            const rect = sourceButtonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setShowSourceMenu(!showSourceMenu);
    };

    const selectSource = (newSource) => {
        setSource(newSource);
        setShowSourceMenu(false);
    };

    const SourceMenuPortal = () => {
        if (!showSourceMenu) return null;
        return ReactDOM.createPortal(
            <div className={styles['source-menu-portal']}>
                <div
                    className={styles['source-menu']}
                    style={{
                        position: 'absolute',
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        minWidth: `${menuPosition.width}px`
                    }}
                >
                    <button
                        onClick={() => selectSource('alpaca')}
                        className={source === 'alpaca' ? styles.active : ''}
                    >
                        <span className={styles.menuIcon}>📊</span>
                        AlpacaMarkets
                    </button>
                    <button
                        onClick={() => selectSource('finnhub')}
                        className={source === 'finnhub' ? styles.active : ''}
                    >
                        <span className={styles.menuIcon}>📈</span>
                        Finnhub
                    </button>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className={styles['stock-ticker-wrapper']}>
            <div className={styles['stock-ticker']}>
                <div className={styles['ticker-controls']}>
                    <input
                        type="checkbox"
                        checked={showTicker}
                        onChange={() => setShowTicker(!showTicker)}
                        id="show-ticker-checkbox"
                    />
                    <label htmlFor="show-ticker-checkbox">
                        {!showTicker ? 'Show Stock Info' : ''}
                    </label>
                </div>

                {showTicker && (
                    <>
                        {loading && Object.keys(stocks).length === 0 ? (
                            <>
                                <div className={styles['source-dropdown']}>
                                    <button
                                        ref={sourceButtonRef}
                                        className={styles['source-toggle']}
                                        onClick={toggleSourceMenu}
                                        title={`Source: ${sourceLabel}`}
                                    >
                                        {source === 'alpaca' ? '📊 A' : '📈 F'}
                                        <span className={styles.dropdownArrow}>▼</span>
                                    </button>
                                </div>
                                <SourceMenuPortal />
                                <div className={styles.loadingText}>
                                    Loading from {sourceLabel}...
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles['source-dropdown']}>
                                    <button
                                        ref={sourceButtonRef}
                                        className={styles['source-toggle']}
                                        onClick={toggleSourceMenu}
                                        title={`Source: ${sourceLabel}`}
                                    >
                                        {source === 'alpaca' ? '📊' : '📈'}
                                        <span className={styles.dropdownArrow}>▼</span>
                                    </button>
                                    <SourceMenuPortal />
                                </div>

                                <div className={styles['ticker-container']}>
                                    {symbols.map(symbol => {
                                        const data = stocks[symbol];
                                        console.log('Rendering symbol:', symbol, 'data:', data);

                                        if (!data) {
                                            return (
                                                <div key={symbol} className={styles['stock-item']}>
                                                    <span className={styles['stock-symbol']}>{symbol}</span>
                                                    <span className={styles['stock-price']}>Loading...</span>
                                                </div>
                                            );
                                        }

                                        const hasError = data.error;
                                        const isNoData = data.c === 0 && data.d === 0 && data.dp === 0;
                                        const trend = data.original?.trend;

                                        if (hasError) {
                                            return (
                                                <div key={symbol} className={styles['stock-item']}>
                                                    <span className={styles['stock-symbol']}>{symbol}</span>
                                                    <span className={styles['stock-error']} title={data.errorMessage}>
                                                        Error: {data.errorMessage}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={symbol} className={styles['stock-item']}>
                                                <span className={styles['stock-symbol']}>{symbol}</span>

                                                {data.dailyHighest > 0 && (
                                                    <span
                                                        className={styles['daily-high-badge']}
                                                        title={`Daily High: ${formatPrice(data.dailyHighest)}`}
                                                    >
                                                        🏆 {formatPrice(data.dailyHighest)}
                                                    </span>
                                                )}

                                                <span
                                                    className={`${styles['price-badge']} ${data.d >= 0 ? styles['price-up'] : styles['price-down']}`}
                                                >
                                                    {trend === '▲' || data.d >= 0 ? '▲' : '▼'}
                                                    {' '}{formatPrice(data.c)}{' '}
                                                    {formatChange(data.d, data.dp)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    className={styles['refresh-btn']}
                                    onClick={handleRefresh}
                                    title={`Refresh from ${source}`}
                                    disabled={loading}
                                >
                                    {loading ? '⟳' : '↻'}
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StockTicker;
