import React from "react";
import { PieChart } from "@mui/x-charts";

interface PieChartComponentProps {
    pieCategoriesValueSeries: {
        category: string;
        value: number;
    }[];
    highlightedItem: string;
    setHighLightedItem: (highlightedItem: string) => void;
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({
    pieCategoriesValueSeries,
    highlightedItem,
    setHighLightedItem,
}) => {
    return (
        <PieChart
            series={[
                {
                    data: pieCategoriesValueSeries,
                },
            ]}
            height={500}
            grid={{
                vertical: true,
                horizontal: true,
            }}
            colors={mangoFusionPalette}
            highlightedItem={highlightedItem}
            onHighlightChange={setHighLightedItem}
        />
    );
};

export default PieChartComponent;
