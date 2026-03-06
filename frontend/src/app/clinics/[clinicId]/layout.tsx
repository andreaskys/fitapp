import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function ClinicLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ clinicId: string }>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        redirect("/login");
    }

    const { clinicId } = await params;

    return (
        <div className="flex bg-[#fbfbfd] min-h-screen">
            <Sidebar clinicId={clinicId} />
            <div className="flex-1 md:ml-72">
                {children}
            </div>
        </div>
    );
}