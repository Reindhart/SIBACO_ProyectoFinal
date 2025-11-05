import { API_URL } from "./config"
export interface Option {
	value: string
	label: string
	data: any
}

export const fetchOptions = async (): Promise<Option[]> => {
	const response = await fetch(API_URL + "/enterprise/read/combo") // Asegúrate de ajustar la URL a tu endpoint
	if (!response.ok) {
		throw new Error("Error al obtener las opciones")
	}
	return response.json()
}
