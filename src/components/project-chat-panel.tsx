import { useEffect, useState, type FormEvent } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { sendProjectMessage } from "@/lib/tandemy-db";
import {
  formatTimestamp,
  type ProjectMessage,
  type TandemyProject,
  type UserProfile,
} from "@/lib/tandemy-types";

export function ProjectChatPanel({
  project,
  currentProfile,
  recipientId,
  recipientLabel,
}: {
  project: TandemyProject;
  currentProfile: UserProfile;
  recipientId: string;
  recipientLabel: string;
}) {
  const [sentMessages, setSentMessages] = useState<ProjectMessage[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<ProjectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const uid = currentProfile.uid;
    const unsubSent = onSnapshot(
      query(collection(db, "messages"), where("senderId", "==", uid)),
      (snap) => {
        setSentMessages(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectMessage, "id">) }))
            .filter((m) => m.projectId === project.id),
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "messages");
      },
    );

    const unsubReceived = onSnapshot(
      query(collection(db, "messages"), where("recipientId", "==", uid)),
      (snap) => {
        setReceivedMessages(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectMessage, "id">) }))
            .filter((m) => m.projectId === project.id),
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "messages");
      },
    );

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [currentProfile.uid, project.id]);

  const messagesMap = new Map<string, ProjectMessage>();
  for (const m of [...sentMessages, ...receivedMessages]) {
    messagesMap.set(m.id, m);
  }
  const messages = Array.from(messagesMap.values()).sort((a, b) => {
    const aMs = a.createdAt?.toMillis?.() ?? 0;
    const bMs = b.createdAt?.toMillis?.() ?? 0;
    return aMs - bMs;
  });

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean || !recipientId) return;
    setSending(true);
    try {
      await sendProjectMessage({
        project,
        senderProfile: currentProfile,
        recipientId,
        body: clean,
      });
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mensajes con {recipientLabel}
        </p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {messages.length} mensaje(s)
        </span>
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Aún no hay mensajes en este proyecto. Envía el primero para coordinar entregas y
            avances.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentProfile.uid;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                    mine ? "bg-primary text-primary-foreground" : "border bg-card text-foreground"
                  }`}
                >
                  <p className="font-semibold opacity-85">{m.senderName}</p>
                  <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                </div>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatTimestamp(m.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Escribe un mensaje para ${recipientLabel}…`}
          className="h-9 flex-1 rounded-full border border-input bg-card px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending || !draft.trim()}
          className="h-9 rounded-full px-4"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
