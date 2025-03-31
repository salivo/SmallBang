import { getUserAuthState } from "@/lib/auth_actions";
import { getUserName } from "@/lib/auth_actions";
import Link from "next/link";

export default async function UserAuth() {
  const isLoggedIn = await getUserAuthState();
  const name = await getUserName();
  return (
    <div>
      <h2>Find your parcel by ID</h2>
      <p>
        <input></input>
      </p>
      <p>
        {/* Status:{" "}

        {isLoggedIn ? (
          <Link href={"/login"}>
            <button>Can go to account page</button>
          </Link>
        ) : (
          "Not logged in"
        )} */}
      </p>
      <p>Name: {isLoggedIn ? name : ""}</p>
    </div>
  );
}
