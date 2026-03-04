import axiosClient from "@/lib/axiosClient";

// POST /massschuhe-order/admin-order/halbprobenerstellung/create
// Body (FormData): image3d_1, image3d_2, Halbprobenerstellung_pdf, totalPrice, Halbprobenerstellung_json, invoice

export const createLeistenkonfigurator = async (formData: FormData) => {
    try {
        const response = await axiosClient.post('/massschuhe-order/admin-order/halbprobenerstellung/create', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
}


