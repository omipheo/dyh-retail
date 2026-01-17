import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function IPWarningBanner() {
  return (
    <Alert className="mb-6 border-red-600 bg-red-50 dark:bg-red-950/20">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <AlertDescription className="ml-2 text-sm text-red-900 dark:text-red-200">
        <div className="space-y-4">
          <p className="font-bold text-base">INTELLECTUAL PROPERTY NOTICE</p>
          <p className="leading-relaxed">
            Significant elements of the ensuing questionnaire have been tested via the Australian Taxation Office's
            private ruling system and or its Aggressive Tax Planning unit and or in the Administrative Appeals Tribunal
            (now the Administrative Review Tribunal), where pursuant to requests to these entities to protect the
            intellectual property disclosed to them (IP), the published outcomes have successfully excluded much of what
            We have successfully established to be our IP. It's also noteworthy that in the years since, our claims to
            the IP remain unchallenged. Our IP does not rest in the public domain in any holistic format or other
            worthwhile sense (commercially or otherwise).
          </p>
          <p className="leading-relaxed">
            Your use of our questionnaires is therefore subject to critical obligations of confidence on your part that
            is; you may not copy in part or in full, nor publish any parts whatsoever, nor make any of it available for
            perusal to third parties on any basis (unless required to do so by law or otherwise only with our express
            written consent).
          </p>
          <p className="leading-relaxed">
            We declare this questionnaire to be highly valuable and tradable (excluding of course your personal and
            business information).
          </p>
          <p className="leading-relaxed">
            Should we believe you have breached your obligation of confidence, we may exercise our legal rights in full
            and without further notice.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
