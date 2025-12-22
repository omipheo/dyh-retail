import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { CombinedQuestionnaireWrapper } from "@/components/combined-questionnaire-wrapper"

export default async function CombinedQuestionnairePage() {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <CombinedQuestionnaireWrapper userId={data.user.id} />
    </div>
  )
}
