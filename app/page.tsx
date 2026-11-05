import { redirect } from "next/navigation";

// Standalone app: only /explore and /browse exist
export default function Home() {
  redirect("/explore");
}
