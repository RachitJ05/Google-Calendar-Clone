import prisma from "../prismaClient.js";

// Helper to parse ISO/time inputs
function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// GET /api/events?start=ISO&end=ISO
// returns events overlapping the requested range, or all events if no range
export const listEvents = async (req, res) => {
  try {
    const { start: s, end: e } = req.query;
    const start = parseDate(s);
    const end = parseDate(e);

    if (start && end) {
      const events = await prisma.event.findMany({
        where: {
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
        orderBy: { startTime: "asc" },
      });
      return res.json(events);
    }

    // no range -> return all
    const all = await prisma.event.findMany({
      where:{
          userId:req.user.id
      },
      orderBy:{
          startTime:"asc"
      }
  });
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list events" });
  }
};

// GET /api/events/:id
export const getEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, allDay } = req.body;
    if (!title || !startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "title, startTime and endTime are required" });
    }

    const startD = parseDate(startTime);
    const endD = parseDate(endTime);
    if (!startD || !endD || startD >= endD) {
      return res.status(400).json({ error: "Invalid start/end times" });
    }

    // Check overlap (warn only)
    const overlapping = await prisma.event.findFirst({
      where: {
        userId: req.user.id,
        AND: [
          { startTime: { lt: endD } },
          { endTime: { gt: startD } },
        ],
      },
    });

    const created = await prisma.event.create({
      data:{
        title,
        description,
        startTime:startD,
        endTime:endD,
        allDay,

        userId:req.user.id,
      },
    });

    return res.status(201).json({
      event: created,
      warning: overlapping
        ? "This Event overlaps an existing event."
        : null,
      overlappingId: overlapping?.id ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// PUT /api/events/:id - update an event
export const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, startTime, endTime, allDay } = req.body;

    const existing = await prisma.event.findFirst({
      where:{
        id,
        userId:req.user.id,
      }
    });
    if (!existing) return res.status(404).json({ error: "Event not found" });

    const startD = startTime ? parseDate(startTime) : existing.startTime;
    const endD = endTime ? parseDate(endTime) : existing.endTime;
    if (!startD || !endD || startD >= endD) {
      return res.status(400).json({ error: "Invalid start/end times" });
    }

    // overlap check excluding self
    const overlapping = await prisma.event.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { startTime: { lt: endD } },
          { endTime: { gt: startD } },
        ],
      },
    });

    const updated = await prisma.event.update({
      where: { id },
    });

    return res.json({
      event: updated,
      warning: overlapping
        ? "This Event overlaps an existing event."
        : null,
      overlappingId: overlapping?.id ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

// DELETE /api/events/:id




export const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findFirst({
      where:{
        id,
        userId:req.user.id,
      }
    });
    if(!event){
      res.status(404).json({
        error:"Event not found"
    });
  }
    await prisma.event.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025")
      return res.status(404).json({ error: "Event not found" });
    res.status(500).json({ error: "Failed to delete event" });
  }
};
