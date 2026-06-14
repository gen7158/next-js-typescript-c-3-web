'use client';

import React from 'react';
import { Search, Bookmark, Compass } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showBookmarks: boolean;
  setShowBookmarks: (show: boolean) => void;
  bookmarkCount: number;
  onLogoClick: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  showBookmarks,
  setShowBookmarks,
  bookmarkCount,
  onLogoClick,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo} onClick={onLogoClick}>
        <Compass className={styles.logoIcon} size={28} />
        <span className={`${styles.logoText} gradient-text-blue`}>AUTOSHIFT</span>
        <span className={styles.logoText} style={{ fontWeight: 400, fontSize: '1.2rem', marginLeft: '-0.3rem', opacity: 0.8 }}>NEWS</span>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="ニュースを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          id="search-input"
        />
        <Search className={styles.searchIcon} size={18} />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot}></span>
          <span>Live Feed</span>
        </div>

        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className={`${styles.bookmarkBtn} ${showBookmarks ? styles.bookmarkBtnActive : ''}`}
          id="bookmark-toggle-btn"
          aria-label="ブックマーク一覧を表示"
        >
          <Bookmark size={16} fill={showBookmarks ? 'currentColor' : 'none'} />
          <span>お気に入り</span>
          {bookmarkCount > 0 && (
            <span className={styles.badge}>{bookmarkCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
