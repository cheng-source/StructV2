import { Util, Item } from '@antv/g6';

export type animationConfig = {
	duration: number;
	timingFunction: string;
	callback?: () => void;
	[key: string]: any;
};

/**
 * 动画表
 */
export const Animations = {
	/**
	 * 添加节点 / 边时的动画效果
	 * @param G6Item
	 * @param animationConfig
	 */
	APPEND(G6Item: Item, animationConfig: animationConfig) {
		const type = G6Item.getType(), 
			group = G6Item.getContainer(),
			Mat3 = Util.mat3,
			animateCfg = {
				duration: animationConfig.duration,
				easing: animationConfig.timingFunction,
				callback: animationConfig.callback,
			};

		if (type === 'node') {
			let matrix = group.getMatrix(), 
				targetMatrix = Mat3.clone(matrix);

      // 让结点大小从0到1出现
			Mat3.scale(matrix, matrix, [0, 0]);//第一个参数的matrix是你要更改的矩阵,第二个参数是更改之后的新矩阵,第三个参数就是缩放系数，分别对应xy
			Mat3.scale(targetMatrix, targetMatrix, [1, 1]);

      // 让结点透明度从0到1
			group.attr({ matrix, opacity: 0 });
			group.animate({ matrix: targetMatrix, opacity: 1 }, animateCfg);
		}

		if (type === 'edge') {
			const line = group.get('children')[0],
				length = line.getTotalLength();

			line.attr({ lineDash: [0, length], opacity: 0 });
			line.animate({ lineDash: [length, 0], opacity: 1 }, animateCfg);
		}
	},

	/**
	 * 移除节点 / 边时的动画效果
	 * @param G6Item
	 * @param animationConfig
	 */
	REMOVE(G6Item: Item, animationConfig: animationConfig) {
		const type = G6Item.getType(),
			group = G6Item.getContainer(),
			Mat3 = Util.mat3,
			animateCfg = {
				duration: animationConfig.duration,
				easing: animationConfig.timingFunction,
				callback: animationConfig.callback,
			};

		if (type === 'node') {
			let matrix = Mat3.clone(group.getMatrix());

			Mat3.scale(matrix, matrix, [0, 0]);
			group.animate({ opacity: 0, matrix }, animateCfg);
		}

		if (type === 'edge') {
			const line = group.get('children')[0],
				length = line.getTotalLength();

			line.animate({ lineDash: [0, length], opacity: 0 }, animateCfg);
		}
	},

	/**
	 *
	 * @param G6Item
	 * @param animationConfig
	 */
	FADE_IN(G6Item: Item, animationConfig: animationConfig) {
		const group = G6Item.getContainer(),
			animateCfg = {
				duration: animationConfig.duration,
				easing: animationConfig.timingFunction,
				callback: animationConfig.callback,
			};

		group.attr({ opacity: 0 });
		group.animate({ opacity: 1 }, animateCfg);
	},
};
