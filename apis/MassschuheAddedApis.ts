import axiosClient from "@/lib/axiosClient";


// create massschuhe added {
//     "customerId": "",
//     "employeeId": "",
//   "arztliche_diagnose": "Plattfuß",
//   "usführliche_diagnose": "Kongenitaler Plattfuß, starke Schmerzen beim Gehen",
//   "rezeptnummer": "RX-2025-004",
//   "durchgeführt_von": "Dr. Meier",
//   "note": "Individuelle Schuheinlagen erforderlich",
//   "albprobe_geplant": false,
//   "kostenvoranschlag": false
// }

export const createMassschuheAdded = async (massschuheAddedData: any) => {
    try {
        const response = await axiosClient.post('/massschuhe-order/create', massschuheAddedData);
        return response.data;
    } catch (error: any) {
        // If there's an error response with data, return it
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};
