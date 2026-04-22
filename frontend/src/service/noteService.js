// frontend/src/service/noteService.js
import axios from 'axios';

const API_BASE_URL = '/api';

const noteService = {
    async getAllNotes(dateFilter = null) {
        try {
            const params = {};
            if (dateFilter !== null && dateFilter !== 'all') {
                params.date_filter = dateFilter;
            }
            const response = await axios.get(`${API_BASE_URL}/notes`, { params });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            throw error;
        }
    },

    async getDateFilters() {
        try {
            const response = await axios.get(`${API_BASE_URL}/notes/date-filters`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch date filters:', error);
            return {
                success: true,
                data: this.getDefaultDateFilters()
            };
        }
    },

    getDefaultDateFilters() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 2020; year--) {
            years.push(year.toString());
        }
        return [
            { value: '90', label: 'Last 90 Days' },
            { value: '180', label: 'Last 180 Days' },
            { value: '360', label: 'Last 360 Days' },
            ...years.map(year => ({ value: year, label: `Year ${year}` })),
            { value: 'all', label: 'All Notes' }
        ];
    },

    createNote: async (submitData) => {
        try {
            const formData = new FormData();
            formData.append('ticket', submitData.ticket);
            formData.append('status', submitData.status);
            formData.append('note', submitData.note);
            formData.append('subject', submitData.subject || '');
            if (submitData.created) {
                formData.append('created', submitData.created);
            }
            if (submitData.title) {
                formData.append('title', submitData.title);
            }
            if (submitData.images && submitData.images.length > 0) {
                submitData.images.forEach((file) => {
                    if (file instanceof File) formData.append('images[]', file);
                });
            }
            if (submitData.attachments && submitData.attachments.length > 0) {
                submitData.attachments.forEach((file) => {
                    if (file instanceof File) formData.append('attachments[]', file);
                });
            }
            if (submitData.attachmentInfo) {
                formData.append('attachmentInfo', JSON.stringify(submitData.attachmentInfo));
            }
            if (submitData.imageInfo) {
                formData.append('imageInfo', JSON.stringify(submitData.imageInfo));
            }

            const response = await axios({
                method: 'post',
                url: `${API_BASE_URL}/notes`,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating note:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async searchNotes(searchTerm) {
        try {
            const response = await axios.get(`${API_BASE_URL}/notes/search`, {
                params: { q: searchTerm }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to search notes:', error);
            throw error;
        }
    },

    async updateNote(id, noteData) {
        try {
            let formData;
            if (noteData instanceof FormData) {
                formData = noteData;
            } else {
                formData = new FormData();
                formData.append('_method', 'PUT');
                Object.keys(noteData).forEach(key => {
                    if (!['attachments', 'images', 'attachmentInfo', 'imageInfo'].includes(key)) {
                        formData.append(key, noteData[key]);
                    }
                });
                if (noteData.images && noteData.images.length > 0) {
                    noteData.images.forEach((file) => {
                        if (file instanceof File) formData.append('images[]', file);
                    });
                }
                if (noteData.attachments && noteData.attachments.length > 0) {
                    noteData.attachments.forEach((file) => {
                        if (file instanceof File) formData.append('attachments[]', file);
                    });
                }
            }
            const response = await axios.post(`${API_BASE_URL}/notes/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to update note:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    getAttachmentUrl(attachmentId) {
        return `${API_BASE_URL}/notes/attachments/${attachmentId}`;
    },

    async downloadAttachment(attachmentId, fileName) {
        try {
            const response = await axios.get(`${API_BASE_URL}/notes/attachments/${attachmentId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || `attachment-${attachmentId}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            return { success: true };
        } catch (error) {
            console.error('Failed to download attachment:', error);
            throw error;
        }
    },

    async deleteAttachment(noteId, attachmentId) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/notes/${noteId}/attachments/${attachmentId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to delete attachment:', error);
            throw error;
        }
    },

    async getNoteAttachments(noteId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/notes/${noteId}/attachments`);
            return response.data;
        } catch (error) {
            console.error('Failed to get note attachments:', error);
            throw error;
        }
    },

    async deleteNote(id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/notes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to delete note:', error);
            throw error;
        }
    },

    async getNotesByTicket(ticket) {
        try {
            const response = await axios.get(`${API_BASE_URL}/notes/ticket/${ticket}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get notes by ticket:', error);
            throw error;
        }
    }
};

export default noteService;
