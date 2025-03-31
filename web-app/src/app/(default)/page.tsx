import UserAuth from "@/components/example_get_user_auth";
import style from "@/styles/index.module.css";
import Link from "next/link";
import IdParcel from "@/components/layout/id_parcel";

export default function Home() {
  return (
    <div className={style.main}>
      <IdParcel />
    </div>
  );
}
