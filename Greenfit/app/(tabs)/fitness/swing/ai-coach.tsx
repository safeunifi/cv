import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Send, Zap, Bot } from 'lucide-react-native';
import { GolfColors } from '@/constants/golf-theme';
import { useSwingStore } from '@/stores/swing-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  streamCoachResponse,
  COACH_STARTERS,
  type CoachMessage,
} from '@/lib/ai/neoclaw-coach';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export default function AiCoachScreen() {
  const { currentAnalysis } = useSwingStore();
  const profile = useAuthStore((s) => s.profile);

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const streamingContent = useRef('');

  const profileContext = {
    injuryAreas: profile?.injuryAreas ?? [],
    equipmentTier: profile?.equipmentTier ?? 'none',
    golfExperience: profile?.golfExperience ?? null,
    fitnessGoals: profile?.fitnessGoals ?? [],
    targetCalories: profile?.targetCalories ?? null,
    targetProteinG: profile?.targetProteinG ?? null,
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    if (!API_KEY) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        {
          role: 'assistant',
          content:
            'To use the AI Coach, add your Anthropic API key as EXPO_PUBLIC_ANTHROPIC_API_KEY in your .env file.',
        },
      ]);
      return;
    }

    const userMessage: CoachMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setStreaming(true);
    streamingContent.current = '';

    // Add a placeholder assistant message that we'll update as chunks arrive
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    await streamCoachResponse({
      messages: updatedMessages,
      analysis: currentAnalysis,
      profile: profileContext,
      apiKey: API_KEY,
      onChunk: (chunk) => {
        streamingContent.current += chunk;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: streamingContent.current,
          };
          return next;
        });
        scrollRef.current?.scrollToEnd({ animated: false });
      },
      onDone: () => {
        setStreaming(false);
        scrollRef.current?.scrollToEnd({ animated: true });
      },
      onError: (err) => {
        setStreaming(false);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: `Sorry, I ran into an issue: ${err}`,
          };
          return next;
        });
      },
    });
  }, [messages, streaming, currentAnalysis, profileContext]);

  const hasAnalysis = !!currentAnalysis;
  const showStarters = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={GolfColors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiDot} />
          <Text style={styles.headerTitle}>NemoClaw AI Coach</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Context banner */}
      {hasAnalysis && (
        <View style={styles.contextBanner}>
          <Zap size={14} color={GolfColors.primary} />
          <Text style={styles.contextText}>
            Coaching based on your swing score: {currentAnalysis!.overallScore}/100
            · {currentAnalysis!.faults.length} fault{currentAnalysis!.faults.length !== 1 ? 's' : ''} detected
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome */}
        {messages.length === 0 && (
          <View style={styles.welcomeCard}>
            <Bot size={32} color={GolfColors.primary} />
            <Text style={styles.welcomeTitle}>Your AI Golf Coach</Text>
            <Text style={styles.welcomeSubtitle}>
              {hasAnalysis
                ? "I've analyzed your swing. Let's work on getting you better."
                : "Ask me anything about golf fitness, mobility, or nutrition."}
            </Text>
          </View>
        )}

        {/* Starter questions */}
        {showStarters && (
          <View style={styles.starters}>
            {COACH_STARTERS.map((starter) => (
              <TouchableOpacity
                key={starter}
                style={styles.starterBtn}
                onPress={() => sendMessage(starter)}
              >
                <Text style={styles.starterText}>{starter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} isStreaming={streaming && i === messages.length - 1} />
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your AI coach..."
          placeholderTextColor={GolfColors.textSecondary}
          multiline
          maxLength={500}
          editable={!streaming}
          onSubmitEditing={() => sendMessage(input)}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || streaming) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || streaming}
        >
          {streaming
            ? <ActivityIndicator size="small" color="#fff" />
            : <Send size={18} color="#fff" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: CoachMessage;
  isStreaming: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAi]}>
      {!isUser && (
        <View style={styles.aiBubbleIcon}>
          <Bot size={14} color={GolfColors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        {message.content
          ? <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAi]}>
              {message.content}
              {isStreaming && <Text style={{ color: GolfColors.primary }}>▌</Text>}
            </Text>
          : <ActivityIndicator size="small" color={GolfColors.primary} />
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GolfColors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    backgroundColor: GolfColors.surface, borderBottomWidth: 1, borderBottomColor: GolfColors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GolfColors.scoreExcellent },
  headerTitle: { fontSize: 16, fontWeight: '700', color: GolfColors.text },

  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(74,124,89,0.08)', paddingHorizontal: 16, paddingVertical: 8,
  },
  contextText: { fontSize: 12, color: GolfColors.primary, fontWeight: '500', flex: 1 },

  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 12 },

  welcomeCard: {
    alignItems: 'center', padding: 24, gap: 10,
    backgroundColor: GolfColors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: GolfColors.border,
  },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: GolfColors.text },
  welcomeSubtitle: { fontSize: 14, color: GolfColors.textSecondary, textAlign: 'center', lineHeight: 20 },

  starters: { gap: 8 },
  starterBtn: {
    backgroundColor: GolfColors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: GolfColors.primaryLight,
  },
  starterText: { fontSize: 14, color: GolfColors.primary, fontWeight: '500' },

  bubbleRow: { flexDirection: 'row', gap: 8, maxWidth: '88%' },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubbleRowAi: { alignSelf: 'flex-start' },
  aiBubbleIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(74,124,89,0.1)', justifyContent: 'center', alignItems: 'center',
    marginTop: 4, flexShrink: 0,
  },
  bubble: { borderRadius: 16, padding: 12, maxWidth: '100%', minHeight: 36 },
  bubbleUser: { backgroundColor: GolfColors.primary },
  bubbleAi: {
    backgroundColor: GolfColors.surface,
    borderWidth: 1, borderColor: GolfColors.border,
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAi: { color: GolfColors.text },

  inputRow: {
    flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 28,
    backgroundColor: GolfColors.surface, borderTopWidth: 1, borderTopColor: GolfColors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1, backgroundColor: GolfColors.surfaceLight, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: GolfColors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: GolfColors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: GolfColors.primaryLight },
});
