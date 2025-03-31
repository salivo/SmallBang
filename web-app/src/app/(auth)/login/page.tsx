"use client";
import styles from "@/styles/auth.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth_actions";
import useMutation from "@/hooks/mutation";

export default function Login() {
  const router = useRouter();
  const { mutate, isLoading, isError } = useMutation(loginAction, () => {
    router.push("/");
  });
  return (
    <div className={styles.main}>
      {isLoading ? (
        <h2>Loading...</h2>
      ) : (
        <>
          <h1>Sign In</h1>
          <form className={styles.form} action={mutate}>
            <label>Username or email address</label>
            <input name="email" type="email" required />
            <label>Password</label>
            <input name="password" type="password" required />
            <button type="submit">Sign in</button>
            <label>
              Not a member? <Link href={"/signup"}>Sign up now</Link>
            </label>
          </form>
        </>
      )}
      {isError && (
        <div className={styles.error}>Invalid credentials. Retry login.</div>
      )}
    </div>
  );
}
