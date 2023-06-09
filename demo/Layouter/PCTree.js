 
SV.registerLayout('PCTree', {

    sourcesPreprocess(sources) {

        let headNodes = sources.filter(item => item.type === 'PCTreeHead');

        for(let i = 0; i < headNodes.length; i++){

            let dataNode = {
                type: 'PCTreePreHead',
                id: headNodes[i].id + '_0',
                data: headNodes[i].preData,
                indexLeft: headNodes[i].index,
                root: headNodes[i].root
            };
            let externalNode = {
                type: 'structureExteral',
                id: headNodes[0].id + '_1',
            };

            if(dataNode.root){
                dataNode.indexTop = 'data';
                headNodes[i].indexTop = ' parent  firstChild';

                if(headNodes[i].cursor){
                    externalNode.cursor = headNodes[i].cursor;
                    delete headNodes[i].cursor;
                }else{
                    externalNode.external = headNodes[i].external;
                    delete headNodes[i].external;
                }

                sources.push(externalNode)
            }
            sources.push(dataNode)
        }

        return sources;
    },

    defineOptions() {
        return {
            node: {
                PCTreePreHead: {
                    type: 'rect',
                    label: '[data]',
                    size: [60, 34],
                    labelOptions: {
                        style: { fontSize: 16 }
                    },
                    style: {
                        stroke: '#333',
                        fill: '#95e1d3',
                        offset: 25
                    }
                },
                PCTreeHead: {
                    type: 'two-cell-node',
                    label: '[data]',
                    size: [120, 34],
                    style: {
                        stroke: '#333', 
                        fill: '#95e1d3'
                    }
                },
                PCTreeNode: {
                    type: 'link-list-node',
                    label: '[data]',
                    size: [60, 27],
                    style: {
                        stroke: '#333',
                        fill: '#00AF92'
                    }
                },
                structureExteral: {
                    type: 'rect',
                    size: [0, 0]
                }
            },
            indexLabel: {
                indexTop: { position: 'top' },
                indexLeft: { position: 'left' }
            },
            link: {
                headNext: { 
                    sourceAnchor: 1,
                    targetAnchor: 6,
                    style: {
                        stroke: '#333',
                        endArrow: {
                            path: G6.Arrow.triangle(8, 6, 0), 
                            fill: '#333'
                        },
                        startArrow: {
                            path: G6.Arrow.circle(2, -1), 
                            fill: '#333'
                        }
                    }
                },
                next: {
                    sourceAnchor: 2,
                    targetAnchor: 6,
                    style: {
                        stroke: '#333',
                        endArrow: {
                            path: G6.Arrow.triangle(8, 6, 0), 
                            fill: '#333'
                        },
                        startArrow: {
                            path: G6.Arrow.circle(2, -1), 
                            fill: '#333'
                        }
                    }
                },
                loopNext: {
                    type: 'quadratic',
                    curveOffset: -100,
                    sourceAnchor: 2,
                    targetAnchor: 7,
                    style: {
                        stroke: '#333',
                        endArrow: 'default',
                        startArrow: {
                            path: G6.Arrow.circle(2, -1),
                            fill: '#333'
                        }
                    }
                }
            },
            marker: {
                external: {
                    type: 'pointer',
                    anchor: 0,
                    offset: 8,
                    style: {
                        fill: '#f08a5d'
                    }
                },
                cursor: {
                    type: 'cursor',
                    anchor: 0,
                    style: {
                        fill: '#f08a5d'
                    }
                }
            },
            layout: {
                xInterval: 50,
                yInterval: 86
            },
            behavior: {
                dragNode: ['PCTreeNode']
            }
        };
    },

    //判断node节点是否之前布局过
    isUnique(value, allNodeIdValue){
        let re = new RegExp("" + value);
        return !re.test(allNodeIdValue);
    },
    
    /**
     * 对子树进行递归布局
     * @param node 
     * @param parent 
     */
    layoutItem(node, prev, layoutOptions, allNodeId, isRootNode) {
        if(!node) {
            return null;
        }
        let width = node.get('size')[0],
            idValue = node.id.split('(')[1].slice(0, -1);
        
        //有y型链表的情况不用再布局
        if(this.isUnique(idValue, allNodeId.value)){
            if(prev) {
                node.set('y', prev.get('y'));
                node.set('x', prev.get('x') + layoutOptions.xInterval + width);
            }
    
            //如果是有root标识的和其后续节点，则不用记录id
            //方便重更新布局
            if(!isRootNode){
                allNodeId.value += idValue;
            }
    
            if(node.next) {
                this.layoutItem(node.next, node, layoutOptions, allNodeId, isRootNode);
            }
        }
    },  

    layout(elements, layoutOptions) {
        let headNode = elements.filter(item => item.type === 'PCTreeHead'),
            preHeadNode =  elements.filter(item => item.type === 'PCTreePreHead'),
            externalNode =  elements.filter(item => item.type === 'structureExteral'),
            roots = elements.filter(item => item.type === 'PCTreeNode' && item.root),
            height = headNode[0].get('size')[1],
            width = headNode[0].get('size')[0],
            i,
            allNodeId = { value: ''};  //引用类型用于传参
    
        for(i = 0; i < headNode.length; i++) {
            let node = headNode[i],
                preNode = preHeadNode[i];

            node.set({
                x:  0,
                y: i * height
            });

            preNode.set({
                x:  width  / 4,
                y:  (i + 1) * height
            })

            if(node.headNext) {
                let y = node.get('y') + height - node.headNext.get('size')[1],
                    x = width + layoutOptions.xInterval * 2;

                node.headNext.set({ x, y });
                this.layoutItem(node.headNext, null, layoutOptions, allNodeId, false);
            }
        }

        if(externalNode.length > 0){
            externalNode[0].set({
                x:  -25,
                y: i / 2 * height
            });
        }

        for(i = 0; i < roots.length; i++) {
            let nodeWidth = roots[0].get('size')[0],
                nodeInternalSum = i * (nodeWidth + layoutOptions.xInterval);

            roots[i].set({
                x: headNode[0].get('x') + width + layoutOptions.xInterval * 2 + nodeInternalSum, 
                y: headNode[0].get('y') - layoutOptions.yInterval 
            })

            this.layoutItem(roots[i], null, layoutOptions, allNodeId, true);
        }
    }
});



