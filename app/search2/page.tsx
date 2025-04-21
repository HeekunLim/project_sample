'use client';

import { useState } from 'react';

export default function YouTubeSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ title: string; videoId: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/search2?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">YouTube 검색</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          className="border p-2 flex-1 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded">
          검색
        </button>
      </form>

      {loading && <p>검색 중...</p>}

      <ul className="space-y-2">
        {results.map((item) => (
          <li key={item.videoId} className="border p-3 rounded">
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-gray-500">videoId: {item.videoId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
