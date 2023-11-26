from odoo import models, fields, api
from dateutil.relativedelta import relativedelta
from dateutil.rrule import rrule, MONTHLY
import datetime

class ContactSalesReport(models.TransientModel):
    _name = 'contact.sales.report'
    _description = 'Contact Sales Report Wizard'

    def _calculate_sales(self, fromDate, toDate):
        # Convert string dates to datetime objects
        fromDate_dt = datetime.datetime.strptime(fromDate, '%Y-%m-%d')
        toDate_dt = datetime.datetime.strptime(toDate, '%Y-%m-%d')

        new_customers = self.env['res.partner'].search([('create_date', '>=', fromDate), ('create_date', '<=', toDate)])
        old_customers = self.env['res.partner'].search([('create_date', '<=', fromDate)])

        monthly_sales = {}
        for dt in rrule(MONTHLY, dtstart=fromDate_dt, until=toDate_dt):
            month_str = dt.strftime("%Y-%m")
            monthly_sales[month_str] = {
                'new_sales': self._sum_sales_for_month(new_customers, dt, dt + relativedelta(months=1)),
                'old_sales': self._sum_sales_for_month(old_customers, dt, dt + relativedelta(months=1))
            }
        return monthly_sales

    def _sum_sales_for_month(self, customers, date_from, date_to):
        total_sales = 0
        if customers:
            domain = [
                ('partner_id', 'in', customers.ids),
                ('state', 'in', ['sale', 'done']),
                ('date_order', '>=', date_from),
                ('date_order', '<', date_to)
            ]   
            sales = self.env['sale.order'].search(domain)
            total_sales = sum(sale.amount_total for sale in sales)
        return total_sales

    @api.model
    def generate_report(self, fromDate, toDate):
        monthly_sales = self._calculate_sales(fromDate,toDate)
        return monthly_sales