"use client";
import React, { useEffect, useState } from "react";
import { ISpotifyRecoData } from "../api/reco/route";
import Image from "next/image";
import styles from "./components/RecommendPage.module.css";

export default function RecommendPage() {
  const [recoData, setRecoData] = useState<ISpotifyRecoData[]>();

  const fetchRecoData = async () => {
    const response = await fetch("/api/reco");
    const data = await response.json();
    setRecoData(data);
  };

  useEffect(() => {
    fetchRecoData();
  }, []);

  console.log(recoData);
  return (
    <div className={styles.recoList}>
      {recoData?.map((el, i) => (
        <div key={i} className={styles.recoItem}>
          <div className={styles.recoItemLeft}>
            <Image
              src={el.albumImage ?? ""}
              alt={el.name ?? "image"}
              width={28}
              height={28}
            />
            <p className={styles.recoItemDesc}>
              <span>{el.name}</span>
              <span className={styles.recoItemDescArtist}>{el.artist}</span>
            </p>
          </div>
          <div className={styles.recoItemRight}>
            <span>{el.duration}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
