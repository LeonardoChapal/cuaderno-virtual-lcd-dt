import { redirect } from "next/navigation";

/** La raíz siempre entra por /home. */
export default function RootPage() {
  redirect("/home");
}
