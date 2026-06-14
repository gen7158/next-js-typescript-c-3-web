'use client';

import React from 'react';
import { Bookmark, Sparkles, ExternalLink } from 'lucide-react';
import styles from './NewsCard.module.css';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  summary: string;
  category: string;
}

interface NewsCardProps {
  item: NewsItem;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onAISummaryClick: () => void;
}

function formatRelativeTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export default function NewsCard({
  item,
  isBookmarked,
  onBookmarkToggle,
  onAISummaryClick,
}: NewsCardProps) {
  
  // カテゴリに応じたクラス割り当て
  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'EV・エコカー':
        return styles.catEv;
      case 'モータースポーツ':
        return styles.catSport;
      case 'テクノロジー':
        return styles.catTech;
      case '新型車':
        return styles.catNew;
      default:
        return styles.catGeneral;
    }
  };

  return (
    <article className={styles.card}>
      {/* Card Header (Badge & Bookmark) */}
      <div className={styles.cardHeader}>
        <span className={`${styles.categoryBadge} ${getCategoryClass(item.category)}`}>
          {item.category}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onBookmarkToggle();
          }}
          className={`${styles.bookmarkActionBtn} ${isBookmarked ? styles.bookmarkActionBtnActive : ''}`}
          aria-label={isBookmarked ? "お気に入りから削除" : "お気に入りに追加"}
        >
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Title */}
      <h3 className={styles.title} title={item.title}>
        {item.title}
      </h3>

      {/* Meta (Source & Time) */}
      <div className={styles.meta}>
        <span className={styles.source}>{item.source}</span>
        <span className={styles.divider}></span>
        <time dateTime={item.pubDate}>{formatRelativeTime(item.pubDate)}</time>
      </div>

      {/* Summary */}
      <p className={styles.summary}>
        {item.summary || '記事の概要はソース元でご確認ください。'}
      </p>

      {/* Card Footer (Actions) */}
      <div className={styles.cardFooter}>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.readBtn}
        >
          <span>ソースを読む</span>
          <ExternalLink size={12} />
        </a>
        <button
          onClick={onAISummaryClick}
          className={styles.aiBtn}
        >
          <Sparkles className={styles.aiIcon} size={13} />
          <span>AIで3行解説</span>
        </button>
      </div>
    </article>
  );
}
