import { Element, Link, Marker } from "./Model/modelData";
import { Sources } from "./sources";
import { LayoutGroupTable, ModelConstructor } from "./Model/modelConstructor";
import { AnimationOptions, EngineOptions, InteractionOptions, LayoutGroupOptions, ViewOptions } from "./options";
import { ViewManager } from "./View/viewManager";
import { SV } from "./StructV";
import { EventBus } from "./Common/eventBus";


export class Engine { 
    private modelConstructor: ModelConstructor = null;
    private viewManager: ViewManager
    private prevStringSourceData: string;
    private layoutGroupTable: LayoutGroupTable;
    
    public engineOptions: EngineOptions;
    public viewOptions: ViewOptions;
    public animationOptions: AnimationOptions;
    public interactionOptions: InteractionOptions;

    public optionsTable: { [key: string]: LayoutGroupOptions };

    constructor(DOMContainer: HTMLElement, engineOptions: EngineOptions) {
        this.optionsTable = {};

        this.engineOptions = Object.assign({
            freedContainer: null,
            leakContainer: null
        }, engineOptions);

        this.viewOptions = Object.assign({
            fitCenter: true,
            fitView: false,
            groupPadding: 20
        }, engineOptions.view);

        this.animationOptions = Object.assign({
            enable: true,
            duration: 900,
            timingFunction: 'easePolyOut'
        }, engineOptions.animation);

        this.interactionOptions = Object.assign({
            drag: true,
            zoom: true,
            dragNode: true,
            selectNode: true,
            changeHighlight: '#fc5185'
        }, engineOptions.interaction);

        // 初始化布局器配置项
        Object.keys(SV.registeredLayouter).forEach(layouter => {
            if(this.optionsTable[layouter] === undefined) {
                 const options: LayoutGroupOptions = SV.registeredLayouter[layouter].defineOptions();

                 options.behavior = Object.assign({
                     dragNode: true,
                     selectNode: true
                 }, options.behavior);

                 this.optionsTable[layouter] = options;
            }
        });

        this.modelConstructor = new ModelConstructor(this);
        this.viewManager = new ViewManager(this, DOMContainer);
    }

    /**
     * 输入数据进行渲染
     * @param sourcesData 
     */
    public render(sourceData: Sources) {
        if(sourceData === undefined || sourceData === null) {
            return;
        }

        let stringSourceData = JSON.stringify(sourceData);
        if(this.prevStringSourceData === stringSourceData) {
            return;
        }
        this.prevStringSourceData = stringSourceData;

        // 1 转换模型（data => model）
        this.layoutGroupTable = this.modelConstructor.construct(sourceData);
        
        // 2 渲染（使用g6进行渲染）
        this.viewManager.renderAll(this.layoutGroupTable);
    }

    /**
     * 重新布局
     */
    public reLayout() {
        const layoutGroupTable = this.modelConstructor.getLayoutGroupTable();

        this.viewManager.reLayout(layoutGroupTable);

        layoutGroupTable.forEach(group => {
            group.modelList.forEach(item => {
                if(item instanceof Link) return;

                let model = item.G6Item.getModel(),
                    x = item.get('x'),
                    y = item.get('y');

                model.x = x;
                model.y = y;
            });
        });

        this.viewManager.refresh();
    }

    /**
     * 获取 G6 实例
     */
    public getGraphInstance() {
        return this.viewManager.getG6Instance();
    }

    /**
     * 获取所有 element
     * @param  group
     */
    public getElements(group?: string): Element[] {
        const layoutGroupTable = this.modelConstructor.getLayoutGroupTable();

        if(group && layoutGroupTable.has('group')) {
            return layoutGroupTable.get('group').element;
        }

        const elements: Element[] = [];
        layoutGroupTable.forEach(item => {
            elements.push(...item.element);
        })

        return elements;
    }

    /**
     * 获取所有 marker
     * @param  group
     */
    public getMarkers(group?: string): Marker[] {
        const layoutGroupTable = this.modelConstructor.getLayoutGroupTable();

        if(group && layoutGroupTable.has('group')) {
            return layoutGroupTable.get('group').marker;
        }

        const markers: Marker[] = [];
        layoutGroupTable.forEach(item => {
            markers.push(...item.marker);
        })

        return markers;
    }

    /**
     * 获取所有 link
     * @param  group
     */
    public getLinks(group?: string): Link[] {
        const layoutGroupTable = this.modelConstructor.getLayoutGroupTable();

        if(group && layoutGroupTable.has('group')) {
            return layoutGroupTable.get('group').link;
        }

        const links: Link[] = [];
        layoutGroupTable.forEach(item => {
            links.push(...item.link);
        })

        return links;
    }

    /**
     * 隐藏某些组
     * @param groupNames 
     */
    public hideGroups(groupNames: string | string[]) {
        const names = Array.isArray(groupNames)? groupNames: [groupNames],
              instance = this.viewManager.getG6Instance();

        this.layoutGroupTable.forEach(item => {
            const hasName = names.find(name => name === item.layouterName);

            if(hasName && !item.isHide) {
                item.modelList.forEach(model => instance.hideItem(model.G6Item));
                item.isHide = true;
            }

            if(!hasName && item.isHide) {
                item.modelList.forEach(model => instance.showItem(model.G6Item));
                item.isHide = false;
            }
        });
    }

    /**
     * 使用id选中某个节点
     * @param id 
     * @param callback 
     */
    public selectElement(id: string, callback?: (element: Element) => void) {
        const elements = this.getElements();
        const stringId = id.toString();
        const targetElement = elements.find(item => item.sourceId === stringId);

        if(targetElement) {
            callback && callback(targetElement);
        }
    }

    /**
     * 调整容器尺寸
     * @param containerName
     * @param width 
     * @param height 
     */
    public resize(containerName: string, width: number, height: number) {
        this.viewManager.resize(containerName, width, height);
    }

    /**
     * 绑定 G6 事件
     * @param eventName 
     * @param callback 
     */
    public on(eventName: string, callback: Function) {
        if(typeof callback !== 'function') {
            return;
        }

        if(eventName === 'onFreed' || eventName === 'onLeak') {
            EventBus.on(eventName, callback);
            return;
        }

        this.viewManager.getG6Instance().on(eventName, callback);
    }

    /**
     * 销毁引擎
     */
    public destroy() {
        this.modelConstructor.destroy();
        this.viewManager.destroy();
    }
};