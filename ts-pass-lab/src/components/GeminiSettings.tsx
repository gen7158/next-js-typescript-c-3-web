'use client';

import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, Loader2, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import {
  GEMINI_STORAGE,
  getGeminiApiKey,
  getGeminiModelCache,
  getSelectedGeminiModel,
  isRecommendedGeminiModel,
  selectRecommendedGeminiModel,
} from '@/lib/gemini-client';
import type { GeminiModel } from '@/types/gemini';
import styles from './GeminiSettings.module.css';

const fallbackModels: GeminiModel[] = [
  { name: 'gemini-3.5-flash', displayName: 'Gemini 3.5 Flash', description: '安定版の高性能Flashモデル', supportedMethods: ['generateContent'] },
  { name: 'gemini-3.1-pro-preview', displayName: 'Gemini 3.1 Pro Preview', description: '複雑な推論・コーディング向け', supportedMethods: ['generateContent'] },
  { name: 'gemini-3-flash-preview', displayName: 'Gemini 3 Flash Preview', description: '3世代の高速モデル', supportedMethods: ['generateContent'] },
  { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', description: '低遅延で安定した2.5モデル', supportedMethods: ['generateContent'] },
];

export default function GeminiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState<GeminiModel[]>(fallbackModels);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setApiKey(getGeminiApiKey());
      setSelectedModel(getSelectedGeminiModel() || 'gemini-3.5-flash');
      const cache = getGeminiModelCache();
      if (cache?.models.length) {
        setModels(cache.models);
        setUpdatedAt(cache.updatedAt);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const saveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem(GEMINI_STORAGE.apiKey, apiKey.trim());
    setMessage('APIキーを保存しました。続けて利用可能モデルを確認します。');
    setError('');
    void refreshModels();
  };

  const refreshModels = async () => {
    if (!apiKey.trim() || loading) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/gemini-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await response.json() as { success: boolean; models?: GeminiModel[]; error?: string };
      if (!response.ok || !data.success || !data.models?.length) throw new Error(data.error || 'generateContent対応モデルが見つかりませんでした。');
      const nextModel = data.models.some((model) => model.name === selectedModel)
        ? selectedModel
        : selectRecommendedGeminiModel(data.models);
      const now = new Date().toISOString();
      setModels(data.models);
      setSelectedModel(nextModel);
      setUpdatedAt(now);
      localStorage.setItem(GEMINI_STORAGE.apiKey, apiKey.trim());
      localStorage.setItem(GEMINI_STORAGE.selectedModel, nextModel);
      localStorage.setItem(GEMINI_STORAGE.modelCache, JSON.stringify({ models: data.models, updatedAt: now }));
      setMessage(`${data.models.length}件の利用可能モデルを取得し、${nextModel}を選択しました。`);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'モデル一覧を取得できませんでした。');
    } finally {
      setLoading(false);
    }
  };

  const selectModel = (modelName: string) => {
    setSelectedModel(modelName);
    localStorage.setItem(GEMINI_STORAGE.selectedModel, modelName);
    setMessage(`${modelName}を使用モデルに設定しました。`);
  };

  const deleteKey = () => {
    setApiKey('');
    localStorage.removeItem(GEMINI_STORAGE.apiKey);
    setMessage('保存したAPIキーを削除しました。');
  };

  return (
    <article className={styles.settings}>
      <div className={styles.title}><KeyRound size={23} /><div><small>GEMINI CONNECTION</small><h2>Gemini API・モデル設定</h2></div><span className={apiKey ? styles.connected : styles.disconnected}>{apiKey ? '設定済み' : '未設定'}</span></div>
      <p>APIキーに対して現在利用できるモデルをGoogleのModels APIから自動取得します。追加・廃止されたモデルも更新ボタンで反映できます。</p>

      <div className={styles.keyRow}>
        <div><input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="AIza..." /><button onClick={() => setShowKey((value) => !value)} aria-label="APIキーの表示切替">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
        <button onClick={saveKey} disabled={!apiKey.trim()}><Check size={15} />保存</button>
        <button onClick={deleteKey} disabled={!apiKey}><Trash2 size={15} />削除</button>
      </div>

      <div className={styles.modelHeader}>
        <div><h3>利用可能モデル</h3><span>{updatedAt ? `最終更新: ${new Date(updatedAt).toLocaleString('ja-JP')}` : 'まだAPIから取得していません'}</span></div>
        <button onClick={() => void refreshModels()} disabled={!apiKey.trim() || loading}>{loading ? <Loader2 className={styles.spin} size={15} /> : <RefreshCw size={15} />}モデルを自動取得</button>
      </div>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.models}>
        {models.map((model) => {
          const recommended = isRecommendedGeminiModel(model, models);
          const selected = model.name === selectedModel;
          return (
            <button key={model.name} className={selected ? styles.selected : ''} onClick={() => selectModel(model.name)}>
              <span className={styles.radio}>{selected && <Check size={12} />}</span>
              <div><strong>{model.displayName}</strong><code>{model.name}</code><small>{model.description || 'generateContent対応モデル'}</small></div>
              <aside>{recommended && <em><Sparkles size={11} />推奨</em>}{selected && <b>選択中</b>}<span>{model.supportedMethods.join(', ')}</span></aside>
            </button>
          );
        })}
      </div>

      <label className={styles.manual}>
        <span>一覧にないモデル名を手動入力</span>
        <div><input value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} placeholder="gemini-3.5-flash" /><button onClick={() => selectModel(selectedModel)} disabled={!selectedModel.trim()}>設定</button></div>
      </label>

      <p className={styles.warning}>APIキーをブラウザに保存する方式は、個人学習用・ローカル利用向けです。公開サイトとして運用する場合は、Next.js API Routeなどを使い、サーバー側でAPIキーを管理してください。</p>
    </article>
  );
}
