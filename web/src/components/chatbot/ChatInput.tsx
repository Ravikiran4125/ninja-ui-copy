'use client';

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Send, 
  Loader2, 
  Paperclip, 
  Mic, 
  Square,
  Smile,
  X
} from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { FileUploader } from './FileUploader';
import { EmojiPicker } from './EmojiPicker';
import type { FileAttachment, VoiceRecorderState } from './types';

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  onVoiceMessage?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  voiceRecorder?: VoiceRecorderState & {
    startRecording: () => void;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
  };
}

export function ChatInput({ 
  onSend, 
  onVoiceMessage,
  disabled = false, 
  placeholder = "Type your message...",
  enableVoice = true,
  enableFileUpload = true,
  voiceRecorder
}: ChatInputProps) {
  console.log(onVoiceMessage)
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !disabled) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
      setInput('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    if (voiceRecorder) {
      if (voiceRecorder.isRecording) {
        voiceRecorder.stopRecording();
        setIsRecording(false);
      } else {
        voiceRecorder.startRecording();
        setIsRecording(true);
      }
    }
  };

  const handleFileSelect = (files: FileAttachment[]) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const canSend = (input.trim() || attachments.length > 0) && !disabled;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
              >
                <Paperclip size={14} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{attachment.name}</span>
                <span className="text-xs text-gray-500">
                  {(attachment.size / 1024).toFixed(1)}KB
                </span>
                <button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording Indicator */}
      {isRecording && voiceRecorder && (
        <VoiceRecorder
          state={voiceRecorder}
          onStop={voiceRecorder.stopRecording}
          onPause={voiceRecorder.pauseRecording}
          onResume={voiceRecorder.resumeRecording}
        />
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        {/* Left Actions */}
        <div className="flex items-end gap-1">
          {enableFileUpload && (
            <FileUploader
              onFilesSelect={handleFileSelect}
              disabled={disabled}
              ref={fileInputRef}
            />
          )}
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            disabled={disabled}
          >
            <Smile size={20} />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={clsx(
              'w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600',
              'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'px-4 py-3 pr-12 text-sm leading-5',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-end gap-1">
          {enableVoice && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={clsx(
                'p-2 rounded-lg transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
              )}
              disabled={disabled}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? <Square size={20} /> : <Mic size={20} />}
            </button>
          )}

          <button
            type="submit"
            disabled={!canSend}
            className={clsx(
              'p-2 rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              canSend
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            {disabled ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}