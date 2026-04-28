import {useContext} from "react";
import {EvidenceContext} from "../contexts/EvidenceContext";

export function useEvidence(){
    const context = useContext(EvidenceContext)
    if (!context) {
        throw new Error("useEvidence must be used within EvidenceProvider");
    }
    return context;
}