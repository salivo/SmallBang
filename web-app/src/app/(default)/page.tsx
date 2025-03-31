import UserAuth from "@/components/example_get_user_auth";
import style from "@/styles/index.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={style.main}>
      <span>
        <h1>Hello this is Home Page</h1>
        <p>this page is static</p>
      </span>
      <UserAuth />
    </div>
  );
}
