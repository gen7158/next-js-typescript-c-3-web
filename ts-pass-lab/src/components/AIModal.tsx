'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, TrendingUp, Info, Cpu, ChevronRight } from 'lucide-react';
import styles from './AIModal.module.css';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  summary: string;
  category: string;
}

interface AISummaryResult {
  summary: string[];
  impact: string;
  background: string;
  isMock?: boolean;
}

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsItem | null;
  summaryData: AISummaryResult | null;
  isLoading: boolean;
}

export default function AIModal({
  isOpen,
  onClose,
  article,
  summaryData,
  isLoading,
}: AIModalProps) {
  
  // モーダル表示時に背面のスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Escキーで閉じる
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  return (
    <div className={styles.overlay} onClick={onClose} id="ai-modal-overlay">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="閉じる">
          <X size={18} />
        </button>

        {/* AI Agent Header */}
        <div className={styles.aiHeader}>
          <div className={styles.aiBadge}>
            <Sparkles size={11} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
            <span>AI JOURNALIST</span>
          </div>
          <span className={styles.aiModelStatus}>
            {summaryData?.isMock ? 'Demo Analyzer' : 'Gemini 1.5 Flash'}
          </span>
        </div>

        {/* Title */}
        <h2 className={styles.articleTitle}>
          {article.title}
        </h2>

        {/* Content Area */}
        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loaderSpinner}></div>
            <p className={`${styles.loaderText} pulse-glow`}>
              AIジャーナリストが記事の論点を抽出中...<br />
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>最新の業界データを参照しています</span>
            </p>
          </div>
        ) : summaryData ? (
          <div className={styles.modalContent}>
            {/* 3-line Summary */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Cpu size={15} />
                <span>3行でわかる要約</span>
              </h3>
              <ul className={styles.summaryList}>
                {summaryData.summary.map((text, idx) => (
                  <li key={idx} className={styles.summaryItem}>
                    <ChevronRight size={14} className={styles.summaryBullet} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Impact Analysis */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TrendingUp size={15} />
                <span>業界・市場へのインパクト</span>
              </h3>
              <p className={styles.text}>
                {summaryData.impact}
              </p>
            </div>

            {/* Background Analysis */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Info size={15} />
                <span>技術的・歴史的背景</span>
              </h3>
              <p className={`${styles.text} styles.textOrange`}>
                {summaryData.background}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            データの読み込みに失敗しました。
          </div>
        )}
      </div>
    </div>
  );
}
