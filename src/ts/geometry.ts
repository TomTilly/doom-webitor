import Point from './Point';
import Rect from './Rect';

export function isPointInRect(x: number, y: number, rect: Rect) {
   return x >= rect.x && x <= rect.right() && y >= rect.y && y <= rect.bottom();
}
