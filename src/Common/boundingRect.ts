import { Vector } from './vector';

// 包围盒类型
export type BoundingRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

// 包围盒操作
export const Bound = {
	/**
	 * 从点集生成包围盒
	 * @param points
	 */
	fromPoints(points: Array<[number, number]>): BoundingRect {
		let maxX = -Infinity,
			minX = Infinity,
			maxY = -Infinity,
			minY = Infinity;

		points.map(item => {
			if (item[0] > maxX) maxX = item[0];
			if (item[0] < minX) minX = item[0];
			if (item[1] > maxY) maxY = item[1];
			if (item[1] < minY) minY = item[1];
		});

		return {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY,
		};
	},

	/**
	 * 由包围盒转化为四个顶点（顺时针）
	 * @param bound
	 */
	toPoints(bound: BoundingRect): Array<[number, number]> {
		return [
			[bound.x, bound.y],
			[bound.x + bound.width, bound.y],
			[bound.x + bound.width, bound.y + bound.height],
			[bound.x, bound.y + bound.height],
		];
	},

	/**
	 * 求包围盒并集
	 * @param arg
	 */
	union(...arg: BoundingRect[]): BoundingRect {
		if (arg.length === 0) {
			return {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
			};
		}

		return arg.length > 1
			? arg.reduce((total, cur) => {
					let minX = Math.min(total.x, cur.x),
						maxX = Math.max(total.x + total.width, cur.x + cur.width),
						minY = Math.min(total.y, cur.y),
						maxY = Math.max(total.y + total.height, cur.y + cur.height);

					return {
						x: minX,
						y: minY,
						width: maxX - minX,
						height: maxY - minY,
					};
			  })
			: arg[0];
	},

	/**
	 * 包围盒求交集
	 * @param b1
	 * @param b2
	 */
	intersect(b1: BoundingRect, b2: BoundingRect): BoundingRect {
		let x,
			y,
			maxX,
			maxY,
			overlapsX,
			overlapsY,
			b1x = b1.x,
			b1mx = b1.x + b1.width,
			b2x = b2.x,
			b2mx = b2.x + b2.width,
			b1y = b1.y,
			b1my = b1.y + b1.height,
			b2y = b2.y,
			b2my = b2.y + b2.height;

		x = Math.max(b1x, b2x);
		maxX = Math.min(b1mx, b2mx);
		overlapsX = maxX - x;

		y = Math.max(b1y, b2y);
		maxY = Math.min(b1my, b2my);
		overlapsY = maxY - y;

		if (!overlapsX || !overlapsY) return null;

		return {
			x,
			y,
			width: overlapsX,
			height: overlapsY,
		};
	},

	/**
	 * 位移包围盒
	 * @param bound
	 * @param dx
	 * @param dy
	 */
	translate(bound: BoundingRect, dx: number, dy: number) {
		bound.x += dx;
		bound.y += dy;
	},

	/**
	 * 求包围盒旋转后新形成的包围盒
	 * @param bound
	 * @param rot
	 */
	rotation(bound: BoundingRect, rot: number): BoundingRect {
		let cx = bound.x + bound.width / 2,
			cy = bound.y + bound.height / 2;

		return Bound.fromPoints(Bound.toPoints(bound).map(item => Vector.rotation(rot, item, [cx, cy])));
	},

	/**
	 * 判断两个包围盒是否相交
	 * @param b1
	 * @param b2
	 */
	isOverlap(b1: BoundingRect, b2: BoundingRect): boolean {
		let maxX1 = b1.x + b1.width,
			maxY1 = b1.y + b1.height,
			maxX2 = b2.x + b2.width,
			maxY2 = b2.y + b2.height;

		if (b1.x < maxX2 && b2.x < maxX1 && b1.y < maxY2 && b2.y < maxY1) {
			return true;
		}

		return false;
	},
};
