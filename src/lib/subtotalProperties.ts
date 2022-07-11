"use strict";

// import "./../style/visual.less";

import powerbi from "powerbi-visuals-api";

/*
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
*/

/* TODO */
type DataViewObjectPropertyReference = any;

/**/
export class SubtotalProperties {
  public static readonly ObjectSubTotals: string = "subTotals";

  public static rowSubtotals: any /* DataViewObjectPropertyReference<boolean> */  = {
    propertyIdentifier: {
      objectName: SubtotalProperties.ObjectSubTotals,
      propertyName: "rowSubtotals",
    },
    defaultValue: true,
  };

  public static rowSubtotalsPerLevel: any /* DataViewObjectPropertyReference<boolean> */ =
    {
      propertyIdentifier: {
        objectName: SubtotalProperties.ObjectSubTotals,
        propertyName: "perRowLevel",
      },
      defaultValue: false,
    };

  public static columnSubtotals: any /* DataViewObjectPropertyReference<boolean> */  = {
    propertyIdentifier: {
      objectName: SubtotalProperties.ObjectSubTotals,
      propertyName: "columnSubtotals",
    },
    defaultValue: true,
  };

  public static columnSubtotalsPerLevel: any /* DataViewObjectPropertyReference<boolean> */  =
    {
      propertyIdentifier: {
        objectName: SubtotalProperties.ObjectSubTotals,
        propertyName: "perColumnLevel",
      },
      defaultValue: false,
    };

  public static levelSubtotalEnabled: any /* DataViewObjectPropertyReference<boolean> */  =
    {
      propertyIdentifier: {
        objectName: SubtotalProperties.ObjectSubTotals,
        propertyName: "levelSubtotalEnabled",
      },
      defaultValue: true,
    };
}
