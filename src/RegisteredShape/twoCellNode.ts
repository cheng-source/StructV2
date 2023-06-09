import { Util } from '../Common/util';

export default Util.registerShape(
	'two-cell-node',
	{
		draw(cfg, group) {
			cfg.size = cfg.size || [30, 10];

			const width = cfg.size[0],
				height = cfg.size[1];

			const wrapperRect = group.addShape('rect', {
				attrs: {
					x: width / 2,
					y: height / 2,
					width: width,
					height: height,
					stroke: cfg.style.stroke,
					fill: cfg.style.backgroundFill || '#eee',
				},
				name: 'wrapper',
			});

			group.addShape('rect', {
				attrs: {
					x: width / 2,
					y: height / 2,
					width: width / 2,
					height: height,
					fill: cfg.style.fill,
					stroke: cfg.style.stroke,
				},
				name: 'left-rect',
				draggable: true,
			});

			const style = (cfg.labelCfg && cfg.labelCfg.style) || {};

			if (cfg.label) {
				if (Array.isArray(cfg.label)) {
					let tag = cfg.label[0],
						data = cfg.label[1];

					group.addShape('text', {
						attrs: {
							x: width * (3 / 4),
							y: height,
							textAlign: 'center',
							textBaseline: 'middle',
							text: tag,
							fill: style.fill || '#000',
							fontSize: style.fontSize || 16,
							cursor: cfg.style.cursor,
						},
						name: 'tag',
						draggable: true,
					});

					group.addShape('text', {
						attrs: {
							x: width * (5 / 4),
							y: height,
							textAlign: 'center',
							textBaseline: 'middle',
							text: data,
							fill: style.fill || '#000',
							fontSize: style.fontSize || 16,
							cursor: cfg.style.cursor,
						},
						name: 'data',
						draggable: true,
					});
				} else {
					group.addShape('text', {
						attrs: {
							x: width * (3 / 4),
							y: height,
							textAlign: 'center',
							textBaseline: 'middle',
							text: cfg.label,
							fill: style.fill || '#000',
							fontSize: style.fontSize || 16,
							cursor: cfg.style.cursor,
						},
						name: 'label',
						draggable: true,
					});
				}
			}

			//图 数据结构中没有后续指针
			if (cfg.id.includes('tableHeadNode') && !cfg.headNext) {
				group.addShape('text', {
					attrs: {
						x: width * (5 / 4),
						y: height * (8 / 7),
						textAlign: 'center',
						textBaseline: 'middle',
						text: '^',
						fill: style.fill || '#000',
						fontSize: 20,
						cursor: cfg.style.cursor,
					},
					name: 'null-headNext',
					draggable: true,
				});
			}

			//哈希表 数据结构中没有后续指针
			if (cfg.id.includes('head') && !cfg.start) {
				group.addShape('text', {
					attrs: {
						x: width * (5 / 4),
						y: height * (8 / 7),
						textAlign: 'center',
						textBaseline: 'middle',
						text: '^',
						fill: style.fill || '#000',
						fontSize: 20,
						cursor: cfg.style.cursor,
					},
					name: 'null-start',
					draggable: true,
				});
			}

			//pctree 数据结构中没有后续指针
			if (cfg.id.includes('PCTreeHead') && !cfg.headNext) {
				group.addShape('text', {
					attrs: {
						x: width * (5 / 4),
						y: height * (8 / 7),
						textAlign: 'center',
						textBaseline: 'middle',
						text: '^',
						fill: style.fill || '#000',
						fontSize: 20,
						cursor: cfg.style.cursor,
					},
					name: 'null-headNext2',
					draggable: true,
				});
			}
			return wrapperRect;
		},

		getAnchorPoints() {
			return [
				[0.5, 0],
				[3 / 4, 0.5],
				[0.5, 1],
				[0, 0.5],
			];
		},
	},
	'rect'
);
