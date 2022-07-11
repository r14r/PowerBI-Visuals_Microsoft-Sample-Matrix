import "./../../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceContainer = powerbi.VisualObjectInstanceContainer;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
declare type Selector = any;
export declare class ObjectEnumerationBuilder {
    private instances;
    private containers;
    private containerIdx;
    pushInstance(instance: VisualObjectInstance, mergeInstances?: boolean): ObjectEnumerationBuilder;
    pushContainer(container: VisualObjectInstanceContainer): ObjectEnumerationBuilder;
    popContainer(): ObjectEnumerationBuilder;
    complete(): VisualObjectInstanceEnumerationObject | undefined;
    private canMerge;
    private extend;
    static merge(x: VisualObjectInstanceEnumeration, y: VisualObjectInstanceEnumeration): VisualObjectInstanceEnumerationObject;
    static normalize(x: VisualObjectInstanceEnumeration): VisualObjectInstanceEnumerationObject;
    static getContainerForInstance(enumeration: VisualObjectInstanceEnumerationObject, instance: VisualObjectInstance): VisualObjectInstanceContainer | undefined;
    static selectorEquals(x: Selector, y: Selector): boolean;
}
export {};
