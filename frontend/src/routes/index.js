// frontend/src/routes/index.js
import { lazy } from 'react';

// ✅ Explicitly specify the Index.jsx file
const NotesPage = lazy(() => import('../pages/notes/Index')); // 加 /Index

const HelloPage = lazy(() => import('../Hello'));

const MarkdownViewer = lazy(() => import('../components/MarkdownViewer/MarkdownViewer'));

const routes = [
    {
        path: '/',
        component: NotesPage,
        exact: true,
        name: 'Home'
    },
    {
        path: '/notes',
        component: NotesPage,
        name: 'Note List'
    },
    {
        path: '/hello',
        component: HelloPage,
        name: 'Hello Page'
    },
    {
        path: '/docs/:lang?/:filename?',
        component: MarkdownViewer,
        name: 'Documentation'
    },
];

export default routes;