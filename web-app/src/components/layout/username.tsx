import { getUserName } from "@/lib/auth_actions";

export default function UserName() {
  const name = getUserName();
  return (
    <>
      <p>{name}</p>
    </>
  );
}
