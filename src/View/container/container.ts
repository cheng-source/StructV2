import { Engine } from "../../engine";
import { Model, Marker } from "../../Model/modelData";
import { AnimationOptions, InteractionOptions, LayoutGroupOptions } from "../../options";
import { SV } from "../../StructV";
import { Animations } from "../animation";
import { g6Behavior, Renderer } from "../renderer";




export class Container {
    protected engine: Engine;
    protected DOMContainer: HTMLElement; // 可视化视图容器
    protected renderer: Renderer; // 渲染器
    protected prevModelList: Model[]; // 上一次渲染的模型列表

    protected animationsOptions: AnimationOptions;
    protected interactionOptions: InteractionOptions;

    protected afterAppendModelsCallbacks: ((models: Model[]) => void)[] = [];
    protected afterRemoveModelsCallbacks: ((models: Model[]) => void)[] = [];

    constructor(engine: Engine, DOMContainer: HTMLElement, g6Options: { [key: string]: any } = {}) {
        this.engine = engine;
        this.DOMContainer = DOMContainer;
        this.animationsOptions = engine.animationOptions;
        this.interactionOptions = engine.interactionOptions;
        this.prevModelList = [];

        const g6Plugins = [];

        if (g6Options.tooltip) {
            const tooltip = new SV.G6.Tooltip({
                offsetX: 10,
                offsetY: 20,
                shouldBegin(event) {
                    return event.item.getModel().SVModelType === 'element';
                },
                getContent: event => this.getTooltipContent(event.item.SVModel, { address: 'sourceId', data: 'data' }),
                itemTypes: ['node']
            });

            g6Plugins.push(tooltip);
        }

        this.renderer = new Renderer(engine, DOMContainer, {
            fitCenter: g6Options.fitCenter,
            modes: {
                default: this.initBehaviors(this.engine.optionsTable)
            },
            plugins: g6Plugins
        });

        this.afterInitRenderer();
    }


    private getTooltipContent(model: Model, items: { [key: string]: string }): HTMLElement {
        const wrapper = document.createElement('div');
       

        Object.keys(items).map(key => {
            let value = model[items[key]];
            if (value !== undefined && value !== null) {
                let item = document.createElement('div');
                item.innerHTML = `${key}：${value}`;
                wrapper.appendChild(item);
            }
        });

        return wrapper;
    }

    /**
     * 初始化交互行为
     * @param optionsTable
     * @returns 
     */
    protected initBehaviors(optionsTable: { [key: string]: LayoutGroupOptions }): g6Behavior[] {
        return ['drag-canvas', 'zoom-canvas'];
    }

    /**
     * 对比上一次和该次 modelList 找出新添加的节点和边
     * @param prevList
     * @param list
     */
    protected getAppendModels(prevList: Model[], list: Model[]): Model[] {
        return list.filter(item => !prevList.find(n => n.id === item.id));
    }

    /**
     * 对比上一次和该次 modelList 找出被删除的节点和边
     * @param prevList
     * @param list
     */
    protected getRemoveModels(prevList: Model[], list: Model[]): Model[] {
        return prevList.filter(item => !list.find(n => n.id === item.id));
    }

    /**
     * 找出重新指向的外部指针
     * @param list 
     * @returns 
     */
    protected findReTargetMarkers(list: Model[]): Marker[] {
        let prevMarkers = this.prevModelList.filter(item => item instanceof Marker),
            markers = list.filter(item => item instanceof Marker);

        return <Marker[]>markers.filter(item => prevMarkers.find(prevItem => {
            return prevItem.id === item.id && (<Marker>prevItem).target.id !== (<Marker>item).target.id
        }));
    }

    /**
     * 找出前后 label 发生变化的 model
     * @param list 
     */
    protected findLabelChangeModels(list: Model[]): Model[] {
        let labelChangeModels: Model[] = [];

        list.forEach(item => {
            const prevItem = this.prevModelList.find(prevItem => prevItem.id === item.id);

            if (prevItem === undefined) {
                return;
            }

            const prevLabel = prevItem.get('label'),
                label = item.get('label');

            if (prevLabel !== label) {
                labelChangeModels.push(item);
            }
        });

        return labelChangeModels;
    }

    /**
     * 处理新增的 G6Item（主要是动画）
     * @param appendData 
     */
    protected handleAppendModels(appendModels: Model[]) {
        let counter = 0;

        appendModels.forEach(item => {
            Animations.animate_append(item, {
                duration: this.animationsOptions.duration,
                timingFunction: this.animationsOptions.timingFunction,
                callback: () => {
                    counter++;

                    if (counter === appendModels.length) {
                        this.afterAppendModelsCallbacks.map(item => item(appendModels));
                    }
                }
            });
        });
    }

    /**
     * 处理被移除（也就是泄露）的 G6Item（主要是动画）
     * @param removeData 
     */
    protected handleRemoveModels(removeModels: Model[]) {
        let counter = 0;

        removeModels.forEach(item => {
            Animations.animate_remove(item, {
                duration: this.animationsOptions.duration,
                timingFunction: this.animationsOptions.timingFunction,
                callback: () => {
                    if (item.isLeak === false) {
                        this.renderer.removeModel(item);
                        item.renderG6Item = item.G6Item = null;
                    }

                    counter++;

                    if (counter === removeModels.length) {
                        this.afterRemoveModelsCallbacks.map(item => item(removeModels));
                    }
                }
            });
        });
    }

    /**
     * 处理发生变化的 models
     * @param models 
     */
    protected handleChangeModels(models: Model[]) { }

    /**
     * 初始化渲染器之后的回调
     */
    protected afterInitRenderer() { }

    // ------------------------------------------ hook ---------------------------------------------

    afterAppendModels(callback: (models: Model[]) => void) {
        this.afterAppendModelsCallbacks.push(callback);
    }

    afterRemoveModels(callback: (models: Model[]) => void) {
        this.afterRemoveModelsCallbacks.push(callback);
    }

    // ----------------------------------------------------------------------------------------


    /**
     * 渲染函数
     * @param modelList
     */
    public render(modelList: Model[]) {
        const appendModels: Model[] = this.getAppendModels(this.prevModelList, modelList),
            removeModels: Model[] = this.getRemoveModels(this.prevModelList, modelList),
            changeModels: Model[] = [
                ...appendModels,
                ...this.findLabelChangeModels(modelList),
                ...this.findReTargetMarkers(modelList)
            ];

        // 渲染视图
        this.renderer.render(modelList, removeModels);

        // 处理副作用
        this.handleAppendModels(appendModels);
        this.handleRemoveModels(removeModels);
        this.handleChangeModels(changeModels);

        if (this.renderer.getIsFirstRender()) {
            this.renderer.setIsFirstRender(false);
        }

        this.prevModelList = modelList;
    }

    /**
     * 获取 g6 实例
     */
    public getG6Instance() {
        return this.renderer.getG6Instance();
    }

    /**
     * 销毁
     */
    public destroy() {
        this.renderer.destroy();
        this.DOMContainer = null;
        this.prevModelList = [];
        this.animationsOptions = this.interactionOptions = null;
    }
}


// -----------------------------------------------------------------------------------------------------------








