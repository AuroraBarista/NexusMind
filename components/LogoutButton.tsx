"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            title="Sign Out"
        >
            <LogOut size={16} />
        </button>
    );
}
