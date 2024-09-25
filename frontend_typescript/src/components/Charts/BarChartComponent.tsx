// BarChartComponent.tsx
import { BarChart } from "@mui/x-charts";
import {
    mangoFusionPalette,
    mangoFusionPaletteDark,
} from "@mui/x-charts/colorPalettes";

interface BarChartComponentProps {
    xAxisData: string[];
    seriesData: { series: { data: number[] }[] };
    height: number;
    label: string;
}

const currencyFormatter = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
}).format;

const getColors = (countOf: number) => {
    const colors = [];
    for (let i = 0; i < countOf; i++) {
        colors.push(mangoFusionPaletteDark[i % mangoFusionPaletteDark.length]);
    }
    // console.log(colors);
    return colors;
};

const BarChartComponent: React.FC<BarChartComponentProps> = ({
    xAxisData,
    seriesData,
    height,
    label,
}) => {
    return (
        <BarChart
            xAxis={[
                {
                    scaleType: "band",
                    data: xAxisData,
                    colorMap: {
                        type: "ordinal",
                        colors: getColors(xAxisData.length),
                    },
                },
            ]}
            series={seriesData.series.map((series) => ({
                ...series,
                valueFormatter: (v) => (v === null ? "" : currencyFormatter(v)),
            }))}
            height={height}
            grid={{
                vertical: true,
                horizontal: true,
            }}
            colors={mangoFusionPalette}
        />
    );
};

export default BarChartComponent;
