import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import QuestionnaireForm from "@/components/questionnaire-form";

export default async function NewQuestionnairePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">New Home Office Assessment</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <QuestionnaireForm userId={data.user.id} />
      </div>
    </div>
  );
}
