import dynamic from "next/dynamic"
import { createEvent } from "@/app/actions/events"
import { SectionSkeleton } from "@/components/loading/SectionSkeleton"

// Dynamic import for EventEditor (code-splitting for form components)
const EventEditor = dynamic(
    () => import("@/components/admin/EventEditor").then(m => ({ default: m.EventEditor })),
    {
        loading: () => <SectionSkeleton />,
        ssr: false
    }
)

export default function NewEventPage() {
    return (
        <div className="space-y-6">
            <EventEditor onSubmit={createEvent} />
        </div>
    )
}
