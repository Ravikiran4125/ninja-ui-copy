export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  reactions?: string[];
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  data?: string; // base64 for small files
}

export interface ChatbotTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}

export interface ChatbotSettings {
  theme: 'light' | 'dark' | 'auto';
  enableVoice: boolean;
  enableFileUpload: boolean;
  enableReactions: boolean;
  enableSearch: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  messageLimit: number;
}

export interface ChatbotContainerProps {
  messages: ChatMessageData[];
  onSendMessage: (message: string, attachments?: FileAttachment[]) => Promise<void>;
  onVoiceMessage?: (audioBlob: Blob) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  inputPlaceholder?: string;
  chatTitle?: string;
  chatSubtitle?: string;
  emptyStateComponent?: React.ReactNode;
  renderMessage?: (message: ChatMessageData, index: number) => React.ReactNode;
  renderInput?: (props: { 
    onSend: (message: string, attachments?: FileAttachment[]) => void; 
    disabled?: boolean; 
    placeholder?: string;
    onVoiceStart?: () => void;
    onVoiceEnd?: () => void;
  }) => React.ReactNode;
  settings?: Partial<ChatbotSettings>;
  customTheme?: Partial<ChatbotTheme>;
  onClearChat?: () => void;
  onExportChat?: () => void;
  onMessageReaction?: (messageId: string, reaction: string) => void;
  className?: string;
  floating?: boolean;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
}