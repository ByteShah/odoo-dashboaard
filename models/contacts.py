# -*- coding: utf-8 -*-

from odoo import models, fields, api
from dateutil.relativedelta import relativedelta
from odoo.exceptions import UserError

class ContactReport(models.TransientModel):
    _name = 'contact.report'
    _description = 'Contact Report Wizard'

    @api.model
    def generate_report(self, fromDate, toDate):
        if fromDate > toDate:
            raise UserError("Start Date must be less than End Date.")

        domain_current_year = [
            ('create_date', '>=', fromDate),
            ('create_date', '<=', toDate)
        ]
        partners_count_current_year = self.env['res.partner'].search_count(domain_current_year)

        previous_year_from = fields.Date.from_string(fromDate) - relativedelta(years=1)
        previous_year_to = fields.Date.from_string(toDate) - relativedelta(years=1)
        domain_previous_year = [
            ('create_date', '>=', previous_year_from),
            ('create_date', '<=', previous_year_to)
        ]
        partners_count_previous_year = self.env['res.partner'].search_count(domain_previous_year)

        return {
            'current_year_count': partners_count_current_year,
            'previous_year_count': partners_count_previous_year
        }
