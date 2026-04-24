import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { publishEvent } from '@packages/events';
import { prisma } from '@packages/db';
import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { mountServiceDocs } from '@packages/swagger';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });
app.use(express.json());
mountServiceDocs(app, {
  specPath: new URL('../openapi.json', import.meta.url),
  title: 'Map Service API',
  port: Number(process.env.PORT ?? 4008)
});

app.get('/health', (_req, res) => {
  res.json({ service: process.env.SERVICE_NAME ?? 'map-service', status: 'ok' });
});

app.get('/map/layers', async (req, res) => {
  const role = String(req.query.role ?? 'civilian');
  const hotspots = await prisma.hotspot.findMany({ where: { isActive: true } });
  const alerts = await prisma.alertZone.findMany({ where: { isActive: true } });

  res.json({
    type: 'FeatureCollection',
    features: hotspots
      .map((hotspot) => ({
        type: 'Feature',
        properties: {
          id: hotspot.id,
          name: hotspot.name,
          severity: hotspot.severity,
          radiusMeters: hotspot.radiusMeters,
          category: hotspot.category,
          visibleTo: role === 'officer' || role === 'admin' ? 'all' : 'public'
        },
        geometry: {
          type: 'Point',
          coordinates: [hotspot.locationLng, hotspot.locationLat]
        }
      }))
      .concat(
        alerts.map((alert) => ({
          type: 'Feature',
          properties: {
            id: alert.id,
            name: alert.title,
            severity: alert.severity,
            radiusMeters: alert.radiusMeters,
            category: 'alert',
            visibleTo: role === 'officer' || role === 'admin' ? 'all' : 'public'
          },
          geometry: {
            type: 'Point',
            coordinates: [alert.locationLng, alert.locationLat]
          }
        }))
      )
  });
});

app.post('/map/hotspots', async (req, res) => {
  const hotspot = await prisma.hotspot.create({
    data: {
      id: uuidv4(),
      name: String(req.body.name ?? 'Unnamed hotspot'),
      category: String(req.body.category ?? 'crime_hotspot'),
      severity: String(req.body.severity ?? 'medium'),
      locationLat: Number(req.body.lat),
      locationLng: Number(req.body.lng),
      radiusMeters: Number(req.body.radiusMeters ?? 250),
      createdBy: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : null,
      isActive: true,
      expiresAt: req.body.expiresAt ? new Date(String(req.body.expiresAt)) : null
    }
  });
  await publishEvent('map.hotspot.created', hotspot);
  io.emit('map.hotspot.created', hotspot);
  res.status(201).json(hotspot);
});

app.post('/hotspots', async (req, res) => {
  const hotspot = await prisma.hotspot.create({
    data: {
      id: uuidv4(),
      name: String(req.body.name ?? 'Unnamed hotspot'),
      category: String(req.body.category ?? 'crime_hotspot'),
      severity: String(req.body.severity ?? 'medium'),
      locationLat: Number(req.body.lat),
      locationLng: Number(req.body.lng),
      radiusMeters: Number(req.body.radiusMeters ?? 250),
      createdBy: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : null,
      isActive: true,
      expiresAt: req.body.expiresAt ? new Date(String(req.body.expiresAt)) : null
    }
  });
  await publishEvent('map.hotspot.created', hotspot);
  io.emit('map.hotspot.created', hotspot);
  res.status(201).json(hotspot);
});

app.post('/alerts', async (req, res) => {
  const alert = await prisma.alertZone.create({
    data: {
      id: uuidv4(),
      title: String(req.body.title ?? 'Public safety alert'),
      severity: String(req.body.severity ?? 'warning'),
      locationLat: Number(req.body.lat),
      locationLng: Number(req.body.lng),
      radiusMeters: Number(req.body.radiusMeters ?? 500),
      createdBy: req.headers['x-user-id'] ? String(req.headers['x-user-id']) : null
    }
  });
  await publishEvent('map.alert.created', alert);
  io.emit('map.alert.created', alert);
  res.status(201).json(alert);
});

app.patch('/map/hotspots/:id/expire', async (req, res) => {
  const existing = await prisma.hotspot.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ message: 'Hotspot not found' });
    return;
  }
  const hotspot = await prisma.hotspot.update({
    where: { id: existing.id },
    data: { isActive: false }
  });
  await publishEvent('map.hotspot.expired', hotspot);
  io.emit('map.hotspot.expired', hotspot);
  res.json(hotspot);
});

app.post('/map/hotspots/aggregate-nightly', async (_req, res) => {
  const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const incidents = await prisma.incident.findMany({
    where: { createdAt: { gte: threshold } }
  });
  if (incidents.length === 0) {
    res.status(202).json({ generated: 0 });
    return;
  }

  const generated = await prisma.hotspot.create({
    data: {
      id: uuidv4(),
      name: 'Nightly aggregated hotspot',
      category: 'crime_hotspot',
      severity: incidents.length > 10 ? 'critical' : incidents.length > 5 ? 'high' : 'medium',
      locationLat: incidents[0]?.locationLat ?? -33.9249,
      locationLng: incidents[0]?.locationLng ?? 18.4241,
      radiusMeters: 800,
      isActive: true
    }
  });
  await publishEvent('map.hotspot.created', generated);
  io.emit('map.hotspot.created', generated);
  res.status(202).json({ generated: 1, sample: generated });
});

server.listen(Number(process.env.PORT ?? 4008), () => {
  console.log(`${process.env.SERVICE_NAME ?? 'map-service'} listening on ${process.env.PORT ?? 4008}`);
});
