import { AppLayout } from "@/components/layout/app-layout";

export default function Assessments() {
  return (
    <AppLayout>
      <div className="flex flex-col space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold">Maturity Assessments</h1>
          <p className="text-muted-foreground mt-1">Evaluate your testing practices using the Adaptive Testing Maturity Framework</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assessment content will go here */}
          <div className="p-8 flex items-center justify-center border rounded-lg border-dashed h-64">
            <p className="text-muted-foreground">Assessment functionality coming soon</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}