import { StyleSheet, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { Colors } from "@commons/constants/Colors";
import { AuthProvider } from "@contexts/AuthContext";
import ThemedView from "@components/ThemedView";
import { OccurrenceProvider } from "@contexts/OccurrenceContext";
import { IntervenorProvider } from "@contexts/IntervenorContext";
import "../i18next/i18next";
import "@utils/ConfigureApiMobile";
import "@hooks/system/useNetworkStatus";
import { DocumentProvider } from "@contexts/DocumentContext";
import { TypeProvider } from "@contexts/TypeContext";
import { EvidenceProvider } from "@contexts/EvidenceContext";
import { StatsProvider } from "@contexts/StatsContext";
import { OfflineSyncProvider } from "@contexts/OfflineSyncContext";
import { SyncSSEProvider } from "@contexts/SyncSSEContext";

/**
 * Layout raiz da aplicação móvel (expo-router).
 * Encadeia todos os providers de contexto (sincronização offline, autenticação, SSE, ocorrências,
 * intervenientes, documentos, tipos, evidências e estatísticas) à volta da navegação por `Stack`,
 * disponibilizando o estado global a toda a aplicação e aplicando o tema ativo aos ecrãs.
 */
const RootLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <AuthProvider>
      <SyncSSEProvider>
        <OfflineSyncProvider>
          <OccurrenceProvider>
            <IntervenorProvider>
              <DocumentProvider>
                <TypeProvider>
                  <EvidenceProvider>
                    <StatsProvider>
                      <ThemedView style={{ flex: 1 }}>
                        <Stack
                          screenOptions={{
                            headerStyle: {
                              backgroundColor: theme.navBackground,
                            },
                            headerTintColor: theme.title,
                            contentStyle: { backgroundColor: theme.background },
                            animation: "none",
                          }}
                        >
                          <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="about"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="contact"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="(auth)"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="(dashboard)"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="home"
                            options={{ headerShown: false }}
                          />
                        </Stack>
                      </ThemedView>
                    </StatsProvider>
                  </EvidenceProvider>
                </TypeProvider>
              </DocumentProvider>
            </IntervenorProvider>
          </OccurrenceProvider>
        </OfflineSyncProvider>
      </SyncSSEProvider>
    </AuthProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
