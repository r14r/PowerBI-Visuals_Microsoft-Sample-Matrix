"use strict";

import "./../../style/visual.less";


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

export class MatrixDataviewHtmlFormatter {
  public static formatDataViewMatrix(matrix: powerbi.DataViewMatrix): string {
    let htmlString = "<div class='datagrid'><table>";
    let levelToColumnNodesMap: any[][] = [];
    MatrixDataviewHtmlFormatter.countColumnNodeLeaves(
      matrix.columns.root,
      levelToColumnNodesMap
    );
    htmlString += MatrixDataviewHtmlFormatter.formatColumnNodes(
      matrix.columns.root,
      levelToColumnNodesMap
    );
    htmlString += MatrixDataviewHtmlFormatter.formatRowNodes(matrix.rows.root);
    return (htmlString += "</table></div>");
  }

  private static countColumnNodeLeaves(
    root,
    levelToColumnNodesMap: any[][]
  ): number {
    if (!(typeof root.level === "undefined" || root.level === null)) {
      if (!levelToColumnNodesMap[root.level]) {
        levelToColumnNodesMap[root.level] = [root];
      } else {
        levelToColumnNodesMap[root.level].push(root);
      }
    }
    let leafCount;
    if (root.isSubtotal || !root.children) {
      return (leafCount = 1);
    } else {
      leafCount = 0;
      for (let child of root.children) {
        leafCount += MatrixDataviewHtmlFormatter.countColumnNodeLeaves(
          child,
          levelToColumnNodesMap
        );
      }
    }
    return (root.leafCount = leafCount);
  }

  private static formatColumnNodes(
    root,
    levelToColumnNodesMap: any[][]
  ): string {
    let res = "";
    for (let level = 0; level < levelToColumnNodesMap.length; level++) {
      let levelNodes = levelToColumnNodesMap[level];
      res += "<tr>";
      res += "<th></th>";
      for (let i = 0; i < levelNodes.length; i++) {
        let node = levelNodes[i];
        res += "<th colspan='" + node.leafCount + "' >";
        res += node.isSubtotal ? "Totals" : node.value;
        res += "</th>";
      }
      res += "</tr>";
    }
    return res;
  }

  private static formatRowNodes(root): string {
    let res = "";
    if (!(typeof root.level === "undefined" || root.level === null)) {
      res += "<tr><th>";
      for (let level = 0; level < root.level; level++) {
        res += "&nbsp;&nbsp;&nbsp;&nbsp;";
      }
      res += root.isSubtotal ? "Totals" : root.value;
      res += "</th>";
      if (root.values) {
        for (
          let i = 0;
          !(typeof root.values[i] === "undefined" || root.values[i] === null);
          i++
        ) {
          res += "<td>" + root.values[i].value + "</td>";
        }
      }
      res += "</tr>";
    }
    if (root.children) {
      for (let child of root.children) {
        res += MatrixDataviewHtmlFormatter.formatRowNodes(child);
      }
    }
    return res;
  }
}
