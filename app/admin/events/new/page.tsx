import { EventEditor } from "@/components/admin/EventEditor"
import { createEvent } from "@/app/actions/events"

export default function NewEventPage() {
    return (
        <div className="space-y-6">
            <EventEditor onSubmit={createEvent} />
        </div>
    )
}
