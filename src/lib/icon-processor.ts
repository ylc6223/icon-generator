import { DetectedIcon } from '@/stores/workbench-store';

/**
 * Detects icon regions in a grid-based image
 * Assumes icons are arranged in a regular grid pattern
 */
export async function detectIconsInImage(
  imageData: string,
  gridRows: number,
  gridCols: number
): Promise<DetectedIcon[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const cellWidth = Math.floor(img.width / gridCols);
      const cellHeight = Math.floor(img.height / gridRows);
      const icons: DetectedIcon[] = [];

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const x = col * cellWidth;
          const y = row * cellHeight;
          
          // Extract the cell as image data
          const cellCanvas = document.createElement('canvas');
          const cellCtx = cellCanvas.getContext('2d');
          if (!cellCtx) continue;
          
          cellCanvas.width = cellWidth;
          cellCanvas.height = cellHeight;
          cellCtx.drawImage(
            img,
            x, y, cellWidth, cellHeight,
            0, 0, cellWidth, cellHeight
          );

          const imageDataUrl = cellCanvas.toDataURL('image/png');

          icons.push({
            id: `icon-${row}-${col}`,
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            selected: true,
            imageData: imageDataUrl,
          });
        }
      }

      resolve(icons);
    };
    img.src = imageData;
  });
}

/**
 * Converts an image to SVG using potrace-like tracing
 * This is a simplified version - in production you'd use a proper vectorization library
 */
export async function imageToSvg(
  imageData: string,
  preset: 'balanced' | 'clean' | 'precise'
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Scale based on preset
      const scale = preset === 'precise' ? 2 : preset === 'clean' ? 1.5 : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.imageSmoothingEnabled = preset !== 'precise';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data and create traced SVG
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const svg = traceToSvg(imgData, preset);
      
      resolve(svg);
    };
    img.src = imageData;
  });
}

/**
 * Simple image tracing to SVG paths
 */
function traceToSvg(
  imageData: ImageData, 
  preset: 'balanced' | 'clean' | 'precise'
): string {
  const { width, height, data } = imageData;
  
  // Threshold based on preset
  const threshold = preset === 'clean' ? 200 : preset === 'precise' ? 128 : 160;
  
  // Create binary representation
  const binary: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    binary[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      
      // Check if pixel is "foreground" (not background/white)
      const brightness = (r + g + b) / 3;
      const isBackground = brightness > threshold || a < 128;
      binary[y][x] = !isBackground;
    }
  }

  // Generate simple path data using edge detection
  const paths = generatePaths(binary, width, height);
  
  // Simplify paths based on preset
  const simplifyFactor = preset === 'precise' ? 0.5 : preset === 'clean' ? 2 : 1;
  const simplifiedPaths = paths.map(path => simplifyPath(path, simplifyFactor));

  const pathStrings = simplifiedPaths
    .filter(p => p.length > 2)
    .map(path => {
      if (path.length === 0) return '';
      let d = `M ${path[0].x} ${path[0].y}`;
      for (let i = 1; i < path.length; i++) {
        d += ` L ${path[i].x} ${path[i].y}`;
      }
      d += ' Z';
      return d;
    })
    .filter(d => d.length > 0);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor">
  <path d="${pathStrings.join(' ')}" fill-rule="evenodd"/>
</svg>`;
}

interface Point {
  x: number;
  y: number;
}

function generatePaths(binary: boolean[][], width: number, height: number): Point[][] {
  const visited: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    visited[y] = new Array(width).fill(false);
  }

  const paths: Point[][] = [];

  // Simple contour tracing
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (binary[y][x] && !visited[y][x]) {
        // Check if this is an edge pixel
        const isEdge = !binary[y-1][x] || !binary[y+1][x] || 
                       !binary[y][x-1] || !binary[y][x+1];
        
        if (isEdge) {
          const path = traceContour(binary, visited, x, y, width, height);
          if (path.length > 4) {
            paths.push(path);
          }
        }
        visited[y][x] = true;
      }
    }
  }

  return paths;
}

function traceContour(
  binary: boolean[][], 
  visited: boolean[][], 
  startX: number, 
  startY: number,
  width: number,
  height: number
): Point[] {
  const path: Point[] = [];
  const directions = [
    [0, -1], [1, -1], [1, 0], [1, 1],
    [0, 1], [-1, 1], [-1, 0], [-1, -1]
  ];

  let x = startX;
  let y = startY;
  let dir = 0;
  let steps = 0;
  const maxSteps = width * height;

  do {
    path.push({ x, y });
    visited[y][x] = true;

    // Find next edge pixel
    let found = false;
    for (let i = 0; i < 8; i++) {
      const newDir = (dir + i) % 8;
      const nx = x + directions[newDir][0];
      const ny = y + directions[newDir][1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (binary[ny][nx]) {
          const isEdge = nx === 0 || nx === width - 1 || ny === 0 || ny === height - 1 ||
                        !binary[ny-1][nx] || !binary[ny+1][nx] || 
                        !binary[ny][nx-1] || !binary[ny][nx+1];
          
          if (isEdge && !visited[ny][nx]) {
            x = nx;
            y = ny;
            dir = (newDir + 5) % 8;
            found = true;
            break;
          }
        }
      }
    }

    if (!found) break;
    steps++;
  } while ((x !== startX || y !== startY) && steps < maxSteps);

  return path;
}

function simplifyPath(path: Point[], tolerance: number): Point[] {
  if (path.length <= 2) return path;
  
  // Douglas-Peucker simplification
  const sqTolerance = tolerance * tolerance;
  
  function getSqDist(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }
  
  function getSqSegDist(p: Point, p1: Point, p2: Point): number {
    let x = p1.x, y = p1.y;
    let dx = p2.x - x, dy = p2.y - y;
    
    if (dx !== 0 || dy !== 0) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2.x;
        y = p2.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    
    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
  }
  
  function simplifyDPStep(points: Point[], first: number, last: number, sqTol: number, simplified: Point[]): void {
    let maxSqDist = sqTol;
    let index = 0;
    
    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }
    
    if (maxSqDist > sqTol) {
      if (index - first > 1) simplifyDPStep(points, first, index, sqTol, simplified);
      simplified.push(points[index]);
      if (last - index > 1) simplifyDPStep(points, index, last, sqTol, simplified);
    }
  }
  
  const simplified = [path[0]];
  simplifyDPStep(path, 0, path.length - 1, sqTolerance, simplified);
  simplified.push(path[path.length - 1]);
  
  return simplified;
}

/**
 * Exports selected icons as a ZIP file
 */
export async function exportIconsAsZip(icons: DetectedIcon[], preset: 'balanced' | 'clean' | 'precise'): Promise<Blob> {
  // Dynamic import for jszip
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  const selectedIcons = icons.filter(icon => icon.selected);
  
  for (let i = 0; i < selectedIcons.length; i++) {
    const icon = selectedIcons[i];
    if (icon.imageData) {
      const svg = await imageToSvg(icon.imageData, preset);
      zip.file(`icon-${i + 1}.svg`, svg);
    }
  }
  
  return zip.generateAsync({ type: 'blob' });
}
