import { redirect } from "next/navigation";

export default async function ClinicIndex({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params;

  // Instantly redirects the user to the new dashboard folder
  redirect(`/clinics/${clinicId}/dashboard`);
}
