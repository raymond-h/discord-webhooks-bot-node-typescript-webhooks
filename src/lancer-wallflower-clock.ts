import canvas from 'canvas';
import type { NodeCanvasRenderingContext2D } from 'canvas';
import { WebhookRequest, WebhookResponse } from './interfaces';

const { createCanvas } = canvas;

interface Point {
  x: number;
  y: number;
}

const makePoint = (x: number, y: number) => ({ x, y });
const makePointFromPolar = (angle: number, magnitude: number) =>
  makePoint(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);

const addPoints = (a: Point, b: Point) => makePoint(a.x + b.x, a.y + b.y);

interface Line {
  a: Point;
  b: Point;
}

function lineAngle(line: Line): number {
  return Math.atan2(line.b.y - line.a.y, line.b.x - line.a.x);
}

function offsetLineByPoint(line: Line, point: Point): Line {
  return { a: addPoints(line.a, point), b: addPoints(line.b, point) };
}

function scoochLine(line: Line, amount: number): Line {
  const scoochDir = lineAngle(line) + Math.PI / 2;

  const scoochOffset = makePointFromPolar(scoochDir, amount);

  return offsetLineByPoint(line, scoochOffset);
}

function lineLineIntersection(lineA: Line, lineB: Line): Point | null {
  const A = lineA.a;
  const B = lineA.b;
  const C = lineB.a;
  const D = lineB.b;

  // Line AB represented as a1x + b1y = c1
  const a1 = B.y - A.y;
  const b1 = A.x - B.x;
  const c1 = a1 * A.x + b1 * A.y;

  // Line CD represented as a2x + b2y = c2
  const a2 = D.y - C.y;
  const b2 = C.x - D.x;
  const c2 = a2 * C.x + b2 * C.y;

  const determinant = a1 * b2 - a2 * b1;

  if (determinant == 0) {
    // The lines are parallel. This is simplified
    // by returning a pair of FLT_MAX
    return null;
  } else {
    const x = (b2 * c1 - b1 * c2) / determinant;
    const y = (a1 * c2 - a2 * c1) / determinant;
    return makePoint(x, y);
  }
}

function drawClock(
  ctx: NodeCanvasRenderingContext2D,
  radius: number,
  segmentCount: number,
  startAngle: number,
  lineScoochAmount: number,
  strokeOrFill: 'stroke' | 'fill' = 'stroke'
) {
  const segmentAngle = (1 / segmentCount) * Math.PI * 2;
  const segmentDistanceRadians = lineScoochAmount / radius;

  for (let i = 0; i < segmentCount; i++) {
    const line1Angle = startAngle + segmentAngle * i;
    const line2Angle = startAngle + segmentAngle * (i + 1);

    const center = makePoint(256, 256);
    const line1: Line = {
      a: center,
      b: addPoints(center, makePointFromPolar(line1Angle, 250)),
    };
    const line2: Line = {
      a: center,
      b: addPoints(center, makePointFromPolar(line2Angle, 250)),
    };

    const line1Scooched = scoochLine(line1, lineScoochAmount);
    const line2Scooched = scoochLine(line2, -lineScoochAmount);

    const intersection = lineLineIntersection(line1Scooched, line2Scooched);
    if (!intersection) throw new Error('Lines somehow not intersecting, oh no');

    ctx.beginPath();
    ctx.moveTo(intersection.x, intersection.y);
    ctx.arc(
      256,
      256,
      radius,
      line1Angle + segmentDistanceRadians,
      line2Angle - segmentDistanceRadians
    );
    ctx.lineTo(intersection.x, intersection.y);
    ctx[strokeOrFill]();
  }
}

function drawClockComplete(
  ctx: NodeCanvasRenderingContext2D,
  segmentCount: number
) {
  ctx.strokeStyle = 'lime';
  ctx.fillStyle = 'white';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const radius = 256 - 8;
  // const startAngle = -Math.PI / 2;
  const startAngle = 0;
  const lineScoochAmount = 6;
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.fill();
  drawClock(ctx, radius, segmentCount, startAngle, lineScoochAmount, 'fill');
  drawClock(ctx, radius, segmentCount, startAngle, lineScoochAmount);
}

export async function generateClockImage(
  body: WebhookRequest
): Promise<WebhookResponse> {
  const segmentCount = parseInt(body.arguments, 10);
  if (isNaN(segmentCount) || segmentCount < 3 || segmentCount > 20) {
    return {
      message: `Invalid segment count '${body.arguments}'. You must give an integer between 3 and 20 inclusive.`,
    };
  }

  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  drawClockComplete(ctx, segmentCount);

  // TODO canvas.createPNGStream()

  return {
    message: '{insert image here}',
  };
}

import fs from 'fs';

function generateClockImageImpl() {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  drawClockComplete(ctx, 6);

  canvas.createPNGStream().pipe(fs.createWriteStream('face.png'));
}

// generateClockImageImpl();
