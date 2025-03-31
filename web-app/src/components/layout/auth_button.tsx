import { getUserAuthState, logoutAction } from "@/lib/auth_actions";
import Link from "next/link";

export default async function AuthButton() {
  const isLoggedIn = await getUserAuthState();
  const logined = <button onClick={logoutAction}>Logout</button>;
  const unLogined = (
    <Link href={"/login"}>
      <button>Sign in</button>
    </Link>
  );
  if (isLoggedIn) {
    return logined;
  } else {
    return unLogined;
  }
}
