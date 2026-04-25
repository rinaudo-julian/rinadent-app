import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  odontogramSnapshotSchema,
  saveOdontogramPayloadSchema,
  type EventAction,
  type SurfaceKey
} from "@/lib/schemas/odontogram-schema";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OdontogramEventRow {
  id: string;
  occurred_at: string;
  tooth: number;
  surface: SurfaceKey | null;
  action: EventAction;
}

async function validatePatientExists(patientId: string) {
  const supabase = await createClient();
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .maybeSingle();

  return {
    supabase,
    patient,
    patientError
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  if (!uuidRegex.test(patientId)) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("patient_odontograms")
    .select("id, snapshot")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch odontogram", details: error.message },
      { status: 500 }
    );
  }

  if (!record) {
    return NextResponse.json({ snapshot: null, events: [] });
  }

  let snapshot = null;
  if (record.snapshot !== null) {
    const snapshotResult = odontogramSnapshotSchema.safeParse(record.snapshot);
    if (!snapshotResult.success) {
      return NextResponse.json(
        {
          error: "Stored odontogram snapshot is invalid",
          details: snapshotResult.error.issues.map((issue) => issue.message)
        },
        { status: 500 }
      );
    }
    snapshot = snapshotResult.data;
  }

  const { data: events, error: eventsError } = await supabase
    .from("patient_odontogram_events")
    .select("id, occurred_at, tooth, surface, action")
    .eq("odontogram_id", record.id)
    .order("occurred_at", { ascending: false });

  if (eventsError) {
    return NextResponse.json(
      { error: "Failed to fetch odontogram events", details: eventsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ snapshot, events: (events ?? []) as OdontogramEventRow[] });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  if (!uuidRegex.test(patientId)) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = saveOdontogramPayloadSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: payload.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const { supabase, patient, patientError } = await validatePatientExists(patientId);

  if (patientError) {
    return NextResponse.json(
      { error: "Failed to validate patient", details: patientError.message },
      { status: 500 }
    );
  }

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const { data: odontogram, error: upsertError } = await supabase
    .from("patient_odontograms")
    .upsert(
      {
        patient_id: patientId,
        snapshot: payload.data.snapshot,
        updated_at: new Date().toISOString(),
        updated_by: userId
      },
      { onConflict: "patient_id" }
    )
    .select("id")
    .single();

  if (upsertError || !odontogram) {
    return NextResponse.json(
      { error: "Failed to persist odontogram", details: upsertError?.message },
      { status: 500 }
    );
  }

  if (payload.data.events.length > 0) {
    const eventRows = payload.data.events.map((event) => ({
      odontogram_id: odontogram.id,
      occurred_at: new Date(event.timestamp ?? Date.now()).toISOString(),
      tooth: event.tooth,
      surface: event.surface ?? null,
      action: event.action,
      created_by: userId
    }));

    const { error: insertEventsError } = await supabase
      .from("patient_odontogram_events")
      .insert(eventRows);

    if (insertEventsError) {
      return NextResponse.json(
        { error: "Failed to persist odontogram events", details: insertEventsError.message },
        { status: 500 }
      );
    }
  }

  const { data: events, error: eventsError } = await supabase
    .from("patient_odontogram_events")
    .select("id, occurred_at, tooth, surface, action")
    .eq("odontogram_id", odontogram.id)
    .order("occurred_at", { ascending: false });

  if (eventsError) {
    return NextResponse.json(
      { error: "Failed to fetch updated events", details: eventsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    snapshot: payload.data.snapshot,
    events: (events ?? []) as OdontogramEventRow[]
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  if (!uuidRegex.test(patientId)) {
    return NextResponse.json({ error: "Invalid patient id" }, { status: 400 });
  }

  const { supabase, patient, patientError } = await validatePatientExists(patientId);

  if (patientError) {
    return NextResponse.json(
      { error: "Failed to validate patient", details: patientError.message },
      { status: 500 }
    );
  }

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const { data: odontogram, error: upsertError } = await supabase
    .from("patient_odontograms")
    .upsert(
      {
        patient_id: patientId,
        snapshot: null,
        updated_at: new Date().toISOString(),
        updated_by: userId
      },
      { onConflict: "patient_id" }
    )
    .select("id")
    .single();

  if (upsertError || !odontogram) {
    return NextResponse.json(
      { error: "Failed to clear odontogram", details: upsertError?.message },
      { status: 500 }
    );
  }

  const { error: insertClearAllEventError } = await supabase
    .from("patient_odontogram_events")
    .insert({
      odontogram_id: odontogram.id,
      occurred_at: new Date().toISOString(),
      tooth: 0,
      surface: null,
      action: "clear-all",
      created_by: userId
    });

  if (insertClearAllEventError) {
    return NextResponse.json(
      {
        error: "Failed to register odontogram clear event",
        details: insertClearAllEventError.message
      },
      { status: 500 }
    );
  }

  const { data: events, error: eventsError } = await supabase
    .from("patient_odontogram_events")
    .select("id, occurred_at, tooth, surface, action")
    .eq("odontogram_id", odontogram.id)
    .order("occurred_at", { ascending: false });

  if (eventsError) {
    return NextResponse.json(
      { error: "Failed to fetch updated events", details: eventsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ snapshot: null, events: (events ?? []) as OdontogramEventRow[] });
}
