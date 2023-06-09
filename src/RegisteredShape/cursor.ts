import { Util } from '../Common/util';


export default Util.registerShape('cursor', {
    draw(cfg, group) {
        const keyShape = group.addShape('path', {
            attrs: {
                path: this.getPath(cfg),
                fill: cfg.style.fill,
                matrix: cfg.style.matrix
            },
            name: 'cursor-path'
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};

            const bgRect = group.addShape('rect', {
                attrs: {
                    x: 0, 
                    y: 0,
                    text: cfg.label,
                    fill: 'transparent',
                    radius: 2,
                },
                name: 'bgRect'
            });

            const text = group.addShape('text', {
                attrs: {
                    x: 0, 
                    y: 0,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: style.fill || '#999',
                    fontSize: style.fontSize || 16
                },
                name: 'cursor-text-shape'
            });

            const { width: textWidth, height: textHeight } = text.getBBox();
            bgRect.attr({ 
                width: textWidth + 6,
                height: textHeight + 6
            });

            // 旋转文字
            const markerEndPosition = cfg.markerEndPosition;
            if(markerEndPosition) {
                let textX = markerEndPosition[0],
                    textY = markerEndPosition[1];

                text.attr({ 
                    x: textX,
                    y: textY
                });

                bgRect.attr({ 
                    x: textX - textWidth / 2 - 3,
                    y: textY - textHeight / 2 - 3
                });
            }
        }

        return keyShape;
    },

    
    getPath(cfg) {
        let width = cfg.size[0],
            height = cfg.size[1];

        const path = [
            ['M', 0, 0], 
            ['L', -width / 2, -height],
            ['L', width / 2, -height],
            ['L', 0, 0],
            ['Z'], 
        ];

        return path;
    }
});