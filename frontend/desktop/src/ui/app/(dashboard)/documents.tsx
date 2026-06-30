import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDocument } from "@hooks/data/useDocument";
import {
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";
import { Documents } from "@commons/models/documents/Documents";
import { MdExpandMore, MdExpandLess, MdDownload } from "react-icons/md";
import ThemedView from "@components/ThemedView";
import ThemedLoader from "@components/ThemedLoader";
import ThemedText from "@commons/components/ThemedText";
import Spacer from "@commons/components/Spacer";
import ThemedCard from "@commons/components/ThemedCard";

/**
 * Ecrã de listagem de documentos (versão desktop/web).
 * Obtém os documentos via `useDocument`, agrupa-os por tipo em secções expansíveis e permite
 * descarregar cada documento individualmente, mostrando um indicador enquanto o download decorre.
 */
const Document = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const { documents, downloadDocument, loading } = useDocument();

  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = async (id: number, fileName: string) => {
    try {
      setDownloading(id);
      await downloadDocument(id);
    } catch (error) {
    } finally {
      setDownloading(null);
    }
  };

  const documentsByType = documents.reduce(
    (acc, doc) => {
      const type = doc.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(doc);
      return acc;
    },
    {} as { [key: string]: Documents[] },
  );

  const documentTypes = Object.keys(documentsByType);

  const renderDocumentType = ({ item: type }: { item: string }) => {
    const isExpanded = expandedType === type;
    const docs = documentsByType[type] || [];

    return (
      <ThemedCard style={styles.card}>
        <Pressable
          onPress={() => setExpandedType(isExpanded ? null : type)}
          style={styles.typeHeader}
        >
          <ThemedText style={styles.typeName}>{type}</ThemedText>
          {isExpanded ? (
            <MdExpandLess size={24} color={theme.text} />
          ) : (
            <MdExpandMore size={24} color={theme.text} />
          )}
        </Pressable>

        {isExpanded && (
          <ThemedView
            style={[
              styles.expandedContent,
              { backgroundColor: theme.uiBackground },
            ]}
          >
            {docs.length > 0 ? (
              docs.map((doc) => (
                <ThemedView
                  key={doc.id}
                  style={[
                    styles.documentItem,
                    { backgroundColor: theme.uiBackground },
                  ]}
                >
                  <ThemedText style={styles.documentName}>
                    {doc.name}
                  </ThemedText>
                  <Pressable
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
      </ThemedCard>
    );
  };

  if (loading) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <ThemedLoader />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container} safe={true}>
      <Spacer />
      <ThemedText title={true} style={styles.heading}>
        {t("documents.documents")}
      </ThemedText>

      <Spacer />

      {documentTypes.length > 0 ? (
        <FlatList
          data={documentTypes}
          renderItem={renderDocumentType}
          keyExtractor={(item) => item}
          scrollEnabled={true}
          contentContainerStyle={styles.list}
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

export default Document;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    margin: 20,
    padding: 0,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 4,
  },
  typeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "600",
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
  },
  documentName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
  },
});
