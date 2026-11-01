import { CONFIG } from './config';

export function drawCourt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  shakeX: number = 0,
  shakeY: number = 0
) {
  ctx.save();
  ctx.translate(shakeX, shakeY);

  // 1. Court floor gradient (modern pastel aesthetic)
  const floorGrad = ctx.createLinearGradient(0, 0, 0, height);
  floorGrad.addColorStop(0, '#F1F5F9'); // Slate 100
  floorGrad.addColorStop(0.5, '#F8FAFC'); // Slate 50
  floorGrad.addColorStop(1, '#EDF2F7');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Table-tennis court perimeter line
  const margin = 16;
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#CBD5E1'; // Slate 300
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // 3. Center line (table tennis split line)
  ctx.save();
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.beginPath();
  ctx.moveTo(width / 2, margin);
  ctx.lineTo(width / 2, height - margin);
  ctx.stroke();
  ctx.restore();

  // 4. Subtle center table decal (compass motif / "YOU MAKE STRAY KIDS STAY")
  ctx.save();
  ctx.translate(width / 2, height * 0.42);
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
  ctx.lineWidth = 1.5;

  // Outer subtle circle
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Inner dashed circle
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();

  // Compass needles (subtle)
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 38);
  ctx.moveTo(-38, 0);
  ctx.lineTo(38, 0);
  ctx.stroke();

  // Micro slogan
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('QUORKA SMASH COURT', 0, 96);
  ctx.restore();

  // 5. Paddle baseline warning line (soft dotted)
  const paddleBaselineY = height - CONFIG.PADDLE_Y_OFFSET;
  ctx.save();
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)'; // Subtle rose guide
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(margin + 4, paddleBaselineY);
  ctx.lineTo(width - margin - 4, paddleBaselineY);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
