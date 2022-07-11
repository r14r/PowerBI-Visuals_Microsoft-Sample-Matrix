"use strict";

import "./../style/visual.less";

import * as d3 from "d3";

import powerbi from "powerbi-visuals-api";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

import DataView = powerbi.DataView;
import DataViewHierarchyLevel = powerbi.DataViewHierarchyLevel;
import DataViewObject = powerbi.DataViewObject;
import DataViewObjects = powerbi.DataViewObjects;

import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

/**/
import { MatrixDataviewHtmlFormatter} from './lib/matrixDataviewHtmlFormatter';
import { SubtotalProperties } from './lib/subtotalProperties';
import { ObjectEnumerationBuilder } from './lib/objectEnumerationBuilder';

/* TODO */
type DataViewObjectPropertyReference = any;
type Selector = any;

/**/
import { VisualSettings } from "./lib/settings/settings";

import {debug } from './lib/utilities/helper';

/**/
export class Visual implements IVisual {
  private target: HTMLElement;
  private dataView: DataView;

  constructor(options: VisualConstructorOptions) {
    debug(2, "constructor: options=", options);
    this.target = options.element;
  }

  public update(options: VisualUpdateOptions) {
    debug(2, "update: options=", options);

    if (!options) {
      return;
    }

    if (options.type & powerbi.VisualUpdateType.Data) {
      debug(2, "update: dataViews=", options.dataViews);
      debug(2, "update: dataViews[0] =", options.dataViews[0]);
      debug(2, "update: dataViews[0].matrix =", options.dataViews[0].matrix);
      debug(2, "update: dataViews[0] rows length=", options.dataViews[0].matrix.rows.root.children.length);
      debug(2, "update: dataViews[0] cols length=", options.dataViews[0].matrix.columns.root.children.length);
      
      if (
        !options.dataViews ||
        !options.dataViews[0] ||
        !options.dataViews[0].matrix ||
        !options.dataViews[0].matrix.rows ||
        !options.dataViews[0].matrix.rows.root ||
        !options.dataViews[0].matrix.rows.root.children ||
        !options.dataViews[0].matrix.rows.root.children.length ||
        !options.dataViews[0].matrix.columns ||
        !options.dataViews[0].matrix.columns.root ||
        !options.dataViews[0].matrix.columns.root.children ||
        !options.dataViews[0].matrix.columns.root.children.length
      ) {
        this.dataView = undefined;

        debug(2, "update undefined");

        return;
      }
 
      this.dataView = options.dataViews[0];
      this.target.innerHTML = MatrixDataviewHtmlFormatter.formatDataViewMatrix(
        options.dataViews[0].matrix
      );
    }
  }

  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    let enumeration = new ObjectEnumerationBuilder();

    // Visuals are initialized with an empty data view before queries are run, therefore we need to make sure that
    // we are resilient here when we do not have data view.
    if (this.dataView) {
      let objects = null;
      if (this.dataView && this.dataView.metadata) {
        objects = this.dataView.metadata.objects;
      }

      switch (options.objectName) {
        case "general":
          break;
        case SubtotalProperties.ObjectSubTotals:
          this.enumerateSubTotalsOptions(enumeration, objects);
          break;
        default:
          break;
      }
    }

    return enumeration.complete();
  }

  public enumerateSubTotalsOptions(
    enumeration,
    objects: DataViewObjects
  ): void {
    let instance = this.createVisualObjectInstance(
      SubtotalProperties.ObjectSubTotals
    );
    let rowSubtotalsEnabled: boolean | unknown= Visual.setInstanceProperty(
      objects,
      SubtotalProperties.rowSubtotals,
      instance
    );
    let columnSubtotalsEnabled: boolean | unknown = Visual.setInstanceProperty(
      objects,
      SubtotalProperties.columnSubtotals,
      instance
    );
    enumeration.pushInstance(instance);

    if (rowSubtotalsEnabled) {
      // Per row level
      instance = this.createVisualObjectInstance(
        SubtotalProperties.ObjectSubTotals
      );
      let perLevel = Visual.setInstanceProperty(
        objects,
        SubtotalProperties.rowSubtotalsPerLevel,
        instance
      );
      enumeration.pushInstance(instance, /* mergeInstances */ false);

      if (perLevel)
        this.enumeratePerLevelSubtotals(
          enumeration,
          this.dataView.matrix.rows.levels
        );
    }

    if (columnSubtotalsEnabled) {
      // Per column level
      instance = this.createVisualObjectInstance(
        SubtotalProperties.ObjectSubTotals
      );
      let perLevel = Visual.setInstanceProperty(
        objects,
        SubtotalProperties.columnSubtotalsPerLevel,
        instance
      );
      enumeration.pushInstance(instance, /* mergeInstances */ false);

      if (perLevel)
        this.enumeratePerLevelSubtotals(
          enumeration,
          this.dataView.matrix.columns.levels
        );
    }
  }

  private enumeratePerLevelSubtotals(
    enumeration,
    hierarchyLevels: DataViewHierarchyLevel[]
  ) {
    for (let level of hierarchyLevels) {
      for (let source of level.sources) {
        if (!source.isMeasure) {
          let instance = this.createVisualObjectInstance(
            SubtotalProperties.ObjectSubTotals,
            { metadata: source.queryName },
            source.displayName
          );
          Visual.setInstanceProperty(
            source.objects,
            SubtotalProperties.levelSubtotalEnabled,
            instance
          );
          enumeration.pushInstance(instance, /* mergeInstances */ false);
        }
      }
    }
  }

  private createVisualObjectInstance(
    objectName: string,
    selector: Selector = null,
    displayName?: string
  ): VisualObjectInstance {
    let instance: VisualObjectInstance = {
      selector: selector,
      objectName: objectName,
      properties: {},
    };

    if (displayName != null) instance.displayName = displayName;

    return instance;
  }

  private static getPropertyValue<T>(
    objects: DataViewObjects,
    dataViewObjectPropertyReference: any /* DataViewObjectPropertyReference<T> */
  ): T {
    let object;
    if (objects) {
      object =
        objects[dataViewObjectPropertyReference.propertyIdentifier.objectName];
    }
    return Visual.getValue(
      object,
      dataViewObjectPropertyReference.propertyIdentifier.propertyName,
      dataViewObjectPropertyReference.defaultValue
    );
  }

  private static setInstanceProperty<T>(
    objects: DataViewObjects,
    dataViewObjectPropertyReference: any /* DataViewObjectPropertyReference<T> */,
    instance: VisualObjectInstance
  ): T | unknown{
    let value = this.getPropertyValue(objects, dataViewObjectPropertyReference);
    if (instance && instance.properties) {
      instance.properties[
        dataViewObjectPropertyReference.propertyIdentifier.propertyName
      ] = value;
    }
    return value;
  }

  private static getValue<T>(
    object: DataViewObject,
    propertyName: string,
    defaultValue?: T,
    instanceId?: string
  ): T {
    if (!object) return defaultValue;

    if (instanceId) {
      const instances = object.$instances;
      if (!instances) return defaultValue;

      const instance = instances[instanceId];
      if (!instance) return defaultValue;

      object = instance;
    }

    let propertyValue = <T>object[propertyName];
    if (propertyValue === undefined) return defaultValue;

    return propertyValue;
  }
}
