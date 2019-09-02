import { buildZoomablePackedCircleChart } from "~charts/ministries";

const chart = buildZoomablePackedCircleChart();

// Just append this to the body tag for the time being.
document.getElementsByTagName("body")[0].appendChild(chart);
