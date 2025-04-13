// app/subastas/page.jsx
import { Suspense } from "react";
import SubastasClient from "./SubastasClient";

export default function SubastasPage() {
  return (
    <Suspense fallback={<p>Cargando subastas...</p>}>
      <SubastasClient />
    </Suspense>
  );
}
