import Point from './Point';
import Rect from './Rect';

export function isPointInRect(point: Point, rect: Rect) {
   return (
      point.x >= rect.x &&
      point.x <= rect.right() &&
      point.y >= rect.y &&
      point.y <= rect.bottom()
   );
}
