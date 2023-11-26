/** @odoo-module */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ChartRenderer } from "./chart_renderer/chart_renderer";
const { Component, useState, onMounted } = owl;

export class OwlMyModel extends Component {
    setup() {
        this.state = useState({
            dataReady: false,
            labels: [],
            datasets: []
        });
        this.orm = useService("orm");

        onMounted(() => {
            this.fetchData();
        });
    }

    async fetchData() {
        const data = await this.orm.call("my.model", "search_read", [[]]);
        if (data && data.length) {
            this.state.labels = data.map((record) => record.time);
            const field1Data = data.map((record) => record.field1);
            const field2Data = data.map((record) => record.field2);
            this.state.datasets = [
                {
                    label: "Field 1",
                    data: field1Data,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                },
                {
                    label: "Field 2",
                    data: field2Data,
                    borderColor: "rgb(54, 162, 235)",
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                },
            ];
            this.state.dataReady = true; // Flag to indicate data is ready
        }
    }
}

OwlMyModel.template = "owl.OwlMyModel";
OwlMyModel.components = { ChartRenderer };

registry.category("actions").add("owl.my_report", OwlMyModel);
