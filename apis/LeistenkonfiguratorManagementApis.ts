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



// create Halbprobenerstellung  /massschuhe-order/admin-order/halbprobenerstellung/upload-checkliste/{{Id}}
export const getHalbprobenerstellungCheckliste = async (id: string) => {
    try {
        const response = await axiosClient.get(`/massschuhe-order/admin-order/halbprobenerstellung/get-checkliste/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// update apis massschuhe-order/admin-order/halbprobenerstellung/upload-checkliste/{{Id}}

// body: {
//     "checkliste_halbprobe": {
//           JSON AS YOU WANT TO UPLOADE
//     }
// }
export const updateHalbprobenerstellungCheckliste = async (id: string, formData: FormData) => {
    try {
        const response = await axiosClient.post(`/massschuhe-order/admin-order/halbprobenerstellung/upload-checkliste/${id}`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
}
