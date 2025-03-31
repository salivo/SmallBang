import { getUserAuthState } from "@/lib/auth_actions";
import { getUserName } from "@/lib/auth_actions";

export default async function UserAuth() {
  const isLoggedIn = await getUserAuthState();
  const name = await getUserName();
  return (
    <div>
      <h2>This is dynamic element</h2>
      <p>Status: {isLoggedIn ? "Logged in" : "Not logged in"}</p>
      <p>Name: {isLoggedIn ? name : ""}</p>
    </div>
  );
}
