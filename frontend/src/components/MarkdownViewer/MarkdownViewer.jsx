// src/components/MarkdownViewer/MarkdownViewer.jsx
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MarkdownViewer.module.css';

export default function MarkdownViewer() {
    const { lang = 'English', filename } = useParams();  // filename 直接从 URL 获取
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [docList, setDocList] = useState([]);

    // 获取文档列表
    useEffect(() => {
        fetch(`/api/docs/${lang}/list`)
            .then(res => res.json())
            .then(data => {
                if (data.docs) {
                    setDocList(data.docs);

                    // 如果 URL 没有指定 filename，默认选择第一个文档
                    if (!filename && data.docs.length > 0) {
                        navigate(`/docs/${lang}/${data.docs[0].id}`, { replace: true });
                    }
                }
            })
            .catch(err => console.error('Failed to load doc list:', err));
    }, [lang, navigate, filename]);

    // 获取文档内容 - 直接用 URL 中的 filename
    useEffect(() => {
        if (!filename) return;  // 如果没有 filename，不获取内容

        setLoading(true);
        fetch(`/api/docs/${lang}/${filename}`)
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP error ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setContent(data.content);
                    setError('');
                }
            })
            .catch(err => {
                setError(err.message);
                console.error('Fetch error:', err);
            })
            .finally(() => setLoading(false));
    }, [lang, filename]);  // 依赖 filename，不是映射后的名字

    if (loading && filename) {
        return <div className={styles.loading}>加载中...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.languageSwitcher}>
                    <button
                        onClick={() => navigate(`/docs/Chinese/${filename || ''}`)}
                        className={lang === 'Chinese' ? styles.active : ''}
                    >
                        中文
                    </button>
                    <button
                        onClick={() => navigate(`/docs/English/${filename || ''}`)}
                        className={lang === 'English' ? styles.active : ''}
                    >
                        English
                    </button>
                </div>

                <h3>📚 {lang === 'Chinese' ? '文档列表' : 'Documents'}</h3>
                <ul>
                    {docList.map(doc => (
                        <li key={doc.id}>
                            <a
                                href={`/docs/${lang}/${doc.id}`}
                                className={filename === doc.id ? styles.active : ''}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/docs/${lang}/${doc.id}`);
                                }}
                            >
                                {doc.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.content}>
                {error ? (
                    <div className={styles.error}>{error}</div>
                ) : !filename ? (
                    <div className={styles.welcome}>
                        <h2>欢迎使用文档系统</h2>
                        <p>请从左侧选择一篇文档</p>
                    </div>
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
}