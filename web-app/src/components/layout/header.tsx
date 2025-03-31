import AuthButton from "./auth_button";
import style from "@/styles/header.module.css";
import UserName from "./username";
export default function Header() {
  return (
    <div className={style.main}>
      <h1>Header</h1>
      <div className={style.authspace}>
        <UserName />
        <AuthButton />
      </div>
    </div>
  );
}
