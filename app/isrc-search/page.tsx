"use client";

import IsrcSearch from "@/app/components/IsrcSearch";

export default function IsrcSearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">YouTube 영상 ISRC 검색</h1>
      <IsrcSearch />
    </div>
  );
}
