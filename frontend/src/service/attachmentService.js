// src/service/attachmentService.js
import api from './api';

export const attachmentService = {
    upload: (noteId, formData) => {
        return api.post(`/notes/${noteId}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    download: (attachmentId, filename) => {
        return api.get(`/attachments/${attachmentId}`, {
            responseType: 'blob'
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        });
    },

    delete: (attachmentId) => {
        return api.delete(`/attachments/${attachmentId}`);
    },

    getUrl: (attachmentId) => {
        return `/api/attachments/${attachmentId}`;
    }
};