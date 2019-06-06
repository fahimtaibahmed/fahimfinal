export interface PredictionData {
    glucose: number;

    // diabetes pedigree function
    diabetes: number;
}

export const StatsBarChart: PredictionData[] = [
    {glucose: 148, diabetes: 0.627},
    {glucose: 85, diabetes: 0.351},
    {glucose: 183, diabetes: 0.672},
    {glucose: 89, diabetes: 0.167},
    {glucose: 137, diabetes: 2.288},
    {glucose: 116, diabetes: 0.201},
    {glucose: 78, diabetes: 0.248},
    {glucose: 115, diabetes: 0.134}
];
