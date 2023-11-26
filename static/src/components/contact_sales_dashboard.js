/** @odoo-module */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ChartRenderer } from "./chart_renderer/chart_renderer"
import { KpiCard } from "./kpi_card/kpi_card";
import { loadJS } from "@web/core/assets";
const { Component, useState, onWillStart, useRef, onMounted } = owl;

export class OwlContactSalesDashboard extends Component {
    setup() {
        this.state = useState({
            fromDate: "",
            toDate: "",
            currentYearData: {},
            previousYearData: {},
            kpiVisible: false,
            chartProps: null,
        });
        this.charts = useState({
            labels: [],
            datasets: [],
        });
        this.orm = useService("orm");
        this.chartRef = useRef("chartContainer");
    }

    confirmSelection() {
        const currentYearPromise = this.fetchDataForYear(
            this.state.fromDate,
            this.state.toDate,
            "currentYearData"
        );
        const previousPeriod = this.previousPeriod;
        const previousYearPromise = this.fetchDataForYear(
            previousPeriod.from,
            previousPeriod.to,
            "previousYearData"
        );

        Promise.all([currentYearPromise, previousYearPromise])
            .then(() => {
                this.state.kpiVisible = true;
                this.updateKPIs();
                this.renderLineChart();
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    async fetchDataForYear(fromDate, toDate, target) {
        let response = await this.orm.call(
            "contact.sales.report",
            "generate_report",
            [fromDate, toDate]
        );
        if (response) {
            this.state[target] = response;
            this.updateKPIs();
        }
    }

    renderLineChart() {
        this.charts.labels = Object.keys(this.state.currentYearData);
        const currentYearSales = Object.values(this.state.currentYearData).map(
            (data) => data.new_sales
        );
        const previousYearSales = Object.values(
            this.state.previousYearData
        ).map((data) => data.new_sales);

        this.charts.datasets = [
            {
                label: "Current Year Sales",
                data: currentYearSales,
                borderColor: "rgb(54, 162, 235)",
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                fill: false,
            },
            {
                label: "Previous Year Sales",
                data: previousYearSales,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                fill: false,
            },
        ];
    }

    updateKPIs() {
        if (this.state.currentYearData && this.state.previousYearData) {
            this.state.currentYearTotal = this.calculateTotal(
                this.state.currentYearData
            );
            this.state.previousYearTotal = this.calculateTotal(
                this.state.previousYearData
            );

            this.state.changeNewContacts =
                this.state.currentYearTotal.new_sales -
                this.state.previousYearTotal.new_sales;
            this.state.changeExistingContacts =
                this.state.currentYearTotal.old_sales -
                this.state.previousYearTotal.old_sales;

            this.state.percentageChangeNewContacts =
                this.calculatePercentageChange(
                    this.state.currentYearTotal.new_sales,
                    this.state.previousYearTotal.new_sales
                );
            this.state.percentageChangeExistingContacts =
                this.calculatePercentageChange(
                    this.state.currentYearTotal.old_sales,
                    this.state.previousYearTotal.old_sales
                );
        }
    }

    calculateTotal(data) {
        return Object.values(data).reduce(
            (totals, monthly) => ({
                new_sales: totals.new_sales + monthly.new_sales,
                old_sales: totals.old_sales + monthly.old_sales,
            }),
            { new_sales: 0, old_sales: 0 }
        );
    }

    calculatePercentageChange(current, previous) {
        if (previous === 0) return "N/A"; // Handle divide by zero
        return (((current - previous) / previous) * 100).toFixed(2) + "%";
    }

    get previousPeriod() {
        if (this.state.fromDate && this.state.toDate) {
            let fromDate = new Date(this.state.fromDate);
            let toDate = new Date(this.state.toDate);

            fromDate.setFullYear(fromDate.getFullYear() - 1);
            toDate.setFullYear(toDate.getFullYear() - 1);

            return {
                from: fromDate.toISOString().split("T")[0],
                to: toDate.toISOString().split("T")[0],
            };
        }
        return { from: "", to: "" };
    }
}

OwlContactSalesDashboard.template = "owl.OwlContactSalesDashboard";
OwlContactSalesDashboard.components = { KpiCard, ChartRenderer };

registry
    .category("actions")
    .add("owl.contact_sales_dashboard", OwlContactSalesDashboard);
