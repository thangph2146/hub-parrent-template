import { Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import type { PublicEventSpeaker } from "@/lib/public-events";
import { getPosterUrl } from "@/lib/public-events";
import { cn } from "@ui/lib/utils";

type EventSpeakersSectionProps = {
  speakers: PublicEventSpeaker[];
  /** Bỏ card bọc ngoài khi nằm trong tab. */
  embedded?: boolean;
};

function speakerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function SpeakersList({ speakers }: { speakers: PublicEventSpeaker[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {speakers.map((speaker) => {
        const avatarUrl = getPosterUrl(speaker.avatar);
        return (
          <li
            key={speaker.id}
            className="flex gap-4 rounded-xl border border-border/70 bg-muted/15 p-4"
          >
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full",
                "bg-primary/10 text-sm font-bold text-primary ring-2 ring-primary/15",
              )}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                speakerInitials(speaker.name)
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-semibold leading-snug text-foreground">{speaker.name}</p>
              {(speaker.title || speaker.organization) && (
                <p className="text-sm text-muted-foreground">
                  {[speaker.title, speaker.organization].filter(Boolean).join(" · ")}
                </p>
              )}
              {speaker.role ? (
                <Badge variant="outline" className="mt-1 font-normal">
                  {speaker.role}
                </Badge>
              ) : null}
              {speaker.presentationTitle ? (
                <p className="pt-1 text-sm font-medium text-foreground/90">
                  {speaker.presentationTitle}
                </p>
              ) : null}
              {speaker.duration != null && speaker.duration > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Thời lượng: {speaker.duration} phút
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function SpeakersEmpty() {
  return (
    <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
      Chưa có diễn giả cho sự kiện này.
    </p>
  );
}

export function EventSpeakersSection({ speakers, embedded = false }: EventSpeakersSectionProps) {
  if (!embedded && speakers.length === 0) return null;

  const body =
    speakers.length > 0 ? <SpeakersList speakers={speakers} /> : <SpeakersEmpty />;

  if (embedded) return body;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mic className="size-5 text-primary" />
          Diễn giả
          <Badge variant="secondary" className="ml-1 font-normal">
            {speakers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
