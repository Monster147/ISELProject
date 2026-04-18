import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useDocument } from "../../../hooks/useDocument";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";
import { Documents } from "@commons/models/Documents/Documents";
import { MdExpandMore, MdExpandLess, MdDownload } from "react-icons/md";
import ThemedView from "../../../../components/ThemedView";
import ThemedLoader from "../../../../components/ThemedLoader";
import ThemedText from "../../../../components/ThemedText";
import Spacer from "../../../../components/Spacer";

const Document = () => {
    const { t } = useTranslation()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const { getAllDocumentTypes, getDocumentByType, downloadDocument } = useDocument()

    const [documentTypes, setDocumentTypes] = useState<string[]>([])
    const [expandedType, setExpandedType] = useState<string | null>(null)
    const [documentsByType, setDocumentsByType] = useState<{ [key: string]: Documents[] }>({})
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState<number | null>(null)

    useEffect(() => {
        loadDocumentTypes();
    }, []);

    const loadDocumentTypes = async () => {
        try {
            setLoading(true)
            const types = await getAllDocumentTypes()
            setDocumentTypes(types || [])
        } catch (error) {
        } finally {
            setLoading(false)
        }
    };

    const handleTypePress = async (type: string) => {
        if (expandedType === type) {
            setExpandedType(null)
            return;
        }

        if (!documentsByType[type]) {
            try {
                const docs = await getDocumentByType(type)
                setDocumentsByType(prev => ({
                    ...prev,
                    [type]: Array.isArray(docs) ? docs : [docs]
                }))
            } catch (error) {
            }
        }

        setExpandedType(type)
    };

    const handleDownload = async (id: number, fileName: string) => {
        try {
            setDownloading(id)
            await downloadDocument(id)
        } catch (error) {
        } finally {
            setDownloading(null)
        }
    };

    const renderDocumentType = ({ item: type }: { item: string }) => {
        const isExpanded = expandedType === type;
        const docs = documentsByType[type] || [];

        return (
            <ThemedView style={styles.typeContainer}>
                <Pressable
                    style={styles.typeHeader}
                    onPress={() => handleTypePress(type)}
                >
                    <ThemedView style={styles.typeHeaderContent}>
                        <ThemedText style={styles.typeName}>
                            {type}
                        </ThemedText>
                    </ThemedView>
                    {isExpanded ? (
                        <MdExpandLess size={24} color={theme.text} />
                    ) : (
                        <MdExpandMore size={24} color={theme.text} />
                    )}
                </Pressable>

                {isExpanded && (
                    <ThemedView style={styles.expandedContent}>
                        {docs.length > 0 ? (
                            docs.map(doc => (
                                <ThemedView
                                    key={doc.id}
                                    style={styles.documentItem}
                                >
                                    <ThemedView style={styles.documentInfo}>
                                        <ThemedText style={styles.documentName}>
                                            {doc.name}
                                        </ThemedText>
                                    </ThemedView>
                                    <Pressable
                                        style={styles.downloadButton}
                                        onPress={() => handleDownload(doc.id, doc.name)}
                                        disabled={downloading === doc.id}
                                    >
                                        {downloading === doc.id ? (
                                            <ActivityIndicator size={20} color={theme.text} />
                                        ) : (
                                            <MdDownload size={20} color={theme.text} />
                                        )}
                                    </Pressable>
                                </ThemedView>
                            ))
                        ) : (
                            <ThemedText style={styles.emptyMessage}>
                                {t("documents.noDocuments")}
                            </ThemedText>
                        )}
                    </ThemedView>
                )}
            </ThemedView>
        );
    };

    if (loading) {
        return <ThemedLoader />;
    }

    return (
        <ThemedView style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                {t("documents.documents")}
            </ThemedText>
            <Spacer />
            {documentTypes.length > 0 ? (
                <FlatList
                    data={documentTypes}
                    renderItem={renderDocumentType}
                    keyExtractor={item => item}
                    style={styles.list}
                    scrollEnabled={true}
                />
            ) : (
                <ThemedView style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyMessage}>
                        {t("documents.noDocument")}
                    </ThemedText>
                </ThemedView>
            )}
        </ThemedView>
    );
};


export default Document

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    list: {
        flex: 1,
    },
    typeContainer: {
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        overflow: "hidden",
    },
    typeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    typeHeaderContent: {
        flex: 1,
    },
    typeName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    typeCount: {
        fontSize: 12,
    },
    expandedContent: {
        borderTopWidth: 1,
        padding: 12,
    },
    documentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 14,
        fontWeight: "500",
    },
    downloadButton: {
        padding: 8,
        borderRadius: 6,
        marginLeft: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyMessage: {
        fontSize: 14,
        textAlign: "center",
    },
    heading:{
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
    },
});
