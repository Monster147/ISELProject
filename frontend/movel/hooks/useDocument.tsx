import {useContext} from "react";
import {DocumentContext} from "../ui/contexts/DocumentContext";

export function useDocument(){
    const context = useContext(DocumentContext)
    if (!context) {
        throw new Error("useDocument must be used within DocumentProvider");
    }
    return context;
}