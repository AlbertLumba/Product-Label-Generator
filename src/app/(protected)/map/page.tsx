// src/app/(protected)/map/page.tsx

import AdminMap from "./AdminMap";

export const dynamic = "force-dynamic";

export default async function ProtectedMapPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      <AdminMap />
    </div>
  );
}