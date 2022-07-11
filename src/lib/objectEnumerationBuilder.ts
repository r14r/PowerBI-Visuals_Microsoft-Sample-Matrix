"use strict";

import "./../../style/visual.less";

import { isEmpty, isArray } from 'lodash';

import * as d3 from "d3";

import powerbi from "powerbi-visuals-api";

import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;

import VisualObjectInstanceContainer=powerbi.VisualObjectInstanceContainer;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import DataView = powerbi.DataView;

/* TODO */
type Selector = any;

/**/
export class ObjectEnumerationBuilder {
  private instances: VisualObjectInstance[];
  private containers: VisualObjectInstanceContainer[];
  private containerIdx: number | undefined;

  public pushInstance(
    instance: VisualObjectInstance,
    mergeInstances: boolean = true
  ): ObjectEnumerationBuilder {
    let instances = this.instances;
    if (!instances) {
      instances = this.instances = [];
    }

    let containerIdx = this.containerIdx;
    if (containerIdx != null) {
      instance.containerIdx = containerIdx;
    }

    if (mergeInstances) {
      // Attempt to merge with an existing item if possible.
      for (let existingInstance of instances) {
        if (this.canMerge(existingInstance, instance)) {
          this.extend(existingInstance, instance, "properties");
          this.extend(existingInstance, instance, "validValues");

          return this;
        }
      }
    }

    instances.push(instance);

    return this;
  }

  public pushContainer(
    container: VisualObjectInstanceContainer
  ): ObjectEnumerationBuilder {
    let containers = this.containers;
    if (!containers) {
      containers = this.containers = [];
    }

    let updatedLen = containers.push(container);
    this.containerIdx = updatedLen - 1;

    return this;
  }

  public popContainer(): ObjectEnumerationBuilder {
    this.containerIdx = undefined;

    return this;
  }

  public complete(): VisualObjectInstanceEnumerationObject | undefined{
    if (!this.instances) return;

    let result: VisualObjectInstanceEnumerationObject = {
      instances: this.instances,
    };

    let containers = this.containers;
    if (containers) {
      result.containers = containers;
    }

    return result;
  }

  private canMerge(x: VisualObjectInstance, y: VisualObjectInstance): boolean {
    return (
      x.objectName === y.objectName &&
      x.containerIdx === y.containerIdx &&
      ObjectEnumerationBuilder.selectorEquals(x.selector, y.selector)
    );
  }

  private extend(
    target: VisualObjectInstance,
    source: VisualObjectInstance,
    propertyName: string
  ): void {
    let sourceValues = source[propertyName];
    if (!sourceValues) return;

    let targetValues = target[propertyName];
    if (!targetValues) targetValues = target[propertyName] = {};

    for (let valuePropertyName in sourceValues) {
      if (targetValues[valuePropertyName]) {
        // Properties have first-writer-wins semantics.
        continue;
      }

      targetValues[valuePropertyName] = sourceValues[valuePropertyName];
    }
  }

  public static merge(
    x: VisualObjectInstanceEnumeration,
    y: VisualObjectInstanceEnumeration
  ): VisualObjectInstanceEnumerationObject {
    let xNormalized = ObjectEnumerationBuilder.normalize(x);
    let yNormalized = ObjectEnumerationBuilder.normalize(y);

    if (!xNormalized || !yNormalized) return xNormalized || yNormalized;

    let xCategoryCount = xNormalized.containers
      ? xNormalized.containers.length
      : 0;

    for (let yInstance of yNormalized.instances) {
      xNormalized.instances.push(yInstance);

      if (yInstance.containerIdx != null)
        yInstance.containerIdx += xCategoryCount;
    }

    let yContainers = yNormalized.containers;
    if (!isEmpty(yContainers)) {
      if (xNormalized.containers)
        Array.prototype.push.apply(xNormalized.containers, yContainers);
      else xNormalized.containers = yContainers;
    }

    return xNormalized;
  }

  public static normalize(
    x: VisualObjectInstanceEnumeration
  ): VisualObjectInstanceEnumerationObject {
    if (isArray(x)) {
      return { instances: <VisualObjectInstance[]>x };
    }

    return <VisualObjectInstanceEnumerationObject>x;
  }

  public static getContainerForInstance(
    enumeration: VisualObjectInstanceEnumerationObject,
    instance: VisualObjectInstance
  ): VisualObjectInstanceContainer | undefined {
    return enumeration.containers[instance.containerIdx];
  }



  public static selectorEquals(x: Selector, y: Selector): boolean {
    // Normalize falsy to null
    x = x || null;
    y = y || null;

    if (x === y) return true;

    if (!x !== !y) return false;

    if (x.id !== y.id) return false;
    if (x.metadata !== y.metadata) return false;

    return true;
  }
}
