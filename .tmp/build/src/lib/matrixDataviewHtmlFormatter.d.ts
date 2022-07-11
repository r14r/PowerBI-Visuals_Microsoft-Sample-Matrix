import "./../../style/visual.less";
import powerbi from "powerbi-visuals-api";
export declare class MatrixDataviewHtmlFormatter {
    static formatDataViewMatrix(matrix: powerbi.DataViewMatrix): string;
    private static countColumnNodeLeaves;
    private static formatColumnNodes;
    private static formatRowNodes;
}
