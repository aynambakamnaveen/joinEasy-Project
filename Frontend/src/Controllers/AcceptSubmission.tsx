import api from "../api/axios.ts";

export const acceptSubmission = async (submissionId: string, groupId: string, loading: (value: boolean) => void) => {
    try {
        loading(true);
        const response = await api.patch(`/submissionAccepted/${submissionId}/${groupId}`, {
            isConfirmedByAdminSent: true
        });
        return response.data;
    } catch (error) {
        throw error;
    } finally {
        loading(false);
    }
}