import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert"

type EventDetailNoticeProps = {
  description: string
}

export function EventDetailNotice({ description }: EventDetailNoticeProps) {
  return (
    <Alert className="border-primary/25 bg-primary/[0.04]">
      <Info className="size-4 text-primary" aria-hidden />
      <AlertTitle className="text-primary">Lưu ý trước khi đăng ký</AlertTitle>
      <AlertDescription className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {description}
      </AlertDescription>
    </Alert>
  )
}
