'use client';

import { useEffect, useState } from 'react';
import { Bot, Bug, Code2, Copy, GraduationCap, Layers3, Lightbulb, Loader2, Send, Sparkles, Trash2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getGeminiApiKey, getSelectedGeminiModel } from '@/lib/gemini-client';
import styles from './AITutorDrawer.module.css';

type Mode = 'beginner' | 'step' | 'debug' | 'review' | 'design';
type Message = { id: string; role: 'user' | 'assistant'; text: string };
const HISTORY_KEY = 'ts-pass-lab-ai-history';

const modes = [
  { id: 'beginner', label: '超やさしく', icon: Lightbulb },
  { id: 'step', label: '一歩ずつ', icon: GraduationCap },
  { id: 'debug', label: 'エラー診断', icon: Bug },
  { id: 'review', label: 'レビュー', icon: Code2 },
  { id: 'design', label: '設計相談', icon: Layers3 },
] as const;

export default function AITutorDrawer({
  open,
  onClose,
  context,
  suggestedPrompt,
}: {
  open: boolean;
  onClose: () => void;
  context: string;
  suggestedPrompt?: string;
}) {
  const [mode, setMode] = useState<Mode>('beginner');
  const [prompt, setPrompt] = useState(suggestedPrompt || '');
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as Message[];
      return Array.isArray(parsed) ? parsed.slice(-20) : [];
    } catch {
      localStorage.removeItem(HISTORY_KEY);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-20)));
  }, [messages]);

  const submit = async () => {
    if (!prompt.trim() || loading) return;
    const question = prompt.trim();
    setPrompt('');
    setError('');
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: question }]);
    setLoading(true);
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: question,
          mode,
          context,
          history: messages.slice(-8).map(({ role, text }) => ({ role, text })),
          apiKey: getGeminiApiKey(),
          model: getSelectedGeminiModel(),
        }),
      });
      const data = await response.json() as { success: boolean; text?: string; error?: string };
      if (!response.ok || !data.success || !data.text) throw new Error(data.error || 'AI解説を取得できませんでした。');
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: data.text! }]);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'AIへ接続できませんでした。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && <button className={styles.backdrop} onClick={onClose} aria-label="AIパネルを閉じる" />}
      <aside className={`${styles.drawer} ${open ? styles.open : ''}`} aria-hidden={!open}>
        <header className={styles.header}>
          <span className={styles.botIcon}><Bot size={20} /></span>
          <div>
            <strong>Gemini AIチューター</strong>
            <small>現在のレッスンとコードを共有中</small>
          </div>
          {messages.length > 0 && <button className={styles.iconButton} onClick={() => { setMessages([]); localStorage.removeItem(HISTORY_KEY); }} aria-label="履歴を削除"><Trash2 size={17} /></button>}
          <button className={styles.iconButton} onClick={onClose} aria-label="閉じる"><X size={19} /></button>
        </header>

        <div className={styles.modes}>
          {modes.map((item) => <button key={item.id} title={item.label} onClick={() => setMode(item.id)} className={mode === item.id ? styles.activeMode : ''}><item.icon size={14} />{item.label}</button>)}
        </div>

        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              <Sparkles size={32} />
              <h3>TypeScript・Web開発の疑問を解決</h3>
              <p>現在のレッスン、問題、コードを文脈に含め、設計やセキュリティも質問できます。</p>
              {['小学生にも伝わる言葉で説明して', '答えを言わず最初の一歩だけ教えて', 'このエラーの原因を切り分けて', 'この設計の危険な点をレビューして'].map((text) => <button key={text} onClick={() => setPrompt(text)}>{text}</button>)}
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`${styles.message} ${message.role === 'user' ? styles.user : styles.assistant}`}>
              <span>{message.role === 'user' ? 'あなた' : 'Gemini'}</span>
              {message.role === 'assistant'
                ? <div className={styles.markdown}><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown></div>
                : <p>{message.text}</p>}
              {message.role === 'assistant' && <div className={styles.messageActions}><button onClick={() => navigator.clipboard.writeText(message.text)}><Copy size={13} />コピー</button><button onClick={() => setPrompt('今の説明を、もっと短く、身近なたとえを使って説明し直してください。')}><Lightbulb size={13} />もっと簡単に</button><button onClick={() => setPrompt('理解できたか確認するため、答えをすぐ表示しないミニ問題を1問出してください。')}><GraduationCap size={13} />確認問題</button></div>}
            </div>
          ))}
          {loading && <div className={styles.loading}><Loader2 size={18} className={styles.spin} />解説を作成しています...</div>}
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.composer}>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="TypeScriptやWeb開発について質問..."
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void submit();
              }
            }}
          />
          <button onClick={() => void submit()} disabled={!prompt.trim() || loading} aria-label="送信"><Send size={17} /></button>
          <small className={styles.shortcut}>Enterで改行 · ⌘ / Ctrl + Enterで送信</small>
        </div>
      </aside>
    </>
  );
}
