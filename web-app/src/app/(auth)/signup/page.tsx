"use client";
import styles from "@/styles/auth.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";
import useMutation from "@/hooks/mutation";
import { registerAction } from "@/lib/auth_actions";

const pb = new PocketBase("http://127.0.0.1:8090");

function test(formData: FormData) {
  console.log(formData);
}

export default function Signup() {
  const router = useRouter();
  const { mutate, isLoading, isError, error } = useMutation(
    registerAction,
    () => {
      router.push("/");
    },
  );
  return (
    <div className={styles.main}>
      {isLoading ? (
        <h2>Loading...</h2>
      ) : (
        <>
          <h1>Sign up </h1>
          <form className={styles.form} action={mutate}>
            <label>Email address</label>
            <input name="email" type="email" required />
            <label>Password</label>
            <input name="password" type="password" required />
            <label>Username</label>
            <input name="name" type="text" required />
            <button type="submit">Sign up</button>
            <label>
              Do you have an account? <Link href={"/login"}>Sign in</Link>
            </label>
          </form>
        </>
      )}
      {isError && <div className={styles.error}>{error}</div>}
    </div>
  );
}
