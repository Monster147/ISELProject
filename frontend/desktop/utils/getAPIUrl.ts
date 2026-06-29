import {isDev} from "../src/electron/utils";
import { API_URL } from "@commons/constants/apiurl";

/**
 * Utilitário para utilizar o URL correto dependendo se está em
 * modo de desenvolvimento ou em produção.
 */
export function getAPIUrl(): string {
    if(isDev()){
        return "/api"
    } else {
        return `${API_URL}/api`
    }
}