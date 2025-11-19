import { EventEditor } from "@/components/admin/EventEditor"
import { getEventById, updateEvent } from "@/app/actions/events"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditEventPage({ params }: PageProps) {
    const { id } = await params
    const result = await getEventById(id)

    if (!result.success || !result.event) {
        notFound()
    }

    const updateAction = updateEvent.bind(null, id)

    return (
        <div className="space-y-6">
            <EventEditor
                initialData={result.event}
                onSubmit={updateAction}
                isEditing
            />
        </div>
    )
}
