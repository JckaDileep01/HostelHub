import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // ── Authenticate: use the user's own JWT so RLS policies work ──────────
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: missing auth token' }, { status: 401 });
    }

    // Build an authenticated client scoped to the caller's session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    // Verify the token is valid and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { ownerId, hostel, rooms, totalFloors } = body;

    if (!ownerId || !hostel || !rooms || !totalFloors) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure the ownerId in the body matches the authenticated user
    if (ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: owner mismatch' }, { status: 403 });
    }

    // ── 1. Create Hostel ────────────────────────────────────────────────────
    // First insert without optional columns that may not exist in schema cache yet
    const { data: newHostel, error: hostelError } = await supabase
      .from('hostels')
      .insert({
        name: hostel.name,
        city: hostel.city,
        state: hostel.state,
        address: hostel.address,
        owner_id: ownerId,
        total_floors: totalFloors,
        total_rooms: rooms.length,
        billing_day: 5,
        currency: 'INR',
        voice_ai_provider: 'bland_ai',
      })
      .select()
      .single();

    if (hostelError) {
      console.error('Hostel insert error:', hostelError);
      throw new Error(`Hostel creation failed: ${hostelError.message}`);
    }

    // Attempt to patch amenities/food_details — these columns may not exist if migration hasn't run
    const { error: amenitiesError } = await supabase
      .from('hostels')
      .update({ amenities: hostel.amenities ?? {}, food_details: hostel.food_details ?? '' })
      .eq('id', newHostel.id);
    if (amenitiesError) {
      // Column may not exist in schema cache yet — non-fatal, hostel was still created
      console.warn('amenities/food_details patch skipped:', amenitiesError.message);
    }

    // ── 2. Update owner's profile with this hostel_id ───────────────────────
    await supabase
      .from('profiles')
      .update({ hostel_id: newHostel.id })
      .eq('id', ownerId);

    // ── 3. Create Floors ────────────────────────────────────────────────────
    const floorsToInsert = Array.from({ length: totalFloors }, (_, i) => ({
      hostel_id: newHostel.id,
      floor_number: i + 1,
      name: `Floor ${i + 1}`,
    }));

    const { data: insertedFloors, error: floorError } = await supabase
      .from('floors')
      .insert(floorsToInsert)
      .select();

    if (floorError) {
      console.error('Floor insert error:', floorError);
      throw new Error(`Floor creation failed: ${floorError.message}`);
    }

    // ── 4. Create Rooms ─────────────────────────────────────────────────────
    const roomsToInsert = [];
    for (const roomData of rooms) {
      const floor = insertedFloors.find((f: any) => f.floor_number === roomData.floorNumber);
      if (!floor) continue;

      let roomType = 'single';
      if (roomData.sharing === 2) roomType = 'double';
      if (roomData.sharing >= 3) roomType = 'triple';

      roomsToInsert.push({
        hostel_id: newHostel.id,
        floor_id: floor.id,
        room_number: roomData.roomNumber,
        room_type: roomType,
        capacity: roomData.sharing,
        monthly_rent: roomData.rent,
        status: 'vacant',
      });
    }

    const { data: insertedRooms, error: roomError } = await supabase
      .from('rooms')
      .insert(roomsToInsert)
      .select();

    if (roomError) {
      console.error('Room insert error:', roomError);
      throw new Error(`Room creation failed: ${roomError.message}`);
    }

    // ── 5. Create Beds ──────────────────────────────────────────────────────
    const bedsToInsert = [];
    for (const room of insertedRooms) {
      for (let b = 1; b <= room.capacity; b++) {
        bedsToInsert.push({
          room_id: room.id,
          bed_label: `${room.room_number}-${String.fromCharCode(64 + b)}`, // 101-A, 101-B …
          status: 'vacant',
        });
      }
    }

    if (bedsToInsert.length > 0) {
      const { error: bedError } = await supabase
        .from('beds')
        .insert(bedsToInsert);

      if (bedError) {
        console.error('Bed insert error:', bedError);
        throw new Error(`Bed creation failed: ${bedError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      hostelId: newHostel.id,
      message: 'Hostel and inventory generated successfully',
    });

  } catch (error: any) {
    console.error('Setup Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
