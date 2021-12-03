import { SVNode } from "./Model/SVNode";
import { SourceNode } from "./sources";


export interface Style {
    fill: string; // 填充颜色
    text: string; // 图形文本
    textFill: string; // 文本颜色
    fontSize: number; // 字体大小
    fontWeight: number; // 字重
    stroke: string; // 描边样式
    opacity: number; // 透明度
    lineWidth: number; // 线宽
    matrix: number[]; // 变换矩阵
};


export interface NodeLabelOption {
    position: string;
    offset: number;
    style: Style;
};


export interface NodeIndexOption extends NodeLabelOption {
    position: 'top' | 'right' | 'bottom' | 'left';
    value: string;
    style: Style;
}


export interface LinkLabelOption {
    refX: number;
    refY: number;
    position: string;
    autoRotate: boolean;
    style: Style;
};


export interface ModelOption {
    type: string;
    style: Style;
}


export interface NodeOption extends ModelOption {
    size: number | [number, number];
    rotation: number;
    label: string | string[];
    anchorPoints: number[][];
    indexOptions: NodeIndexOption;
    labelOptions: NodeLabelOption;
}


export interface LinkOption extends ModelOption {
    sourceAnchor: number | ((index: number) => number);
    targetAnchor: number | ((index: number) => number);
    label: string;
    curveOffset: number;
    labelOptions: LinkLabelOption;
}


export interface MarkerOption extends NodeOption {
    type: 'pointer' | 'cursor' | 'clen-queue-pointer';
    anchor: number;
    offset: number;
    labelOffset: number;
};


export interface LayoutOptions {
    [key: string]: any;
};


export interface LayoutGroupOptions {
    node: { [key: string]: NodeOption };
    link?: { [key: string]: LinkOption }
    marker?: { [key: string]: MarkerOption }
    layout?: LayoutOptions;
};


/**
 * ---------------------------------------------------------------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------------------------------------------------------------
 * ------------------------------------------------------------------------------------------------------------------------
 */

export interface ViewOptions {
    fitCenter: boolean;
    groupPadding: number;
    updateHighlight: string;
    leakAreaHeight: number;
}


export interface AnimationOptions {
    enable: boolean;
    duration: number;
    timingFunction: string;
};


export interface InteractionOptions {
    drag: boolean;
    zoom: boolean;
}

export interface EngineOptions {
    view?: ViewOptions;
    animation?: AnimationOptions;
    interaction?: InteractionOptions;
};


export interface LayoutCreator {
    defineOptions(): LayoutGroupOptions;
    sourcesPreprocess?(sources: SourceNode[], options: LayoutGroupOptions): SourceNode[];
    defineLeakRule?(nodes: SVNode[]): SVNode[];
    layout(nodes: SVNode[], layoutOptions: LayoutOptions);
    [key: string]: any;
}

