/** @odoo-module */

import { registry } from "@web/core/registry"
import { useService } from "@web/core/utils/hooks";
import { KpiCard } from "./kpi_card/kpi_card"
const { Component, useRef, onMounted, useState } = owl

export class OwlSalesDashboard extends Component {
    setup(){
        this.state = useState({
            fromDate: '',
            toDate: '',
        });
        this.orm = useService("orm");
        this.card_state = useState({
            kpiVisible: false,
        });
    }

    confirmSelection() {
        this.fetchPartnerCounts();
        this.card_state.kpiVisible = true;
    }

    async fetchPartnerCounts() {    
        let response = await this.orm.call('contact.report', 'generate_report',[this.state.fromDate, this.state.toDate]);
        if (response) {
            this.state.currentYearPartnersCount = response.current_year_count;
            this.state.previousYearPartnersCount = response.previous_year_count;
        }
    }

    get previousPeriod() {
        if (this.state.fromDate && this.state.toDate) {
          let fromDate = new Date(this.state.fromDate);
          let toDate = new Date(this.state.toDate);
    
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          toDate.setFullYear(toDate.getFullYear() - 1);
    
          return {
            from: fromDate.toISOString().split('T')[0],
            to: toDate.toISOString().split('T')[0]
          };
        }
        return { from: '', to: '' };
      }
    
}

OwlSalesDashboard.template = "owl.OwlSalesDashboard"
OwlSalesDashboard.components = { KpiCard }

registry.category("actions").add("owl.sales_dashboard", OwlSalesDashboard)