import { DamageReportForm } from "@/components/DamageReportForm";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto">
        <DamageReportForm />
      </div>
    </div>
  );
}
