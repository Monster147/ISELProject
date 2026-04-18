import {createContext, useState} from "react";
import {Intervenor} from "@commons/models/intervenor/Intervenor";
import {Documents} from "@commons/models/Documents/Documents";
import {api} from "@commons/api/api";
import {IntervenorContext} from "./IntervenorContext";

type DocumentContextValue = {
    documents: Documents[]
    getAllDocuments: () => Promise<any>
    getDocumentById: (id:number) => Promise<any>
    getDocumentByName: (name:string) => Promise<any>
    getDocumentByType: (type:string) => Promise<any>
    getAllDocumentTypes: () => Promise<any>
    downloadDocument :(id:number)=>Promise<any>
}

export const DocumentContext = createContext<DocumentContextValue | undefined>(undefined)

export function DocumentProvider({children}) {
    const [documents, setDocuments] = useState<Documents[]>([])

    async function getAllDocuments(){
        try {
            const response=await api.getAllDocument()
            setDocuments(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function getDocumentById(id:number){
        try {
            const response=await api.getDocumentById(id)
            return response
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function getDocumentByName(name:string){
        try {
            const response=await api.getDocumentByName(name)
            return response
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function getDocumentByType(type:string){
        try {
            const response= await api.getDocumentByType(type)
            return response
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function getAllDocumentTypes(){
        try {
            const response= await api.getAllDocumentTypes()
            return response
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function downloadDocument(id:number){
        try {
            await api.downloadDocument(id)
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    return (
        <DocumentContext.Provider value={{getAllDocumentTypes, getDocumentByType, getDocumentByName, getDocumentById, getAllDocuments, documents, downloadDocument}}>
            {children}
        </DocumentContext.Provider>
    )
}