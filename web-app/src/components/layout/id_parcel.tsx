"use client";

import { useState } from "react";
import styles from "@/styles/auth.module.css";
import Link from "next/link";

export default function IdParcel() {
  const [ParcelId, setParcelId] = useState("");

  return (
    <>
      <h1>Found package</h1>

      <form className={styles.form}>
        <label>Package ID:</label>

        <input
          name="id_parcel"
          type="text"
          value={ParcelId}
          onChange={(e) => setParcelId(e.target.value)}
        />

        <Link href={`/orders/${ParcelId}`}>
          <button>Go</button>
        </Link>
      </form>
    </>
  );
}
